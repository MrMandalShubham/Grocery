# Grocery — Platform Build Plan (B2B2C quick-commerce)

**Owner = Provider (you).** One platform, three roles:

| Role | Who | What they do |
|---|---|---|
| Customer | End users | Browse storefront, order retail, pay UPI/Card/COD |
| Shop (B2B) | Small kirana/shops you supply | Login, browse wholesale catalog, order on credit wallet |
| Admin (Provider) | You | Inventory, logistics/dispatch, shops, revenue dashboard |

Design system: **Creamy Green** preset (see `.kun-design/DESIGN_SYSTEM.md`).

---

## Phase 0 — Foundation (customer storefront + API + design system) — ✅ DONE
- [x] Creamy-green design system tokens in `index.html`
- [x] Storefront: home, hero, offers, 10 categories, 7 carousels, search + suggestions
- [x] Product cards + detail modal + steppers
- [x] Cart drawer, bill, FREE-delivery progress (≥ ₹199)
- [x] Checkout: addresses (add/save), UPI/Card/COD, coupons GREEN50/GREEN75
- [x] OTP login (demo code 2468), orders page, toasts
- [x] Zero-dependency Node backend: sessions, cart, coupons, orders, static serving
- [x] Live-tested end-to-end on http://localhost:4174

## Phase 0b — Docs — ✅ DONE
- [x] PLAN.md, README.md, .kun-design/DESIGN_SYSTEM.md, package.json

## Phase 1 — Inventory backend — ✅ DONE
- [x] Products: `sku`, `cost` (wholesale cost), `stock`, `reorder` level
- [x] `GET /api/admin/inventory` — stock list with ok/low/out status
- [x] `POST /api/admin/stock` — restock / adjust with movement log
- [x] Orders deduct stock; cancelled orders restock; cart clamps to stock
- [x] Storefront shows OUT OF STOCK / ONLY N LEFT badges

## Phase 2 — Admin (provider) panel — ✅ DONE
- [x] Admin login (`admin` / `admin123`)
- [x] Overview: revenue today, GMV (14d), AOV, B2B vs B2C mix, 14-day revenue chart, top products, low-stock alerts, inventory value
- [x] Inventory tab: restock controls, status badges
- [x] Orders tab: full order pipeline + cancel (auto-restock)
- [x] Shops tab: list, create, credit wallet top-up
- [x] Demo data seeded (60 orders across 14 days, 4 riders, 3 shops)

## Phase 3 — Logistics — ✅ DONE
- [x] Order lifecycle: placed → packed → out_for_delivery → delivered (+ cancelled)
- [x] Dispatch board: rider assignment, rider workload, pending orders
- [x] Delivered timestamps, restock on cancel

## Phase 4 — B2B shops — ✅ DONE
- [x] Shop login (OTP 2468, registered phones)
- [x] Wholesale catalog (cost + 15%)
- [x] Credit wallet: shop orders deduct credit; admin tops up
- [x] Shop order history + admin sees B2B orders in pipeline

## Phase 5 — Verification — ✅ DONE
- [x] `node --check` on server.js + app.js
- [x] Live API tests: customer purchase flow, admin auth/stats/stock/status/rider, shop order + credit deduction, negative paths

## Later (not in this pass)
- [ ] Delivery slots / zones, live tracking simulation
- [ ] CSV export of revenue, PDF invoices
- [ ] Multi-warehouse, purchase orders from supplier side
- [ ] Realtime refresh (polling/SSE), email/WhatsApp notifications

## Running
```bash
cd Grocery
node server.js        # → http://localhost:4174
```
- Customer: any browser session
- Admin: footer → Admin / Provider login → `admin` / `admin123`
- Shops: footer → Shop login → phone `9800000001` (Sri Balaji Stores), OTP `2468`
