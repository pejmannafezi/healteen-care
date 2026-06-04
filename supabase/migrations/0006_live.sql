-- ════════════════════════════════════════════════════════════════════
-- M9 + M11: Blog, Stories, Live sessions, and Live notification subscribers.
-- ════════════════════════════════════════════════════════════════════

create type live_status as enum ('scheduled', 'live', 'ended');
create type story_media as enum ('image', 'video');

-- ── Blog ────────────────────────────────────────────────────────────
create table public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  excerpt      text,
  cover_image  text,
  content      text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_blog_updated before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- ── Stories (max 3 active, image or short video) ────────────────────
create table public.stories (
  id          uuid primary key default gen_random_uuid(),
  media_url   text not null,
  media_type  story_media not null default 'image',
  caption     text,
  link_url    text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── Live sessions ───────────────────────────────────────────────────
create table public.live_sessions (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  scheduled_at  timestamptz,
  status        live_status not null default 'scheduled',
  youtube_url   text,
  instagram_url text,
  meeting_url   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_live_updated before update on public.live_sessions
  for each row execute function public.set_updated_at();

create table public.live_featured_products (
  live_session_id uuid references public.live_sessions(id) on delete cascade,
  product_id      uuid references public.products(id) on delete cascade,
  primary key (live_session_id, product_id)
);

-- ── Live notification subscribers (email + web push) ────────────────
create table public.live_subscribers (
  id                uuid primary key default gen_random_uuid(),
  email             text,
  user_id           uuid references public.profiles(id) on delete set null,
  push_endpoint     text,
  push_subscription jsonb,
  created_at        timestamptz not null default now(),
  unique (email),
  unique (push_endpoint)
);

-- ── RLS ─────────────────────────────────────────────────────────────
alter table public.blog_posts             enable row level security;
alter table public.stories                enable row level security;
alter table public.live_sessions          enable row level security;
alter table public.live_featured_products enable row level security;
alter table public.live_subscribers       enable row level security;

create policy "blog read"  on public.blog_posts for select using (is_published or public.is_admin());
create policy "blog admin" on public.blog_posts for all using (public.is_admin()) with check (public.is_admin());

create policy "stories read"  on public.stories for select using (is_active or public.is_admin());
create policy "stories admin" on public.stories for all using (public.is_admin()) with check (public.is_admin());

create policy "live read"  on public.live_sessions for select using (true);
create policy "live admin" on public.live_sessions for all using (public.is_admin()) with check (public.is_admin());

create policy "live fp read"  on public.live_featured_products for select using (true);
create policy "live fp admin" on public.live_featured_products for all using (public.is_admin()) with check (public.is_admin());

-- Subscribers: only admins can read; inserts happen server-side via service role.
create policy "subs admin" on public.live_subscribers for all using (public.is_admin()) with check (public.is_admin());
