# Inventory Management Plan — Grocery

**Business model (as confirmed by the owner/admin):**

```
                        ┌─────────────────────────┐
                        │   MAIN WAREHOUSE (you)  │  ← central inventory
                        │   purchases / GRN       │
                        └───────────┬─────────────┘
              transfers │           │ transfers          │ transfers
        ┌────────────────┘           └───────────┐        └────────────────┐
        ▼                                        ▼                         ▼
┌─────────────────┐                    ┌─────────────────┐       ┌─────────────────┐
│ LOCATION A      │                    │ LOCATION B      │       │ LOCATION C      │
│ own inventory   │                    │ own inventory   │       │ own inventory   │
└────┬──────┬─────┘                    └────┬──────┬─────┘       └────┬──────┬─────┘
     │      │                               │      │                 │      │
 B2C home    B2B shop                  B2C home   B2B shop     B2C home   B2B shop
 delivery    delivery                  delivery   delivery     delivery   delivery
 (family &   (small shops              ...
 walk-in     attached to
 customers)  this location)
```

- **Admin = owner of the main warehouse.** Buys stock (GRN = goods receipt), sets prices, tracks every location.
- **Locations** = shops/sites in different areas. Each has **its own inventory**, tracked **separately**.
- **All locations are connected to the main inventory** — main replenishes locations via **stock transfers**.
- **Two delivery channels per location:** B2C home delivery (family + walk-in customers) and B2B shop delivery (small shops the location supplies).

---

## 1. Core principles (invariants — must never break)

1. **Stock never goes negative.** Every deduction is checked against that location's qty first.
2. **Main inventory = sum of locations + main stock.** `main.qty + Σ location.qty = total`. The dashboard shows each bucket separately and the total.
3. **Every movement is ledgered.** Any qty change writes a movement row with `reason` + `reference` + `who`. No silent edits; corrections are adjustment rows.
4. **Transfers are two-sided.** Moving main→location creates `transfer_out` at main and (on receive) `transfer_in` at location. In-transit qty is tracked between the two.
5. **Order deduction is routed to exactly one location** (nearest store or the location that owns the shop).

---

## 2. Data model (JSON now → SQLite/Postgres later, same shape)

```
warehouses
  id, name, type: 'main' | 'location',
  address, zone, phone, isActive, openedAt

products
  id, sku, name, unit, category,
  cost, retail, mrp, art, barcode?

inventory
  warehouseId + productId (unique pair),
  qty, minLevel, maxLevel, updatedAt
  → minLevel drives LOW-STOCK alerts per location, not globally

movements   (append-only ledger)
  id, at, warehouseId, productId, delta (+/-),
  reason: 'grn' | 'transfer_out' | 'transfer_in' | 'sale_b2c' | 'sale_b2b'
        | 'adjustment' | 'wastage' | 'return',
  refId (order/transfer id), note, by (admin name)

transfers
  id, fromWarehouseId, toWarehouseId,
  status: 'requested' | 'in_transit' | 'received' | 'cancelled',
  items: [{productId, qty}], note,
  requestedAt, sentAt, receivedAt

locations also link to:
shops        {id, name, phone, credit, locationId}   ← each shop belongs to ONE location
zones        {id, name, locationId, pincodes[]}      ← which location serves which area
```

---

## 3. Flows

### A. Purchasing (main only)
1. Admin receives goods → `POST /api/admin/grn` `{items:[{productId,qty,cost?}]}`
2. Movement rows: `grn` at main. Cost updates if supplied.

### B. Replenishing locations (main → location)
1. Location runs low → alert appears on that location's row.
2. Admin creates transfer: `POST /api/admin/transfers` `{toWarehouseId, items}`
3. Main qty is **reserved** immediately (`transfer_out`, status `requested`); total doesn't double-count (in-transit shown separately).
4. Location receives: `POST /api/admin/transfers/:id/receive` → `transfer_in` at location, status `received`.
5. Cancel before receive → qty returns to main.

### C. B2C home delivery (customer app)
1. Customer picks delivery location (header picker → zones).
2. Order routes to the **nearest active location** that has stock.
3. Deduction: `sale_b2c` movement at that location. If location lacks stock → fallback chain (next location → main) and notify admin.
4. Cancel order → return movement restores that location's qty.

### D. B2B shop delivery (shop app)
1. Shop belongs to a location. Its wholesale order deducts that **location's** inventory (`sale_b2b`) and shop credit.
2. If location stock insufficient → "out of stock at your store" + admin gets a replenish suggestion.

### E. Adjustments & wastage
- `POST /api/admin/stock` `{warehouseId, productId, delta, reason}` — reason required (`adjustment`/`wastage`), ledgered.

---

## 4. Admin screens (Phase plan)

| Phase | What | API |
|---|---|---|
| **I. Schema + seed** | warehouses (main + 3-4 locations), per-location stock, shops linked to locations, zones | `GET /api/admin/warehouses` |
| **II. Inventory board** | one screen: rows = location × product (or per-location tabs); qty, min/max, status (OK/LOW/OUT), value; GRN & adjustments | `GET/POST /api/admin/inventory?warehouse=` , `POST /api/admin/grn`, `POST /api/admin/stock` |
| **III. Transfers** | main ↔ location transfer flow with in-transit tracking, receive/cancel actions | `GET/POST /api/admin/transfers`, `POST /api/admin/transfers/:id/receive|cancel` |
| **IV. Routing** | order → location assignment (zone + stock + nearest), per-location order views | internal in order create |
| **V. Reports** | movements ledger, per-location value & turns, transfer history, wastage report | `GET /api/admin/movements`, `GET /api/admin/reports/*` |
| **VI. Hardening** | expiry batches, supplier purchase orders, CSV export, SQLite | — |

---

## 5. Dashboard KPIs (main + per location)

- Stock value per location (at cost) + total
- LOW/OUT items per location (top of dashboard)
- In-transit value (money stuck between warehouses)
- 7-day sales per location (B2C vs B2B split)
- Wastage/adjustment summary (loss control)

---

## 6. Delivery-channel rules

- **Home delivery (B2C):** deliver from nearest location; delivery fee free ≥ ₹199, else ₹15.
- **Shop delivery (B2B):** wholesale price = cost + 15%, paid from shop credit; admin dispatches via rider (existing logistics board).
- Both channels write **separate movement reasons** so revenue reporting can split B2C vs B2B per location.

---

## 7. Build order for the codebase

1. **(done)** Core store + admin + shops with single inventory → refactor to per-warehouse `inventory` table.
2. Seed 1 main + 4 locations, split current stock across them, link existing shops to locations, zones with pincodes.
3. Rewrite deduction logic to route orders to a location (customer address → zone → location).
4. Inventory board UI (per-location tabs + main), transfers UI, movements ledger.
5. Reports + KPI cards, then CSV export.

**State after this plan is approved:** customer UI/UX is polished first (current todo), then Phase I–V of this document.
