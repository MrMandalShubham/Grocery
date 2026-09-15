-- ============================================================
-- 004 — Every reservation id, not just the first
--
-- Run after 003. Idempotent.
--
-- ── Why one column stopped being enough ──
--
-- `order_items.reservation_id` is a single uuid, added in 001 when
-- one order line meant exactly one hold. Inventory migration 0055
-- changed that: a lot-tracked line is now filled FEFO across lots, so
-- 10 units can come back as 4 from the lot expiring Friday and 6 from
-- the one expiring Monday — two reservations, one line.
--
-- Today every product has exactly one lot, so nothing splits and the
-- single column is still correct. It stops being correct the first
-- time receiving books a second lot, and the failure is silent: the
-- checkout code builds a Map keyed by sku, the second row overwrites
-- the first, and a hold exists that nothing recorded. Nothing then
-- confirms it, nothing tells logistics about it, and it lapses under
-- a rider who is already carrying the parcel.
--
-- ── Why the old column stays ──
--
-- `publishDeliveryReady` reads `reservation_id` per line and sends it
-- to logistics, which stores it on the delivery item. Dropping it
-- would break that payload for no gain. It keeps the FIRST id — which
-- is the FEFO-soonest lot, the one that matters most — and the array
-- carries the whole truth.
-- ============================================================

alter table public.order_items
  add column if not exists reservation_ids uuid[],

  -- When Inventory agreed the holds for this line stop expiring.
  --
  -- Kept locally rather than asked for, because the alternative is to
  -- re-confirm every hold on every sweep to find out. Confirming is
  -- idempotent, so that would be safe — it would just mean a request
  -- per line per run, forever, to learn something this side already
  -- knew at the moment it happened.
  --
  -- Null with a non-null reservation_ids is precisely the state the
  -- reconcile sweep looks for: stock is held, and nothing has stopped
  -- the clock on it.
  add column if not exists reservation_confirmed_at timestamptz;

comment on column public.order_items.reservation_ids is
  'Every hold placed for this line. More than one when Inventory filled it from several lots (FEFO). reservation_id is the first of these, kept for the logistics payload.';

-- Backfill from the column that already exists, so the array is the
-- complete answer for historical rows too rather than being null for
-- everything written before today.
update public.order_items
   set reservation_ids = array[reservation_id]
 where reservation_id is not null
   and reservation_ids is null;

-- The reconcile sweep: lines that hold stock and never stopped the
-- clock on it. Partial, because a line with no hold is never a
-- candidate and a confirmed one is already done.
create index if not exists order_items_unconfirmed_holds
  on public.order_items (order_id)
  where reservation_ids is not null and reservation_confirmed_at is null;

-- "Which line holds this reservation" — asked when Inventory reports a
-- problem with one and somebody has to find the order. GIN because the
-- question is "does this array contain that id", not "what is first".
create index if not exists order_items_reservation_ids
  on public.order_items using gin (reservation_ids)
  where reservation_ids is not null;
