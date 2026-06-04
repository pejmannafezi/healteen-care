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
-- ════════════════════════════════════════════════════════════════════
-- Row Level Security — enabled on EVERY table (hard security requirement).
-- Principle: customers touch only their own rows; public content is read-only
-- to anon; all writes to catalog/admin data require is_admin(). The server
-- uses the service-role key (which bypasses RLS) for trusted operations like
-- creating orders from the Stripe webhook.
-- ════════════════════════════════════════════════════════════════════

-- Enable RLS everywhere
alter table public.profiles               enable row level security;
alter table public.addresses              enable row level security;
alter table public.product_categories     enable row level security;
alter table public.health_needs           enable row level security;
alter table public.products               enable row level security;
alter table public.product_category_map   enable row level security;
alter table public.product_health_need_map enable row level security;
alter table public.conditions             enable row level security;
alter table public.condition_products     enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.invoices               enable row level security;
alter table public.inventory_logs         enable row level security;
alter table public.availability_slots     enable row level security;
alter table public.consultations          enable row level security;
alter table public.webinars               enable row level security;
alter table public.class_registrations    enable row level security;
alter table public.chat_conversations     enable row level security;
alter table public.chat_messages          enable row level security;
alter table public.social_posts           enable row level security;
alter table public.about_content          enable row level security;

-- ── profiles ────────────────────────────────────────────────────────
create policy "profiles self read"   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles admin all"   on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- ── addresses ───────────────────────────────────────────────────────
create policy "addresses own" on public.addresses for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ── public catalog: read for everyone, write for admins ─────────────
-- products: only active ones are visible to non-admins.
create policy "products public read" on public.products for select
  using (is_active or public.is_admin());
create policy "products admin write" on public.products for all
  using (public.is_admin()) with check (public.is_admin());

create policy "categories read"  on public.product_categories for select using (true);
create policy "categories admin" on public.product_categories for all using (public.is_admin()) with check (public.is_admin());

create policy "needs read"  on public.health_needs for select using (true);
create policy "needs admin" on public.health_needs for all using (public.is_admin()) with check (public.is_admin());

create policy "pcmap read"  on public.product_category_map for select using (true);
create policy "pcmap admin" on public.product_category_map for all using (public.is_admin()) with check (public.is_admin());

create policy "phnmap read"  on public.product_health_need_map for select using (true);
create policy "phnmap admin" on public.product_health_need_map for all using (public.is_admin()) with check (public.is_admin());

create policy "conditions read" on public.conditions for select
  using (is_published or public.is_admin());
create policy "conditions admin" on public.conditions for all using (public.is_admin()) with check (public.is_admin());

create policy "cond products read"  on public.condition_products for select using (true);
create policy "cond products admin" on public.condition_products for all using (public.is_admin()) with check (public.is_admin());

create policy "about read"  on public.about_content for select using (true);
create policy "about admin" on public.about_content for all using (public.is_admin()) with check (public.is_admin());

create policy "webinars read" on public.webinars for select
  using (is_published or public.is_admin());
create policy "webinars admin" on public.webinars for all using (public.is_admin()) with check (public.is_admin());

create policy "slots read"  on public.availability_slots for select using (true);
create policy "slots admin" on public.availability_slots for all using (public.is_admin()) with check (public.is_admin());

-- ── orders & related: owner-read, admin-all; writes happen server-side
--    via service role (which bypasses RLS). ──────────────────────────
create policy "orders own read" on public.orders for select
  using (user_id = auth.uid() or public.is_admin());
create policy "orders admin write" on public.orders for all
  using (public.is_admin()) with check (public.is_admin());

create policy "order items own read" on public.order_items for select
  using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
create policy "order items admin write" on public.order_items for all
  using (public.is_admin()) with check (public.is_admin());

create policy "invoices own read" on public.invoices for select
  using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
create policy "invoices admin write" on public.invoices for all
  using (public.is_admin()) with check (public.is_admin());

create policy "inventory admin" on public.inventory_logs for all
  using (public.is_admin()) with check (public.is_admin());

-- ── consultations: owner-read + owner-insert (booking), admin-all ───
create policy "consultations own read" on public.consultations for select
  using (user_id = auth.uid() or public.is_admin());
create policy "consultations own insert" on public.consultations for insert
  with check (user_id = auth.uid());
create policy "consultations admin write" on public.consultations for all
  using (public.is_admin()) with check (public.is_admin());

-- ── class registrations: owner ─────────────────────────────────────
create policy "class reg own" on public.class_registrations for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ── chat: owner-only (anon chats are handled server-side w/ service role)
create policy "chat conv own" on public.chat_conversations for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "chat msg own" on public.chat_messages for all
  using (
    public.is_admin()
    or exists (
      select 1 from public.chat_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.chat_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

-- ── social posts: admin only ────────────────────────────────────────
create policy "social admin" on public.social_posts for all
  using (public.is_admin()) with check (public.is_admin());
-- ════════════════════════════════════════════════════════════════════
-- Auto-create a profile row when a new auth user signs up, and seed the
-- catalog taxonomy from the brand guide.
-- ════════════════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', null))
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Seed: Shop by Product Type (brand guide) ────────────────────────
insert into public.product_categories (slug, name, sort_order) values
  ('tablets',                'Tablets',                 1),
  ('herbal-teas',            'Herbal Teas',             2),
  ('oils',                   'Oils',                    3),
  ('creams',                 'Creams',                  4),
  ('drops',                  'Drops',                   5),
  ('herbal-supplements',     'Herbal Supplements',      6),
  ('pain-relief-equipment',  'Pain Relief Equipment',   7),
  ('medical-devices',        'Medical Devices',         8),
  ('fitness-products',       'Fitness Products',        9),
  ('skin-body-care',         'Skin & Body Care',       10)
on conflict (slug) do nothing;

-- ── Seed: Shop by Health Need (brand guide) ─────────────────────────
insert into public.health_needs (slug, name, sort_order) values
  ('pain-relief',         'Pain Relief',          1),
  ('back-neck-support',   'Back & Neck Support',  2),
  ('joint-support',       'Joint Support',        3),
  ('blood-sugar-support', 'Blood Sugar Support',  4),
  ('brain-support',       'Brain Support',        5),
  ('heart-support',       'Heart Support',        6),
  ('immunity',            'Immunity',             7),
  ('sleep',               'Sleep',                8),
  ('stress-mood',         'Stress & Mood',        9),
  ('detox',               'Detox',               10),
  ('healthy-aging',       'Healthy Aging',       11),
  ('liver-wellness',      'Liver Wellness',      12),
  ('skin-body-care',      'Skin & Body Care',    13),
  ('fitness-support',     'Fitness Support',     14)
on conflict (slug) do nothing;

-- ── Seed: about content placeholder ─────────────────────────────────
insert into public.about_content (id, headline, body)
values (1, 'About Pejman Nafezi', 'Bio coming soon.')
on conflict (id) do nothing;
