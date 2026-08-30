const BASE = process.env.INVENTORY_API_URL!;
const KEY = process.env.INVENTORY_API_KEY!;
export const LOCATION = process.env.INVENTORY_LOCATION!;

if (!BASE || !KEY) throw new Error("Inventory API is not configured");

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

async function call<T>(path: string, init?: RequestInit): Promise<T> {
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

export const getProducts = (params: Record<string, string> = {}) =>
  call<Product[]>(
    "/api/products?" + new URLSearchParams({ location: LOCATION, ...params }));

export const getProductByIdOrSlug = (slugOrSku: string) =>
  call<Product & { images: any[]; available_elsewhere: any[]; category_name?: string }>(
    `/api/products/${encodeURIComponent(slugOrSku)}?location=${LOCATION}`);

export const getCategories = () =>
  call<Category[]>(
    `/api/categories?location=${LOCATION}`);

export const reserveInventory = (orderId: string, items: { sku: string; quantity: number }[]) =>
  call<any>("/api/inventory/reserve", {
    method: "POST",
    body: JSON.stringify({ order_id: orderId, location: LOCATION, items }),
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
