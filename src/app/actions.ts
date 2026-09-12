"use server";
import { reserveInventory } from "@/services/inventory";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function reserveOrderInventory(orderId: string, items: { sku: string; quantity: number }[]) {
  return await reserveInventory(orderId, items);
}

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setLocationCookie(locationId: string) {
  const cookieStore = await cookies();
  cookieStore.set("inventory_location", locationId, { path: "/", maxAge: ONE_YEAR });
  revalidatePath("/", "layout");
}

/**
 * The customer chose where to receive deliveries.
 *
 * `inventory_location` is unchanged — it scopes catalogue and stock
 * calls to one shop. What is new is keeping the customer's OWN
 * position alongside it.
 *
 * That position is captured either from GPS or from the map pin, used
 * to find the nearest shop within the delivery radius, and — until
 * now — thrown away. It is the only customer geocode anywhere in this
 * system, and without it a delivery has an address that nobody can
 * navigate to.
 */
export async function setDeliveryLocation(
  locationId: string,
  lat: number,
  lng: number,
) {
  const cookieStore = await cookies();
  cookieStore.set("inventory_location", locationId, { path: "/", maxAge: ONE_YEAR });
  cookieStore.set("delivery_geo", `${lat},${lng}`, { path: "/", maxAge: ONE_YEAR });
  revalidatePath("/", "layout");
}

export type DeliveryContext = {
  locationCode: string | null;
  lat: number | null;
  lng: number | null;
};

/**
 * Where this order is going, and which shop it comes from.
 *
 * `lat`/`lng` are null for anyone who chose their location before
 * this existed. Checkout treats that as "set your location first"
 * rather than guessing.
 */
export async function getDeliveryContext(): Promise<DeliveryContext> {
  const cookieStore = await cookies();
  const locationCode = cookieStore.get("inventory_location")?.value ?? null;
  const geo = cookieStore.get("delivery_geo")?.value ?? null;

  if (!geo) return { locationCode, lat: null, lng: null };

  const [lat, lng] = geo.split(",").map(Number);
  return {
    locationCode,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
  };
}

/**
 * Hand a placed order to the logistics system.
 *
 * Deliberately swallows its own failure. A logistics outage must
 * never fail a customer's checkout: the order exists and the stock is
 * held, so the parcel is real whether or not the handoff landed. An
 * order left without a tracking id is republished later — the
 * logistics endpoint is idempotent on the order id, so a repeat is
 * harmless.
 */
export async function notifyLogistics(orderId: string): Promise<void> {
  try {
    const { publishDeliveryReady } = await import("@/services/logistics");
    await publishDeliveryReady(orderId);
  } catch (err) {
    console.error("[logistics] could not publish order", orderId, err);
  }
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
