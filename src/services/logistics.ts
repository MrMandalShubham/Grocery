import { createClient } from "@supabase/supabase-js";
import { createHmac, randomUUID } from "node:crypto";

/**
 * Server only.
 *
 * This module holds the service-role key and the webhook signing
 * secret. Importing it from a client component would bundle both into
 * JavaScript served to the browser.
 *
 * The `node:crypto` import above already makes that fail, but it fails
 * with a module-resolution error that says nothing about why. This
 * says why.
 */
if (typeof window !== "undefined") {
  throw new Error(
    "src/services/logistics.ts is server-only — it holds the Supabase " +
    "service-role key and the logistics signing secret. Call it from a " +
    "server action (see notifyLogistics in src/app/actions.ts), never " +
    "from a component.",
  );
}

/**
 * The logistics handoff.
 *
 * Tells the logistics system an order is ready to deliver. It creates
 * a delivery record, verifies with the inventory system that the stock
 * really is held, and hands back a tracking id.
 *
 * ── Why this re-reads the order instead of being handed one ──
 *
 * Checkout already has every field in memory, and passing them
 * straight through would be less code. But the checkout page runs in
 * the browser and writes its own order with the public anon key. A
 * client that can also DESCRIBE that order to a third system is a
 * client that can describe a different one — a different address, a
 * different total.
 *
 * So this reads the order back with the service-role key and publishes
 * what is STORED, not what was claimed.
 *
 * ── The signature ──
 *
 * HMAC-SHA256 over `<unix seconds>.<body>`, the same scheme the
 * inventory system uses for its own webhooks. The timestamp is INSIDE
 * the MAC, so a captured request stops being valid after five minutes
 * and its age cannot be edited either.
 */

function adminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Logistics handoff needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
      "(server-side only — never NEXT_PUBLIC_).",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type OrderRow = {
  id: string;
  user_id: string;
  created_at: string;
  final_amount: number | string;
  payment_method: string | null;
  fulfilment_location_code: string | null;
  delivery_recipient_name: string | null;
  delivery_phone: string | null;
  delivery_line1: string | null;
  delivery_line2: string | null;
  delivery_city: string | null;
  delivery_state: string | null;
  delivery_pincode: string | null;
  delivery_lat: number | string | null;
  delivery_lng: number | string | null;
  delivery_instructions: string | null;
  order_items: {
    external_product_id: string | null;
    sku: string;
    name: string;
    quantity: number;
    reservation_id: string | null;
  }[];
};

/**
 * Shape an order the way the logistics contract expects.
 *
 * Exported separately from the sending so the mapping can be checked
 * without a database or a network call.
 */
export function buildDeliveryReadyEvent(order: OrderRow) {
  const num = (v: number | string | null) =>
    v === null || v === undefined ? null : Number(v);

  return {
    event: "order.delivery_ready",
    event_id: randomUUID(),
    occurred_at: new Date().toISOString(),
    version: "1.0",
    data: {
      external_order_id: order.id,
      external_customer_id: order.user_id,
      placed_at: order.created_at,

      pickup: { location_code: order.fulfilment_location_code },

      delivery_address: {
        recipient_name: order.delivery_recipient_name,
        phone: order.delivery_phone,
        line1: order.delivery_line1,
        line2: order.delivery_line2,
        city: order.delivery_city,
        state: order.delivery_state,
        pincode: order.delivery_pincode,
        lat: num(order.delivery_lat),
        lng: num(order.delivery_lng),
        instructions: order.delivery_instructions,
      },

      items: (order.order_items ?? []).map((i) => ({
        external_product_id: i.external_product_id,
        sku: i.sku,
        name: i.name,
        quantity: i.quantity,
        // Lets logistics stop the stock hold expiring mid-delivery.
        reservation_id: i.reservation_id,
      })),

      payment: {
        method: order.payment_method,
        // Cash on delivery is disabled at checkout, so every order is
        // prepaid today. Sent as a field rather than assumed, so
        // enabling COD later is a change here and nowhere else.
        is_prepaid: order.payment_method !== "COD",
        amount_to_collect_paise: 0,
        // Rupees in this database, paise across the wire — the same
        // integer-only convention the inventory system uses.
        order_total_paise: Math.round(Number(order.final_amount) * 100),
      },
    },
  };
}

