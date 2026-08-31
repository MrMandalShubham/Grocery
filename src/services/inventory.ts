import { cookies } from "next/headers";

export async function getCurrentLocation() {
  const cookieStore = await cookies();
  const loc = cookieStore.get("inventory_location")?.value;
  return loc || process.env.INVENTORY_LOCATION || "SH1";
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
    cache: "no-store",
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
  call<Location[]>("/api/locations").catch(() => []);

export const getProducts = async (params: Record<string, string> = {}) => {
  const loc = await getCurrentLocation();
  return call<Product[]>("/api/products?" + new URLSearchParams({ location: loc, ...params }));
};

export const getProductByIdOrSlug = async (slugOrSku: string) => {
  const loc = await getCurrentLocation();
  return call<Product & { images: any[]; available_elsewhere: any[]; category_name?: string }>(
    `/api/products/${encodeURIComponent(slugOrSku)}?location=${loc}`
  );
};

export const ALL_CATEGORIES: Category[] = [
  { id: "fv", name: "Fruits & Veggies", icon: "🥬", product_count: 0 },
  { id: "dairy", name: "Dairy, Bread & Eggs", icon: "🥛", product_count: 0 },
  { id: "staples", name: "Atta, Rice & Dal", icon: "🌾", product_count: 0 },
  { id: "cooking", name: "Oil, Ghee & Masala", icon: "🛢️", product_count: 0 },
  { id: "snacks", name: "Snacks & Namkeen", icon: "🍿", product_count: 0 },
  { id: "drinks", name: "Cold Drinks", icon: "🥤", product_count: 0 },
  { id: "instant", name: "Instant & Noodles", icon: "🍜", product_count: 0 },
  { id: "bakery", name: "Bakery & Biscuits", icon: "🍪", product_count: 0 },
  { id: "house", name: "Cleaning & Household", icon: "🧼", product_count: 0 },
  { id: "personal", name: "Personal Care", icon: "🧴", product_count: 0 }
];

export const getCategories = async () => {
  const loc = await getCurrentLocation();
  const apiCategories = await call<Category[]>(`/api/categories?location=${loc}`).catch(() => []);
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
