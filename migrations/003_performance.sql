-- ============================================================
-- 003 — Indexes, and RLS that is evaluated once
--
-- Run this against the EXISTING database, after 002. Every statement
-- is idempotent, so running it twice is a no-op.
--
-- ── Why this exists ──
--
-- `schema.sql` creates seven tables and not one index — only primary
-- keys and a unique constraint on `promo_codes.code`. Migrations 001
-- and 002 added one index each, both for their own new columns
-- (`orders.logistics_tracking_id`, `logistics_status_event.order_id`).
--
-- So not a single foreign key, and not a single column any customer
-- query filters or sorts on, is indexed. Every one of them is a
-- sequential scan.
--
-- That is survivable at a hundred orders and is not survivable at a
-- hundred thousand. It matters more here than in the other two systems
-- because this is the only one a customer waits on: the order page,
-- the cart and the checkout all run these queries with a person
-- watching.
--
-- Two separate problems, fixed together because they compound:
--
--   1. No index on any foreign key. Postgres does not create one.
--   2. Row-level security calling auth.uid() once PER ROW.
--
-- The second is the one that surprises people. `auth.uid()` is a
-- function call, and in `USING (auth.uid() = user_id)` the planner
-- treats it as volatile-ish and re-executes it for every row it
-- examines. Wrapped as `(select auth.uid())` it becomes an InitPlan —
-- evaluated once for the whole statement. The rewrite changes no
-- behaviour whatsoever; it changes how many times the same answer is
-- computed.
--
-- Together they are why an order page that reads twenty rows can scan
-- the whole table and call auth.uid() once per row in it.
--
-- ── Run the whole file at once ──
--
-- Section 2 drops each policy before recreating it. Run as one
-- statement batch (the Supabase SQL editor does this) so the drop and
-- the create commit together — running it line by line leaves the
-- table briefly with no policy, which on an RLS-enabled table means
-- every customer query returns zero rows.
--
-- ── A note on CONCURRENTLY ──
--
-- These are plain CREATE INDEX statements, which take a write lock for
-- the duration. On the table sizes this database has today that is
-- milliseconds. If you are running this against a large production
-- table instead, run each index separately as
-- `create index concurrently ...` OUTSIDE a transaction — it cannot
-- run inside one — and leave the rest of the file as it is.
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. Foreign keys, and the queries that actually run
-- ─────────────────────────────────────────────────────────────

-- getMyOrders(): RLS filters by user_id, the query sorts by
-- created_at desc. One composite index serves both, and serves the
-- ORDER BY without a sort step.
create index if not exists orders_user_recent
  on public.orders (user_id, created_at desc);

-- The republish/reconcile sweep:
--
--   status = 'PAID' and logistics_tracking_id is null
--   and delivery_lat is not null and created_at < cutoff
--
-- The index added in 001 is on `logistics_tracking_id WHERE
-- logistics_tracking_id IS NOT NULL` — the exact opposite of the rows
-- this sweep is looking for, so it has never been able to use it. The
-- predicate below matches the query.
create index if not exists orders_awaiting_logistics
  on public.orders (created_at)
  where status = 'PAID' and logistics_tracking_id is null;

-- The single hottest missing index in the schema. Every order page
-- does `order_items(...)` as a nested select, every publish to
-- logistics reads the lines back, and the RLS policy on order_items
-- joins to orders on this column. Without it each of those is a
-- sequential scan of every order line ever written.
create index if not exists order_items_order
  on public.order_items (order_id);

-- Phase 1 of the integration plan sweeps for lines that were held but
-- never confirmed. Partial, because a line without a reservation id is
-- never a candidate.
create index if not exists order_items_reservation
  on public.order_items (reservation_id)
  where reservation_id is not null;

-- The saved-address link. Always null today because the address-book
-- UI is still "Coming Soon", which is exactly why it is a partial
-- index: it costs almost nothing now and stops `delete from addresses`
-- scanning every order once the feature ships.
create index if not exists orders_address
  on public.orders (address_id)
  where address_id is not null;

-- FOR ALL policies on user_id, read on every page that renders a cart
-- or an address book.
create index if not exists carts_user
  on public.carts (user_id);

create index if not exists addresses_user
  on public.addresses (user_id);

-- "Which address is the default" is asked on every checkout render.
create index if not exists addresses_default
  on public.addresses (user_id)
  where is_default;

