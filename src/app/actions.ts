"use server";
import { reserveInventory } from "@/services/inventory";

export async function reserveOrderInventory(orderId: string, items: { sku: string; quantity: number }[]) {
  return await reserveInventory(orderId, items);
}
