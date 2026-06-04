-- Idempotency guards so an order is created exactly once per Stripe session,
-- even if the webhook and the success-page confirmation race each other.
-- (Postgres treats NULLs as distinct, so many non-checkout rows can stay null.)
alter table public.orders
  add constraint orders_checkout_session_unique unique (stripe_checkout_session);

alter table public.invoices
  add constraint invoices_order_unique unique (order_id);
