import { cookies } from "next/headers";

export async function getCurrentLocation(): Promise<string | null> {
  const cookieStore = await cookies();
  const loc = cookieStore.get("inventory_location")?.value;
  return loc || null;
}

export type Product = {
  id: string; sku: string; slug: string; name: string;
  description: string | null; category: string | null;
  unit: string | null; base_unit: string;
  retailPrice: number | null; mrp: number | null; wholesalePrice: number | null;
  stock: number | null; image_url: string | null;
};

export type Category = {
  id: string; name: string; icon: string; product_count: number;
};

export type Location = {
  id: string; uuid: string; name: string; type: string; products_in_stock: number;
};

/**
 * How long a catalogue read may sit in the cache without anybody
 * telling us it is wrong.
 *
 * ── Why this went from 5 seconds to 5 minutes ──
 *
 * Five seconds was not a freshness setting, it was a poll: a fetch
 * against Inventory every five seconds, per path, per running
 * instance, forever — and a number that could still be five seconds
 * stale when a customer read it.
 *
 * Inventory now pushes `stock.changed` to /api/inventory/events, which
 * throws the relevant pages away the moment stock actually moves. So
 * this stopped being the freshness mechanism and became the backstop:
 * what happens if the webhook worker is down, or an event is dropped,
 * or somebody edits a price (which emits nothing today).
 *
 * Longer would be fine for the catalogue and too long for a price
 * change nobody is notified about. Five minutes is the compromise, and
 * it is a hundredth of the traffic.
 */
const CATALOGUE_BACKSTOP_SECONDS = 300;

/**
 * Cache tags for a catalogue read.
 *
 * Deliberately coarse. One tag per shop, carried by every list, every
 * category page and every product page for that shop — so a single
 * movement at SH1 refreshes SH1 and leaves SH2 alone.
 *
 * Tagging per SKU would be tighter and would not work: a product is
 * fetched by slug or by sku, the event only carries the sku, and the
 * tag has to be attached before the response is read. A tag that
 * misses the page the customer is on is worse than a coarse one.
 */
function catalogueTags(location: string | null): string[] {
  return location ? ["catalog", `stock:${location}`] : ["catalog"];
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const BASE = process.env.INVENTORY_API_URL;
  const KEY = process.env.INVENTORY_API_KEY;
  if (!BASE || !KEY) {
    console.warn("Inventory API is not configured. Missing INVENTORY_API_URL or INVENTORY_API_KEY.");
    // Return empty array/object gracefully during build if env vars are missing
    return [] as unknown as T;
  }

  const res = await fetch(BASE + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: init?.method === "POST" ? "no-store" : undefined,
    next: init?.method !== "POST"
      ? (init?.next ?? { revalidate: CATALOGUE_BACKSTOP_SECONDS })
      : undefined,
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(body?.message ?? `Inventory API ${res.status}`);
    Object.assign(err, { status: res.status, code: body?.error, body });
    throw err;
  }
  return body as T;
}

export const getLocations = async () =>
  call<Location[]>("/api/locations", {
    // Its own tag: the shop list changes when a shop opens or closes,
    // which has nothing to do with stock moving.
    next: { tags: ["locations"], revalidate: CATALOGUE_BACKSTOP_SECONDS },
  }).catch(() => []);

export const getProducts = async (params: Record<string, string> = {}) => {
  const loc = await getCurrentLocation();
  const searchParams = new URLSearchParams(params);
  if (loc) searchParams.append("location", loc);
  const query = searchParams.toString() ? "?" + searchParams.toString() : "";
  const products = await call<Product[]>("/api/products" + query, {
    next: { tags: catalogueTags(loc), revalidate: CATALOGUE_BACKSTOP_SECONDS },
  });
  if (!loc) {
    return products.map(p => ({ ...p, stock: null }));
  }
  return products;
};

export const getProductByIdOrSlug = async (slugOrSku: string) => {
  const loc = await getCurrentLocation();
  const query = loc ? `?location=${loc}` : "";
  const product = await call<Product & { images: any[]; available_elsewhere: any[]; category_name?: string }>(
    `/api/products/${encodeURIComponent(slugOrSku)}${query}`,
    { next: { tags: catalogueTags(loc), revalidate: CATALOGUE_BACKSTOP_SECONDS } },
  );
  if (!loc && product) {
    product.stock = null;
  }
  return product;
};