/**
 * Publish one order, and record the tracking id it comes back with.
 *
 * Throws on failure. The caller (`notifyLogistics`) swallows it: a
 * logistics outage must never fail a customer's checkout, because the
 * order exists and the stock is held either way.
 */
export async function publishDeliveryReady(orderId: string): Promise<string> {
  const base = process.env.LOGISTICS_API_URL;
  const apiKey = process.env.LOGISTICS_API_KEY;
  const secret = process.env.LOGISTICS_WEBHOOK_SECRET;

  if (!base || !apiKey || !secret) {
    throw new Error(
      "Logistics is not configured: set LOGISTICS_API_URL, LOGISTICS_API_KEY " +
      "and LOGISTICS_WEBHOOK_SECRET.",
    );
  }

  const admin = adminClient();

  const { data, error } = await admin
    .from("orders")
    .select(
      "id, user_id, created_at, final_amount, payment_method, " +
      "fulfilment_location_code, delivery_recipient_name, delivery_phone, " +
      "delivery_line1, delivery_line2, delivery_city, delivery_state, " +
      "delivery_pincode, delivery_lat, delivery_lng, delivery_instructions, " +
      "order_items(external_product_id, sku, name, quantity, reservation_id)")
    .eq("id", orderId)
    .single();

  if (error) throw new Error(`Could not read order ${orderId}: ${error.message}`);
  if (!data) throw new Error(`No such order: ${orderId}`);

  // Cast once, at the boundary. Supabase cannot infer the shape of a
  // nested select from an untyped client, and spreading `as` casts
  // through the function would hide a real mismatch rather than fix it.
  const order = data as unknown as OrderRow;

  const envelope = buildDeliveryReadyEvent(order);
  const body = JSON.stringify(envelope);

  const t = Math.floor(Date.now() / 1000);
  const mac = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  let res: Response;
  try {
    res = await fetch(
      `${base.replace(/\/$/, "")}/api/v1/integration/orders.delivery-ready`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
          "x-logistics-signature": `t=${t},v1=${mac}`,
          // The order id IS the idempotency key, so a retry after a
          // timeout returns the first answer rather than creating a
          // second delivery.
          "idempotency-key": order.id,
        },
        body,
      });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Logistics refused order ${orderId} (${res.status}): ${detail}`);
  }

  const result = await res.json();
  const trackingId: string | undefined = result?.tracking_id;

  if (trackingId) {
    // The column has existed since the first schema and has never been
    // written. It is how an order is matched to its delivery.
    await admin.from("orders")
      .update({ logistics_tracking_id: trackingId, updated_at: new Date().toISOString() })
      .eq("id", order.id);
  }

  return trackingId ?? "";
}

/**
 * Republish orders whose handoff never landed.
 *
 * `notifyLogistics` swallows its failures so a logistics outage cannot
 * fail a checkout — which means an order can end up placed, with stock
 * held, that logistics has never heard of. This finds them.
 *
 * Safe to run repeatedly: publishing is idempotent on the order id.
 *
 * Intended for a scheduled job or an operator. Not called from the
 * request path.
 */
export async function republishMissedOrders(olderThanMinutes = 5, limit = 50) {
  const admin = adminClient();
  const cutoff = new Date(Date.now() - olderThanMinutes * 60_000).toISOString();

  const { data, error } = await admin
    .from("orders")
    .select("id")
    .eq("status", "PAID")
    .is("logistics_tracking_id", null)
    .not("delivery_lat", "is", null)
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw new Error(`Could not list missed orders: ${error.message}`);

  const results: { orderId: string; ok: boolean; detail?: string }[] = [];

  for (const row of data ?? []) {
    try {
      const tracking = await publishDeliveryReady(row.id);
      results.push({ orderId: row.id, ok: true, detail: tracking });
    } catch (e) {
      results.push({
        orderId: row.id, ok: false,
        detail: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return results;
}
