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
