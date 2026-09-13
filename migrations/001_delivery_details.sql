-- ============================================================
-- 001 — Delivery details on an order
--
-- Run this against the EXISTING database. `schema.sql` has been
-- updated to match, so a fresh install already has these columns and
-- running this again is a no-op (every statement is IF NOT EXISTS).
--
-- ── Why this exists ──
--
-- No order in this system carries a delivery address. The checkout
-- form's inputs were uncontrolled and their values discarded, the
-- customer's map pin was used for the 10 km serviceability check and
-- then thrown away, and the reservation ids returned by the inventory
-- reserve call were never stored.
--
-- All three were already in hand at checkout. This migration gives
-- them somewhere to live.
--
-- ── Two kinds of address, for two different jobs ──
--
--   addresses.lat/lng    the customer's saved address book (prepared
--                        here; the UI is still "Coming Soon")
--   orders.delivery_*    a SNAPSHOT of where THIS order went
--
-- The snapshot is the one that matters. An address a customer can
-- edit must not silently rewrite where a parcel was delivered last
-- month, and a rider already on the road must not be redirected
-- because somebody updated their profile.
--
-- ── Why nothing is NOT NULL ──
--
-- Existing orders have no address and never did. Backfilling would
-- mean inventing one, which is worse than having none. The
-- application refuses to create an order without these fields; the
-- database stays permissive so history survives.
-- ============================================================

-- 1. Prepare the saved-address book. Two columns, unused today.
alter table public.addresses
  add column if not exists lat numeric(9,6),
  add column if not exists lng numeric(9,6);

-- 2. The delivery snapshot on the order.
alter table public.orders
  -- Optional link back to the saved address, for when that UI is built.
  add column if not exists address_id uuid references public.addresses(id),

  -- Which shop fulfils this order. Until now it lived only in the
  -- `inventory_location` cookie, so nothing downstream could tell
  -- where the parcel is collected from.
  add column if not exists fulfilment_location_code text,

  add column if not exists delivery_recipient_name text,
  add column if not exists delivery_phone          text,
  add column if not exists delivery_line1          text,
  add column if not exists delivery_line2          text,
  add column if not exists delivery_city           text,
  add column if not exists delivery_state          text,
  add column if not exists delivery_pincode        text,

  -- The part that cannot be worked around: a destination a rider
  -- cannot navigate to is not a destination.
  add column if not exists delivery_lat            numeric(9,6),
  add column if not exists delivery_lng            numeric(9,6),

  add column if not exists delivery_instructions   text,

  -- Nothing recorded when an order last changed.
  add column if not exists updated_at timestamptz not null default now();

-- 3. The reservation id per line, straight from the reserve response.
--    These are the only way to stop a stock hold expiring mid-delivery:
--    reserve returns them and no other inventory endpoint ever does.
alter table public.order_items
  add column if not exists reservation_id uuid;

-- The logistics system writes its tracking id back here. The column
-- has existed since the first schema and has never been written.
create index if not exists orders_logistics_tracking
  on public.orders (logistics_tracking_id)
  where logistics_tracking_id is not null;

-- ── Row-level security ──
--
-- `orders` had SELECT and INSERT policies and NO UPDATE policy at
-- all. With the table grant in place that makes an UPDATE match zero
-- rows and report success -- a silent no-op, which is how a failed
-- checkout could never be marked FAILED.
--
-- Needed now so that when the inventory reserve fails, the order it
-- already created can be marked rather than left looking PAID.
drop policy if exists "Users can update their own orders" on public.orders;
create policy "Users can update their own orders"
  on public.orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Order items are written once at checkout and then updated once, to
-- attach the reservation id returned by the reserve call.
drop policy if exists "Users can update their own order items" on public.order_items;
create policy "Users can update their own order items"
  on public.order_items for update
  using (
    exists (
      select 1 from public.orders
       where orders.id = order_items.order_id
         and orders.user_id = auth.uid()
    )
  );