export const ALL_CATEGORIES: Category[] = [
  { id: "fruits-veggies", name: "Fruits & Veggies", icon: "🥬", product_count: 0 },
  { id: "dairy-bread-eggs", name: "Dairy, Bread & Eggs", icon: "🥛", product_count: 0 },
  { id: "atta-rice-dal", name: "Atta, Rice & Dal", icon: "🌾", product_count: 0 },
  { id: "oil-ghee-masala", name: "Oil, Ghee & Masala", icon: "🛢️", product_count: 0 },
  { id: "snacks-namkeen", name: "Snacks & Namkeen", icon: "🍿", product_count: 0 },
  { id: "cold-drinks", name: "Cold Drinks", icon: "🥤", product_count: 0 },
  { id: "instant-noodles", name: "Instant & Noodles", icon: "🍜", product_count: 0 },
  { id: "bakery-biscuits", name: "Bakery & Biscuits", icon: "🍪", product_count: 0 },
  { id: "cleaning-household", name: "Cleaning & Household", icon: "🧽", product_count: 0 },
  { id: "personal-care", name: "Personal Care", icon: "🧴", product_count: 0 }
];

export const getCategories = async () => {
  const loc = await getCurrentLocation();
  const query = loc ? `?location=${loc}` : "";
  const apiCategories = await call<Category[]>(`/api/categories${query}`, {
    next: { tags: catalogueTags(loc), revalidate: CATALOGUE_BACKSTOP_SECONDS },
  }).catch(() => []);
  return ALL_CATEGORIES.map(staticCat => {
    const apiMatch = apiCategories.find(c => c.id === staticCat.id);
    return {
      ...staticCat,
      product_count: apiMatch ? apiMatch.product_count : 0
    };
  });
};

export const reserveInventory = async (orderId: string, items: { sku: string; quantity: number }[]) => {
  const loc = await getCurrentLocation();
  return call<any>("/api/inventory/reserve", {
    method: "POST",
    body: JSON.stringify({ order_id: orderId, location: loc, items }),
  });
};

/**
 * The customer paid, so the hold stops expiring.
 *
 * ── Why this call has to exist ──
 *
 * `reserve` holds stock for 1800 seconds and nothing extended it.
 * Every delivery that took longer than half an hour had its hold
 * lapse mid-journey; the commit that followed then landed on
 * Inventory's "already released" path and became a stock incident
 * with the parcel already handed over.
 *
 * `confirm` is the endpoint that fixes it — it sets `expires_at` to
 * null, so a paid hold simply does not lapse. It has existed since
 * Phase 4 of Inventory and nothing has ever called it. Zero
 * reservations in the live database have ever reached CONFIRMED.
 *
 * ── Why here and not in logistics ──
 *
 * "The customer paid" is Grocery's fact, known the instant reserve
 * returns. Confirming here REMOVES the expiry window; confirming when
 * logistics admits the delivery would only shrink it, and would make
 * the life of a stock hold depend on the delivery system being up.
 *
 * ── The surface, which is not the one everything else uses ──
 *
 * This is `/api/v1/`, the integrator API — not `/api/`, the
 * storefront one. They differ in a way that bites exactly here: v1
 * REQUIRES an `Idempotency-Key` header on every write and answers 400
 * without it. The key is order + reservation, so a retry of the same
 * confirm replays rather than being mistaken for a different request.
 *
 * Confirming is idempotent at the database too — a reservation that
 * is already CONFIRMED returns without doing anything — so a repeat
 * is harmless either way.
 */
export const confirmReservation = (reservationId: string, orderId: string) =>
  call<{ reservation: { id: string; status: string; expires_at: string | null } }>(
    `/api/v1/reservations/${encodeURIComponent(reservationId)}/confirm`,
    {
      method: "POST",
      headers: { "Idempotency-Key": `${orderId}:${reservationId}` },
      body: JSON.stringify({ order_ref: orderId }),
    });

export const commitInventory = (orderId: string) =>
  call<any>("/api/inventory/commit", {
    method: "POST", body: JSON.stringify({ order_id: orderId }),
  });

export const releaseInventory = (orderId: string, reason?: string) =>
  call<any>("/api/inventory/release", {
    method: "POST", body: JSON.stringify({ order_id: orderId, reason }),
  });

export const orderStatus = (orderId: string) =>
  call<{ order_id: string; status: "held" | "delivered" | "released"; items: any[] }>(
    `/api/inventory/order/${encodeURIComponent(orderId)}`);
