import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/logistics/status
 *
 * The first HTTP endpoint this application has ever had.
 *
 * Logistics calls it when a customer-visible thing happens to their
 * delivery: it is being packed, it is on its way, it arrived, it did
 * not arrive. Before this existed, the order page showed "Delivered"
 * from the moment the order was paid for, because nothing in this
 * database had ever recorded anything else.
 *
 * ── What this endpoint will NOT do ──
 *
 * It does not accept a price, a total, an item, an address or a
 * customer id. Logistics does not own any of those and must not be
 * able to change them, whatever it sends. The only fields read off
 * the body are the delivery's own state.
 *
 * ── Three ways a status update can be wrong ──
 *
 *  1. Forged. Answered by the signature.
 *  2. Replayed. A captured request expires after five minutes, and a
 *     repeat of a genuine one is recognised by its event id.
 *  3. Overtaken. At-least-once delivery guarantees nothing about
 *     ORDER, so a retried "out for delivery" can land after
 *     "delivered". Answered by the sequence check.
 *
 * The third is the one that looks like it works in testing and goes
 * wrong on a bad network, in front of a customer, on the only status
 * that matters.
 */

const TOLERANCE_SECONDS = 300;

/** The four steps OrderPipeline can render. */
const STEPS = new Set(["placed", "packed", "out_for_delivery", "delivered"]);
/** What orders.status is allowed to become. */
const STATUSES = new Set(["PAID", "SHIPPED", "DELIVERED", "CANCELLED"]);

function adminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "The logistics status receiver needs SUPABASE_URL and " +
      "SUPABASE_SERVICE_ROLE_KEY (server-side only — never NEXT_PUBLIC_).",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Verify `t=<unix>,v1=<hmac over t.body>`.
 *
 * The same scheme, in the same shape, as the signature this app
 * already PUTS on its handoff to logistics — and as the inventory
 * system's webhooks. One scheme across three systems means one thing
 * to learn and no chance of two implementations disagreeing about
 * what valid means.
 */
