"use server";
import { reserveInventory } from "@/services/inventory";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function reserveOrderInventory(orderId: string, items: { sku: string; quantity: number }[]) {
  return await reserveInventory(orderId, items);
}

export async function setLocationCookie(locationId: string) {
  const cookieStore = await cookies();
  cookieStore.set("inventory_location", locationId, { path: "/", maxAge: 60 * 60 * 24 * 365 }); // 1 year
  revalidatePath("/", "layout");
}

import { supabase } from "@/lib/supabase";

export async function logServiceRequest(lat: number, lng: number, wantsService: boolean) {
  const { error } = await supabase
    .from("service_requests")
    .insert([{ lat, lng, wants_service: wantsService }]);
  
  if (error) {
    console.error("Failed to log service request:", error);
    // Depending on RLS or Supabase config, this might fail silently if table doesn't exist yet,
    // which is fine for dev until user creates the table.
  }
}
