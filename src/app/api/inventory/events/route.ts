import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { verifySignature } from "@/lib/signature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/inventory/events
 *
 * Inventory tells us stock moved. Before this, the storefront asked —
 * `next: { revalidate: 5 }` on every catalogue call, which is a fetch
 * per path per instance every five seconds, and still shows a number
 * that can be five seconds wrong.
 *
 * Now the catalogue is cached properly and thrown away when the thing
 * it describes actually changes. Less traffic and fresher figures, at
 * the same time, which is unusual enough to be worth saying out loud.
 *
 * ── What this endpoint will NOT do ──
 *
 * It does not write stock, price, or anything about a product into
 * this database. Inventory owns all of that; a second copy here would
 * be a second source of truth, and the stale one always wins in the
 * end. The only thing that happens is cache invalidation: the next
 * reader fetches from Inventory and gets the truth.
 *
 * That is also why a malformed payload is not very dangerous here. The
 * worst a forged event could do is make us re-read the catalogue.
 * It is still signed, because an endpoint that invalidates caches on
 * demand is a free denial-of-service otherwise.
 *
 * ── The envelope ──
 *
 *   headers  X-Inventory-Signature: t=<unix>,v1=<hmac over t.body>
 *            X-Inventory-Delivery:  <stable across retries>
 *            X-Inventory-Event:     stock.changed
 *   body     { id, event, attempt, data }
 *
 * Inventory retries anything that is not 2xx, so this answers 200 to
 * a duplicate rather than an error — an error would make it retry a
 * delivery we have already handled, forever.
 */

/** Which events this receiver knows what to do with. */
const HANDLED = new Set(["stock.changed", "stock.low"]);

function adminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "The inventory event receiver needs SUPABASE_URL and " +
      "SUPABASE_SERVICE_ROLE_KEY (server-side only — never NEXT_PUBLIC_).",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  // The raw bytes, because the signature covers exactly what was sent.
  const body = await req.text();

  const check = verifySignature(
    body,
    req.headers.get("x-inventory-signature"),
    // Its own secret, separate from the two logistics ones. One secret
    // per direction per peer: a leak of any of them cannot be used
    // anywhere else, and any of them can be rotated alone.
    process.env.INVENTORY_WEBHOOK_SECRET,
  );

  if (!check.ok) {
    // Terse to the caller, detailed in the log. `not_configured` is
    // the one worth shouting about: it means this endpoint is live and
    // refusing everything, which looks identical to a wrong secret
    // from Inventory's side.
    console.warn("[inventory] rejected an event:", check.reason, "—", check.detail);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let envelope: { id?: unknown; event?: unknown; data?: unknown };
  try {
    envelope = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "body is not JSON" }, { status: 400 });
  }

  const deliveryId = String(envelope.id ?? req.headers.get("x-inventory-delivery") ?? "");
  const event = String(envelope.event ?? req.headers.get("x-inventory-event") ?? "");
  const data = (envelope.data ?? {}) as Record<string, unknown>;

  if (!deliveryId || !event) {
    return NextResponse.json(
      { error: "id and event are required" }, { status: 400 });
  }

  const skuCode = data.sku_code == null ? null : String(data.sku_code);
  const locationCode = data.location_code == null ? null : String(data.location_code);

  const db = adminClient();

  // ── 1. Have we seen this delivery before? ──
  //
  // Claimed first. A retry collides here and is answered 200, which is
  // what a sender retrying after a lost response needs — not a second
  // invalidation, and not an error that makes it retry forever.
  const { error: claimErr } = await db
    .from("inventory_event")
    .insert({
      delivery_id: deliveryId,
      event,
      sku_code: skuCode,
      location_code: locationCode,
      payload: data,
    });

  if (claimErr) {
    if (claimErr.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
    }
    console.error("[inventory] could not record the event:", claimErr.message);
    // 5xx on purpose: our fault, and retrying may well work.
    return NextResponse.json({ error: "could not record the event" }, { status: 503 });
  }

  // ── 2. Act on it ──
  if (!HANDLED.has(event)) {
    // Recorded and acknowledged. Returning an error would make
    // Inventory retry an event we are never going to do anything with,
    // and a subscription we did not ask for is not a failure.
    return NextResponse.json({ ok: true, ignored: event }, { status: 200 });
  }

  const tags: string[] = [];

  if (event === "stock.changed" && locationCode) {
    // Coarse on purpose. The catalogue list, the category pages and
    // the product pages for one shop all carry this tag, so one
    // movement refreshes that shop and touches no other.
    //
    // Per-SKU tagging would be tighter, but a product is fetched by
    // slug OR sku and the event only carries the sku — so a per-SKU
    // tag would miss exactly the page a customer is looking at.
    tags.push(`stock:${locationCode}`);
  }

  for (const tag of tags) {
    // `profile` is not optional in practice: calling revalidateTag with
    // one argument is deprecated in this version of Next and expires
    // the entry immediately, making the next request a blocking cache
    // miss. "max" is stale-while-revalidate — the next reader gets the
    // cached page at once and the fresh one lands behind them.
    //
    // updateTag() would give read-your-own-writes instead, but it can
    // only be called from a Server Action, and this is a Route Handler.
    revalidateTag(tag, "max");
  }

  return NextResponse.json(
    { ok: true, event, revalidated: tags }, { status: 200 });
}

/** Anything else is a mistake worth naming rather than a 404. */
export function GET() {
  return NextResponse.json(
    { error: "POST a signed Inventory event here" }, { status: 405 });
}
