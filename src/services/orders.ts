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
    status: o.status === "PAID" ? "placed" : "delivered", // Map DB status to pipeline status
    type: o.payment_method === "SHOP_CREDIT" ? "B2B" : "B2C",
    items: o.order_items.map((i: any) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      price: i.price_at_purchase
    }))
  }));
}
