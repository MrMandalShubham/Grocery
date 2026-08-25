# Grocery — multi-location B2B2C quick-commerce platform

One provider (you) → serving **customers** (retail storefront) and **small shops** (B2B wholesale on credit). Includes inventory, logistics and a revenue dashboard. Creamy-green design system, zero runtime dependencies.

## Run it

```bash
cd Grocery
node server.js        # → http://localhost:4174
```

Port note: this machine already uses 4173 for another app, so the default is **4174** (override with `PORT=xxxx`).

## The three roles

| Role | Login | URL / how |
|---|---|---|
| Customer | phone + OTP `2468` (or browse as guest) | http://localhost:4174 |
| Provider admin (you) | `admin` / `admin123` | footer → **Admin / Provider login** |
| Shop (B2B) | registered phone + OTP `2468` | footer → **Shop login** |

Seeded shops: `9800000001` (Sri Balaji Stores) · `9800000002` (GreenMart) · `9800000003` (FreshPoint Kirana)

## Features

### Customer storefront
- Home: hero, offer chips, 10 categories, 7 product carousels, live search with suggestions
- Product cards (% OFF badge, ETA chip, ADD / stepper) + detail modal
- Cart drawer with bill + FREE-delivery progress (≥ ₹199), coupons **GREEN50** (≥ ₹499) / **GREEN75** (≥ ₹749)
- Checkout: saved addresses + add-new, UPI / Card / COD, live bill → success screen with order id + ETA
- My Orders, OTP login, stock-aware UI (OUT OF STOCK / ONLY N LEFT)

### Provider admin (inventory + logistics + revenue)
- **Overview**: revenue today, GMV (14d), AOV, B2B vs B2C mix, 14-day revenue chart, top products, low-stock alerts, inventory value
- **Inventory**: SKU, cost vs retail, stock level badges, restock +/- controls (movements logged)
- **Orders**: full pipeline — placed → packed → out_for_delivery → delivered, cancel auto-restocks
- **Logistics**: dispatch board, assign riders, rider workload
- **Shops**: list, create, credit wallet top-up

### B2B shops
- OTP login (registered phone), wholesale catalog (cost + 15%)
- Order on credit: credit wallet deducted, stock deducted, order enters the admin pipeline
- Shop order history

## API (server.js — zero dependencies)

| Method | Route | Notes |
|---|---|---|
| POST | `/api/session` | guest session → bearer token |
| GET | `/api/catalog` | categories + products (stock, cost, sku) |
| POST | `/api/auth/otp` · `/api/auth/verify` | customer login (OTP 2468) |
| POST | `/api/auth/admin` | admin login (admin/admin123) |
| POST | `/api/auth/shop` · `/api/auth/shop/verify` | shop OTP login |
| GET | `/api/me` | user + role + shop info |
| GET/POST | `/api/cart`, `/api/cart/items`, DELETE `/api/cart/items/:id` | server-side cart (stock-clamped) |
| POST/DELETE | `/api/coupons/apply`, `/api/coupons` | coupon validation server-side |
| GET/POST | `/api/addresses` | saved addresses |
| GET/POST | `/api/orders` | customer order history / place order (stock-checked) |
| GET | `/api/admin/stats` | revenue dashboard data |
| GET | `/api/admin/inventory` · POST `/api/admin/stock` | stock list + restock |
| GET | `/api/admin/orders` · POST `/api/admin/orders/:id/status` · `/rider` | pipeline + dispatch |
| GET/POST | `/api/admin/shops` · POST `/api/admin/shops/:id/credit` | shop management |
| GET/POST | `/api/shop/catalog`, `/api/shop/orders` | wholesale catalog + orders |

Billing is computed server-side (single source of truth). Data persists to `data/db.json` (seeded with 60 demo orders, 4 riders, 3 shops — delete the file to reset).

## Project layout

```
Grocery/
├── index.html          UI shell + creamy-green CSS design system
├── app.js              SPA — storefront + admin panel + shop portal
├── server.js           API + static server, JSON file persistence
├── data/db.json        runtime data (auto-created)
├── .kun-design/DESIGN_SYSTEM.md
├── PLAN.md             phased build plan
└── package.json
```
