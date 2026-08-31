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
