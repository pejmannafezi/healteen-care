-- ════════════════════════════════════════════════════════════════════
-- M6: Consultation booking — settings + idempotency.
-- (consultations & availability_slots tables already exist from 0001.)
-- ════════════════════════════════════════════════════════════════════

-- Single-row settings the admin edits (price, duration, video room link).
create table public.consultation_settings (
  id           int primary key default 1 check (id = 1),
  price_cents  int  not null default 5000,
  duration_min int  not null default 30,
  video_link   text,
  phone_note   text,
  is_enabled   boolean not null default true,
  updated_at   timestamptz not null default now()
);
create trigger trg_consultation_settings_updated before update on public.consultation_settings
  for each row execute function public.set_updated_at();

alter table public.consultation_settings enable row level security;
create policy "consult settings read"  on public.consultation_settings for select using (true);
create policy "consult settings admin" on public.consultation_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- Idempotency: one consultation per Stripe checkout session (NULLs allowed).
alter table public.consultations add column if not exists stripe_checkout_session text;
alter table public.consultations
  add constraint consultations_checkout_session_unique unique (stripe_checkout_session);

-- Seed default settings ($50, 30 min).
insert into public.consultation_settings (id, price_cents, duration_min, phone_note)
values (1, 5000, 30, 'We will call you at the phone number on your account at the scheduled time.')
on conflict (id) do nothing;
