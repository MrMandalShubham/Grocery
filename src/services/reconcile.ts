import { createClient } from "@supabase/supabase-js";

/**
 * Server only.
 *
 * Holds the service-role key. Importing it from a client component
 * would bundle that key into JavaScript served to the browser.
 */
if (typeof window !== "undefined") {
  throw new Error(
    "src/services/reconcile.ts is server-only — it holds the Supabase " +
    "service-role key. Call it from a server action or a script.",
  );
}

function adminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Reconciliation needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
      "(server-side only — never NEXT_PUBLIC_).",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Orders that are still going somewhere. A cancelled or failed order
 *  has no hold worth keeping alive, and a delivered one has already
 *  consumed it. */
const LIVE_STATUSES = ["PAID", "SHIPPED"];

export type HoldResult = {
  orderId: string;
  lineId: string;
  confirmed: number;
  failed: { id: string; error: string }[];
};

/**
 * Confirm holds that checkout never got to.
 *
 * ── What it is cleaning up after ──
 *
 * `confirmOrderInventory` reports its failures instead of throwing,
 * because a confirm that fails must not fail a checkout the customer
 * has already paid for. The cost of that choice is a line that holds
 * stock on a 30-minute clock with nothing stopping it — which is
 * exactly the state every order in this system was in before the
 * confirm call existed.
 *
 * A line is a candidate when it has holds and no
 * `reservation_confirmed_at`. Confirming is idempotent in Inventory —
 * a reservation that is already CONFIRMED returns without doing
 * anything — so a line that actually did confirm and merely failed to
 * record it costs one wasted request and is then stamped correctly.
 *
 * ── What it deliberately does not do ──
 *
 * It does not confirm holds for a CANCELLED or FAILED order. Those
 * holds SHOULD lapse: keeping stock off the shelf for an order nobody
 * is going to deliver is the opposite of the point.
 *
 * Safe to run repeatedly. Intended for a scheduled job or an operator,
 * never the request path.
 */
export async function reconcileHolds(
  olderThanMinutes = 2,
  limit = 200,
): Promise<HoldResult[]> {
  const admin = adminClient();
  const cutoff = new Date(Date.now() - olderThanMinutes * 60_000).toISOString();

  const { data, error } = await admin
    .from("order_items")
    .select("id, order_id, reservation_ids, orders!inner(id, status, created_at)")
    .not("reservation_ids", "is", null)
    .is("reservation_confirmed_at", null)
    .in("orders.status", LIVE_STATUSES)
    .lt("orders.created_at", cutoff)
    .limit(limit);

  if (error) throw new Error(`Could not list unconfirmed holds: ${error.message}`);

  const { confirmReservation } = await import("./inventory");
  const out: HoldResult[] = [];

  for (const row of (data ?? []) as unknown as {
    id: string; order_id: string; reservation_ids: string[];
  }[]) {
    const ids = row.reservation_ids ?? [];
    const failed: { id: string; error: string }[] = [];

    for (const id of ids) {
      try {
        await confirmReservation(id, row.order_id);
      } catch (e) {
        failed.push({ id, error: e instanceof Error ? e.message : String(e) });
      }
    }

    // Stamped only when every hold on the line is settled. A partial
    // success stays a candidate, because the unconfirmed one is still
    // counting down.
    if (failed.length === 0 && ids.length > 0) {
      await admin
        .from("order_items")
        .update({ reservation_confirmed_at: new Date().toISOString() })
        .eq("id", row.id);
    }

    out.push({
      orderId: row.order_id,
      lineId: row.id,
      confirmed: ids.length - failed.length,
      failed,
    });
  }

  return out;
}
