-- ════════════════════════════════════════════════════════════════════
-- Healteen Care — core schema
-- Money is stored in integer cents. Timestamps are timestamptz (UTC).
-- ════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Enums ───────────────────────────────────────────────────────────
create type user_role          as enum ('customer', 'admin');
create type product_type       as enum (
  'tablet','herbal_tea','oil','cream','drops','supplement',
  'pain_relief_equipment','medical_device','fitness','skin_body'
);
create type order_status        as enum (
  'pending','paid','processing','shipped','delivered','cancelled','refunded'
);
create type consultation_type   as enum ('video','phone');
create type consultation_status as enum ('pending_payment','confirmed','completed','cancelled');
create type social_platform     as enum ('instagram','tiktok','email','blog');
create type social_status       as enum ('draft','approved','scheduled','published');
create type chat_agent          as enum ('support','sales');

-- ── updated_at helper ───────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ── profiles (extends auth.users) ───────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role   not null default 'customer',
  full_name   text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Admin check used throughout RLS. SECURITY DEFINER so it can read profiles
-- regardless of the caller's row-level permissions (avoids recursive RLS).
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── addresses ───────────────────────────────────────────────────────
create table public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  full_name   text,
  line1       text not null,
  line2       text,
  city        text not null,
  state       text,
  postal_code text not null,
  country     text not null default 'US',
  phone       text,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);
create index on public.addresses(user_id);

-- ── taxonomy: Shop by Product Type / Shop by Health Need ────────────
create table public.product_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  sort_order  int not null default 0
);

create table public.health_needs (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  sort_order  int not null default 0
);

-- ── products ────────────────────────────────────────────────────────
create table public.products (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  name                text not null,
  type                product_type not null,
  price_cents         int  not null check (price_cents >= 0),
  currency            text not null default 'USD',
  size                text,                 -- size / packaging info
  short_description   text,
  history             text,                 -- herb origin story
  benefits            text,                 -- what it supports
  symptoms_supported  text,                 -- symptoms / needs it may support
  how_to_use          text,
  contraindications   text,                 -- WHO SHOULD NOT USE IT (safety)
  ingredients         text,
  trust_badges        text[] not null default '{}',  -- gmp, lab_tested, third_party, doctor_approved
  images              text[] not null default '{}',
  lab_doc_url         text,
  stock_qty           int  not null default 0,
  low_stock_threshold int  not null default 5,
  weight_grams        int,                  -- for shipping rate calc
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index on public.products(type);
create index on public.products(is_active);
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_category_map (
  product_id  uuid references public.products(id) on delete cascade,
  category_id uuid references public.product_categories(id) on delete cascade,
  primary key (product_id, category_id)
);
create table public.product_health_need_map (
  product_id     uuid references public.products(id) on delete cascade,
  health_need_id uuid references public.health_needs(id) on delete cascade,
  primary key (product_id, health_need_id)
);

-- ── conditions (Health Library) ─────────────────────────────────────
create table public.conditions (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  name              text not null,
  description       text,
  symptoms          text,
  usage_notes       text,                   -- general how-to-use guidance
  who_should_not_use text,                  -- safety / contraindications
  image_url         text,
  is_published      boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create trigger trg_conditions_updated before update on public.conditions
  for each row execute function public.set_updated_at();

create table public.condition_products (
  condition_id uuid references public.conditions(id) on delete cascade,
  product_id   uuid references public.products(id) on delete cascade,
  usage_instructions text,
  primary key (condition_id, product_id)
);

-- ── orders ──────────────────────────────────────────────────────────
create table public.orders (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid references public.profiles(id) on delete set null,
  email                  text not null,
  status                 order_status not null default 'pending',
  subtotal_cents         int not null default 0,
  shipping_cents         int not null default 0,
  tax_cents              int not null default 0,
  total_cents            int not null default 0,
  currency               text not null default 'USD',
  shipping_address       jsonb,
  stripe_checkout_session text,
  stripe_payment_intent  text,
  shippo_transaction_id  text,
  tracking_number        text,
  tracking_carrier       text,
  tracking_status        text,
  tracking_url           text,
  eta                    timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index on public.orders(user_id);
create index on public.orders(status);
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders(id) on delete cascade,
  product_id       uuid references public.products(id) on delete set null,
  name_snapshot    text not null,
  unit_price_cents int  not null,
  quantity         int  not null check (quantity > 0)
);
create index on public.order_items(order_id);

create table public.invoices (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  number     text unique not null,
  pdf_url    text,
  created_at timestamptz not null default now()
);

create table public.inventory_logs (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  delta      int  not null,
  reason     text not null,
  created_at timestamptz not null default now()
);
create index on public.inventory_logs(product_id);

-- ── consultations ───────────────────────────────────────────────────
create table public.availability_slots (
  id              uuid primary key default gen_random_uuid(),
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  is_booked       boolean not null default false,
  created_at      timestamptz not null default now()
);
create index on public.availability_slots(starts_at);

create table public.consultations (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references public.profiles(id) on delete set null,
  slot_id               uuid references public.availability_slots(id) on delete set null,
  type                  consultation_type not null,
  status                consultation_status not null default 'pending_payment',
  scheduled_at          timestamptz,
  duration_min          int not null default 30,
  price_cents           int not null,
  currency              text not null default 'USD',
  stripe_payment_intent text,
  meeting_link          text,
  phone_number          text,
  google_event_id       text,
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index on public.consultations(user_id);
create trigger trg_consultations_updated before update on public.consultations
  for each row execute function public.set_updated_at();

-- ── webinars / online classes (future-ready, DB now) ────────────────
create table public.webinars (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text,
  scheduled_at  timestamptz,
  duration_min  int,
  price_cents   int not null default 0,
  capacity      int,
  recording_url text,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now()
);
create table public.class_registrations (
  id         uuid primary key default gen_random_uuid(),
  webinar_id uuid not null references public.webinars(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (webinar_id, user_id)
);

-- ── AI chat (support / sales agents) ────────────────────────────────
create table public.chat_conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete set null,
  agent      chat_agent not null default 'support',
  created_at timestamptz not null default now()
);
create index on public.chat_conversations(user_id);

create table public.chat_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  role            text not null check (role in ('user','assistant')),
  content         text not null,
  created_at      timestamptz not null default now()
);
create index on public.chat_messages(conversation_id);

-- ── social posts (social agent drafts → admin approval) ─────────────
create table public.social_posts (
  id            uuid primary key default gen_random_uuid(),
  platform      social_platform not null,
  title         text,
  content       text not null,
  image_url     text,
  status        social_status not null default 'draft',
  scheduled_for timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_social_updated before update on public.social_posts
  for each row execute function public.set_updated_at();

-- ── about content (single editable record) ──────────────────────────
create table public.about_content (
  id         int primary key default 1 check (id = 1),
  headline   text,
  body       text,
  image_url  text,
  resume_url text,
  updated_at timestamptz not null default now()
);
create trigger trg_about_updated before update on public.about_content
  for each row execute function public.set_updated_at();