-- promo_codes deliberately gets nothing. The unique constraint on
-- `code` already serves the only lookup that happens, the table holds
-- tens of rows, and an index that is never chosen still has to be
-- maintained on every write.

-- Retention. The status event log grows by several rows per delivery
-- and nothing has ever pruned it; logistics has a retention job and
-- this side has none. Pruning by age needs an index on age.
create index if not exists logistics_status_event_age
  on public.logistics_status_event (received_at);


-- ─────────────────────────────────────────────────────────────
-- 2. Row-level security, evaluated once per statement
--
-- Each policy below is the SAME predicate as before. The only change
-- is `auth.uid()` → `(select auth.uid())`, which moves the call from
-- once per row to once per statement.
-- ─────────────────────────────────────────────────────────────

-- ── profiles ──
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id);

-- ── addresses ──
drop policy if exists "Users can manage their own addresses" on public.addresses;
create policy "Users can manage their own addresses"
  on public.addresses for all
  using ((select auth.uid()) = user_id);

-- ── orders ──
drop policy if exists "Users can view their own orders" on public.orders;
create policy "Users can view their own orders"
  on public.orders for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own orders" on public.orders;
create policy "Users can insert their own orders"
  on public.orders for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own orders" on public.orders;
create policy "Users can update their own orders"
  on public.orders for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ── order_items ──
--
-- These carry the correlated EXISTS as well as the per-row auth.uid(),
-- so they were paying both costs at once. The EXISTS is cheap now that
-- order_items_order exists above and orders.id is the primary key.
drop policy if exists "Users can view their own order items" on public.order_items;
create policy "Users can view their own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
       where orders.id = order_items.order_id
         and orders.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can insert order items" on public.order_items;
create policy "Users can insert order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
       where orders.id = order_items.order_id
         and orders.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can update their own order items" on public.order_items;
create policy "Users can update their own order items"
  on public.order_items for update
  using (
    exists (
      select 1 from public.orders
       where orders.id = order_items.order_id
         and orders.user_id = (select auth.uid())
    )
  );

-- ── carts ──
drop policy if exists "Users can manage their own cart" on public.carts;
create policy "Users can manage their own cart"
  on public.carts for all
  using ((select auth.uid()) = user_id);


-- ─────────────────────────────────────────────────────────────
-- 3. updated_at, written by the database
--
-- The column has a default and is set by hand in exactly two places:
-- the logistics publish and the status receiver. Every other write
-- path leaves it at whatever it was, so "when did this order last
-- change" is answerable only for orders logistics touched.
--
-- A trigger cannot be forgotten by a code path nobody has written yet.
-- ─────────────────────────────────────────────────────────────

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 4. The table the application already writes to
--
-- `logServiceRequest` in src/app/actions.ts inserts into
-- public.service_requests. It is not in schema.sql and not in 001 or
-- 002, and the code comments say so — the insert fails and the error
-- is swallowed, so every out-of-area request this app has ever
-- recorded has gone nowhere.
--
-- This is the record of where people wanted delivery and could not
-- get it, which is the only data this estate has about where to open
-- the next shop.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.service_requests (
  id            uuid default gen_random_uuid() primary key,
  lat           numeric(9,6) not null,
  lng           numeric(9,6) not null,
  wants_service boolean not null,
  created_at    timestamptz not null default now()
);

create index if not exists service_requests_recent
  on public.service_requests (created_at desc);

alter table public.service_requests enable row level security;

-- Anyone may report that they wanted service here, including a
-- visitor who has not signed in — that is the whole point of the
-- question, which is asked before anybody logs in.
drop policy if exists "Anyone can record a service request" on public.service_requests;
create policy "Anyone can record a service request"
  on public.service_requests for insert
  with check (true);

-- Nobody reads it back through the browser. Deliberately no SELECT
-- policy: a map of where your customers are is a competitor's
-- expansion plan.
comment on table public.service_requests is
  'Where delivery was asked for. Insert-only from the browser; read with the service role.';


-- ─────────────────────────────────────────────────────────────
-- 5. Tell the planner about the new shape
-- ─────────────────────────────────────────────────────────────

analyze public.orders;
analyze public.order_items;
analyze public.carts;
analyze public.addresses;
analyze public.logistics_status_event;
