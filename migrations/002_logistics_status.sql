-- ============================================================
-- 002 — Where the order actually is
--
-- Run this against the EXISTING database, after 001. `schema.sql`
-- has been updated to match, so a fresh install already has these
-- and running this again is a no-op.
--
-- ── Why this exists ──
--
-- The order page has always shown a four-step progress bar, and the
-- code behind it was:
--
--   status: o.status === "PAID" ? "placed" : "delivered"
--
-- Two states for four steps. Every order that was not PAID rendered
-- as **Delivered**, including cancelled ones. Nothing in this
-- database has ever recorded that a parcel was picked up or is on
-- its way, because nothing in this estate knew.
--
-- The logistics system knows. This migration gives it somewhere to
-- say so.
--
-- ── Why the delivery step is its own column ──
--
-- `orders.status` is the commercial state of an order: paid,
-- shipped, cancelled. The delivery step is where the parcel is.
-- They move at different times for different reasons -- a failed
-- delivery leaves the order SHIPPED while the step goes back to
-- "out for delivery" with a reason attached -- and collapsing them
-- into one column is what produced the ternary above.
-- ============================================================

-- 1. The delivery's own view of the order.
alter table public.orders
  -- Which of OrderPipeline's four steps to light.
  add column if not exists delivery_step text
    check (delivery_step is null or
           delivery_step in ('placed','packed','out_for_delivery','delivered')),

  -- The sentence the customer reads. Written by logistics so that one
  -- change of tone is one deploy, not two.
  add column if not exists delivery_message text,

  -- Why it did not arrive. CUSTOMER_UNREACHABLE, ADDRESS_WRONG, and
  -- so on -- null on a normal journey.
  add column if not exists delivery_reason_code text,

  -- A first name and nothing else. There is no number-masking
  -- provider in this estate, so a rider's mobile is not published to
  -- customers; somebody who needs to talk to a rider rings support.
  add column if not exists delivery_rider_first_name text,

  -- ── The part that stops an old event undoing a new one ──
  --
  -- Delivery is at-least-once and says nothing about ORDER. A retry
  -- of "out for delivery" can arrive after "delivered" and would
  -- otherwise send the customer backwards. Logistics stamps every
  -- event with a monotonic sequence; anything not greater than what
  -- is stored here is ignored.
  --
  -- A sequence rather than a timestamp, because two servers' clocks
  -- are not a thing to bet a customer's order page on.
  add column if not exists delivery_status_sequence bigint,

  add column if not exists delivery_status_at timestamptz;

comment on column public.orders.delivery_status_sequence is
  'Monotonic per delivery, from logistics. An event whose sequence is not greater than this is a replay or an overtake and is ignored.';

-- 2. Idempotency.
--
-- The sequence check above rejects an OLD event. It does not
-- recognise the SAME event arriving twice, which is the normal case
-- when a response is lost after the write. Recording the id makes a
-- retry answer identically instead of being mistaken for an overtake.
create table if not exists public.logistics_status_event (
  event_id    text primary key,
  order_id    uuid references public.orders(id) on delete cascade,
  sequence    bigint,
  applied     boolean not null default false,
  received_at timestamptz not null default now()
);

create index if not exists logistics_status_event_order
  on public.logistics_status_event (order_id, received_at desc);

-- Written only by the receiver, which runs server-side with the
-- service role and bypasses RLS. No policy is defined because no
-- browser has any business reading the delivery event log --
-- everything a customer needs is denormalised onto their own order
-- row above, which their existing SELECT policy already covers.
alter table public.logistics_status_event enable row level security;

comment on table public.logistics_status_event is
  'Inbound delivery events, for idempotency. Service-role only: RLS is on and there are deliberately no policies.';
