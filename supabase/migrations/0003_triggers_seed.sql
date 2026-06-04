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
