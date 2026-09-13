import { supabase } from "@/lib/supabase";

export type OrderStatus = "placed" | "packed" | "out_for_delivery" | "delivered";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  type: "B2C" | "B2B";
  /** What the delivery system last said, if it has said anything. */
  message?: string | null;
  /** Why it did not arrive. Null on a normal journey. */
  reasonCode?: string | null;
  riderFirstName?: string | null;
  cancelled?: boolean;
}

/**
 * Which of the four pipeline steps to light.
 *
 * ── What this replaced ──
 *
 *   status: o.status === "PAID" ? "placed" : "delivered"
 *
 * Two states for four steps. Every order that was not PAID rendered
 * as **Delivered** — cancelled ones included — and nothing could ever
 * show "packed" or "out for delivery", because nothing in this
 * database recorded them.
 *
 * `delivery_step` is written by the logistics system through the
 * signed receiver at /api/logistics/status. Until it says otherwise
 * the order is "placed", which is true: it has been placed, and
 * nobody has told us anything since.
 */
function pipelineStep(row: { status: string; delivery_step: string | null }): OrderStatus {
  if (row.delivery_step) return row.delivery_step as OrderStatus;

  // No word from logistics yet — say the least that is still true.
  if (row.status === "DELIVERED") return "delivered";
  return "placed";
}

export async function getMyOrders(role: "B2C" | "B2B"): Promise<Order[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      final_amount,
      status,
      payment_method,
      delivery_step,
      delivery_message,
      delivery_reason_code,
      delivery_rider_first_name,
      order_items (
        id,
        name,
        quantity,
        price_at_purchase
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  // Map database model to frontend model
  return data.map((o: any) => ({
    id: o.id.split("-")[0].toUpperCase(), // Just shortening UUID for display
    date: o.created_at,
    total: o.final_amount,
    status: pipelineStep(o),
    message: o.delivery_message ?? null,
    reasonCode: o.delivery_reason_code ?? null,
    riderFirstName: o.delivery_rider_first_name ?? null,
    // Kept separate from the pipeline: a cancelled order has no step
    // to be at, and lighting "Delivered" for one is how this started.
    cancelled: o.status === "CANCELLED",
    type: o.payment_method === "SHOP_CREDIT" ? "B2B" : "B2C",
    items: o.order_items.map((i: any) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      price: i.price_at_purchase
    }))
  }));
}
