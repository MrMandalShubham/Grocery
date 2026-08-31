export const STORE_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  // Central Warehouse (if applicable for delivery, though usually a Hub isn't direct to consumer)
  HUB: { lat: 19.1000, lng: 72.9000 },
  
  // Shop 1 — Andheri
  SH1: { lat: 19.1136, lng: 72.8697 },
  
  // Shop 2 — Bandra
  SH2: { lat: 19.0596, lng: 72.8295 },
  
  // Shop 3 — Dadar
  SH3: { lat: 19.0178, lng: 72.8478 }
};

export const MAX_DELIVERY_RADIUS_KM = 10;