function verify(body: string, header: string | null): string | null {
  // NOT LOGISTICS_WEBHOOK_SECRET, which signs traffic going the other
  // way. One secret per direction: a leaked receiver secret cannot
  // then be used to place orders, and either can be rotated alone.
  const secret = process.env.LOGISTICS_INBOUND_SECRET;
  if (!secret) return "receiver is not configured";
  if (!header) return "signature header missing";

  const parts: Record<string, string> = {};
  for (const p of header.split(",")) {
    const i = p.indexOf("=");
    if (i > 0) parts[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  }

  const t = Number(parts.t);
  if (!t || !parts.v1) return "signature header malformed";

  // A replay of a genuine, correctly-signed request is still a replay.
  // Age is part of validity, and because the timestamp is inside the
  // MAC the age cannot be edited either.
  const drift = Math.abs(Date.now() / 1000 - t);
  if (drift > TOLERANCE_SECONDS) {
    return `timestamp is ${Math.round(drift)}s away from ours (tolerance ${TOLERANCE_SECONDS}s)`;
  }

  const want = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  const a = Buffer.from(want, "hex");
  const b = Buffer.from(parts.v1, "hex");

  // Length first: timingSafeEqual throws on a mismatch.
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "signature does not match";
  return null;
}

export async function POST(req: NextRequest) {
  // The raw bytes, because the signature covers exactly what was sent.
  // Re-serialising parsed JSON can reorder keys and produce a
  // mismatch that looks identical to a wrong secret.
  const body = await req.text();

  const bad = verify(body, req.headers.get("x-logistics-signature"));
  if (bad) {
    // Deliberately terse to the caller; the detail is in the log.
    console.warn("[logistics] rejected a status update:", bad);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let e: Record<string, unknown>;
  try {
    e = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "body is not JSON" }, { status: 400 });
  }

  const eventId = String(e.event_id ?? "");
  const orderId = String(e.external_order_id ?? "");
  const sequence = Number(e.sequence);
  const status = e.customer_status == null ? null : String(e.customer_status);
  const step = e.pipeline_step == null ? null : String(e.pipeline_step);

  if (!eventId || !orderId || !Number.isFinite(sequence)) {
    return NextResponse.json(
      { error: "event_id, external_order_id and sequence are required" }, { status: 400 });
  }

  // Refuse anything this schema cannot hold, rather than letting a
  // CHECK constraint fail halfway through and leave the customer on
  // whatever they last saw.
  if (status !== null && !STATUSES.has(status)) {
    return NextResponse.json({ error: `unknown customer_status "${status}"` }, { status: 400 });
  }
  if (step !== null && !STEPS.has(step)) {
    return NextResponse.json({ error: `unknown pipeline_step "${step}"` }, { status: 400 });
  }

  const db = adminClient();

  // ── 1. Idempotency ──
  //
  // Claim the event id first. A duplicate collides here and is
  // answered identically, which is what a caller retrying after a
  // lost response needs — not a second write, and not an error that
  // makes it retry forever.
  const { error: claimErr } = await db
    .from("logistics_status_event")
    .insert({ event_id: eventId, order_id: orderId, sequence });

  if (claimErr) {
    if (claimErr.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
    }
    console.error("[logistics] could not record the event:", claimErr.message);
    // 5xx on purpose: this is our fault and retrying may well work.
    return NextResponse.json({ error: "could not record the event" }, { status: 503 });
  }

  // ── 2. Ordering ──
  const { data: order, error: readErr } = await db
    .from("orders")
    .select("id, status, delivery_status_sequence")
    .eq("id", orderId)
    .maybeSingle();

  if (readErr) {
    console.error("[logistics] could not read the order:", readErr.message);
    return NextResponse.json({ error: "could not read the order" }, { status: 503 });
  }

  if (!order) {
    // 404 is fatal at the sender, which is right: an order id this
    // application does not have will not appear by being retried.
    return NextResponse.json({ error: "no such order" }, { status: 404 });
  }

  // The obvious early exit, kept only as a cheap shortcut. It is NOT
  // the guard — see the conditional UPDATE below for why.
  const held = order.delivery_status_sequence;
  if (held != null && sequence <= Number(held)) {
    return NextResponse.json(
      { ok: true, ignored: "stale", held: Number(held) }, { status: 200 });
  }

  // ── 3. Apply ──
  //
  // Only ever these columns. A total or an address in the body is
  // ignored, because logistics does not own them.
  const patch: Record<string, unknown> = {
    delivery_step: step,
    delivery_message: e.message == null ? null : String(e.message),
    delivery_reason_code: e.reason_code == null ? null : String(e.reason_code),
    delivery_rider_first_name:
      e.rider_first_name == null ? null : String(e.rider_first_name),
    delivery_status_sequence: sequence,
    delivery_status_at: e.occurred_at ? String(e.occurred_at) : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // A CANCELLED order stays cancelled. If somebody cancelled it here
  // while a rider was still moving, a status push must not quietly
  // sell it back to them.
  if (status && order.status !== "CANCELLED") patch.status = status;

  // ── The guard that actually holds ──
  //
  // Comparing the sequence in JavaScript between a read and a write is
  // a read-modify-write race, and the sender makes it likely rather
  // than rare: the outbound worker drains a batch CONCURRENTLY, so two
  // events for one order are routinely in flight together.
  //
  // It happened on the first real run. "delivered" (sequence 21) and
  // "out for delivery" (18) were sent at the same time; both read the
  // stored sequence while it was still 14, both passed the check
  // above, and 18 landed last. The customer's order page said "on its
  // way" for a parcel that had been handed over.
  //
  // So the condition goes in the WHERE clause, where the database
  // applies it atomically. A losing write updates no rows and is
  // reported as stale — which is exactly what it is.
  const { data: updated, error: writeErr } = await db
    .from("orders")
    .update(patch)
    .eq("id", orderId)
    .or(`delivery_status_sequence.is.null,delivery_status_sequence.lt.${sequence}`)
    .select("id, delivery_status_sequence");

  if (writeErr) {
    console.error("[logistics] could not update the order:", writeErr.message);
    return NextResponse.json({ error: "could not update the order" }, { status: 503 });
  }

  if (!updated || updated.length === 0) {
    // Another event for this order won the race and was newer.
    await db.from("logistics_status_event")
      .update({ applied: false }).eq("event_id", eventId);
    return NextResponse.json({ ok: true, ignored: "stale" }, { status: 200 });
  }

  await db.from("logistics_status_event")
    .update({ applied: true }).eq("event_id", eventId);

  return NextResponse.json(
    { ok: true, applied: status ?? step, sequence }, { status: 200 });
}

/** Anything else is a mistake worth naming rather than a 404. */
export function GET() {
  return NextResponse.json(
    { error: "POST a signed delivery status here" }, { status: 405 });
}
