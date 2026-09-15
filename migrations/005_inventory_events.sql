-- ============================================================
-- 005 — Inbound events from Inventory
--
-- Run after 004. Idempotent.
--
-- ── Why this exists ──
--
-- Inventory has had a complete webhook system since its Phase 8: a
-- subscription table, a delivery queue with backoff and
-- dead-lettering, HMAC signing, and a worker. It has had zero
-- subscribers. Nothing in this estate has ever listened.
--
-- So the storefront asks instead. `src/services/inventory.ts` sets
-- `next: { revalidate: 5 }` on every catalogue call, which is a fetch
-- against Inventory every five seconds per path per running instance,
-- and STILL shows stock that is up to five seconds wrong.
--
-- Listening is both cheaper and fresher. This table is the part the
-- receiver needs: somewhere to notice it has seen a delivery before.
--
-- ── Why idempotency needs a table ──
--
-- Inventory retries anything that is not a 2xx, including a delivery
-- whose response was lost after we had already acted on it. The
-- delivery id is stable across those retries (`attempt` increments,
-- `id` does not), so claiming the id is what turns a retry into a
-- no-op instead of a second cache invalidation.
--
-- Cache invalidation is idempotent anyway, so a duplicate would be
-- harmless today. It is recorded because the day this receiver does
-- something that is NOT idempotent, the protection has to already be
-- here — adding it afterwards means finding out the hard way first.
-- ============================================================

create table if not exists public.inventory_event (
  -- platform.webhook_delivery.id on Inventory's side. Text rather than
  -- uuid: it is somebody else's identifier and its shape is their
  -- business, not a constraint we should impose from here.
  delivery_id text primary key,

  event       text not null,
  -- The interesting fields, lifted out so a human can read the log
  -- without parsing json. Null for events that do not carry them.
  sku_code      text,
  location_code text,

  payload     jsonb,
  received_at timestamptz not null default now()
);

create index if not exists inventory_event_recent
  on public.inventory_event (received_at desc);

create index if not exists inventory_event_sku
  on public.inventory_event (sku_code, received_at desc)
  where sku_code is not null;

-- Written only by the receiver, which runs server-side with the
-- service role and bypasses RLS. No policy is defined because no
-- browser has any business reading the estate's stock event log --
-- it would expose movement volumes for every product in the business.
alter table public.inventory_event enable row level security;

comment on table public.inventory_event is
  'Inbound Inventory webhooks, for idempotency and for answering "when did this product last move". Service-role only: RLS is on and there are deliberately no policies.';

-- Retention. This table gains a row per ledger entry in the whole
-- business, which is the fastest-growing thing in this database by a
-- wide margin. Nothing prunes it yet; the index is what makes pruning
-- by age possible when something does.
comment on index public.inventory_event_recent is
  'Ordering, and the pruning key. This table grows with every stock movement in the estate — it needs a retention job before it needs anything else.';
