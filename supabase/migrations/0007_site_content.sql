-- Editable, DB-backed site content managed from /admin/content.
-- Text is stored per-locale; images are shared across locales (locale '_').

create table if not exists public.site_content (
  key        text not null,
  locale     text not null default 'en',
  text_value text,
  image_url  text,
  updated_at timestamptz not null default now(),
  primary key (key, locale)
);

alter table public.site_content enable row level security;

-- Public can read content (rendered on the public site).
drop policy if exists "site_content public read" on public.site_content;
create policy "site_content public read"
  on public.site_content for select
  using (true);

-- Only admins can write (service-role server actions also bypass RLS).
drop policy if exists "site_content admin write" on public.site_content;
create policy "site_content admin write"
  on public.site_content for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
