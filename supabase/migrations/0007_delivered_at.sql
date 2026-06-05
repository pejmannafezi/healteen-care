-- ════════════════════════════════════════════════════════════════════
-- Healteen Care — record the moment an order is marked delivered.
-- Used by the admin Deliveries report (delivered list "with date").
-- ════════════════════════════════════════════════════════════════════

alter table public.orders add column if not exists delivered_at timestamptz;
