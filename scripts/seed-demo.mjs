// Seeds demo products + conditions so the shop/library are visible.
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-demo.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
const db = createClient(url, key, { auth: { persistSession: false } });

const products = [
  {
    slug: "turmeric-joint-comfort",
    name: "Turmeric Joint Comfort Tablets",
    type: "tablet",
    price_cents: 2499,
    size: "60 tablets · 500mg",
    short_description: "Standardized turmeric (curcumin) to help support joint comfort and everyday mobility.",
    history: "Turmeric (Curcuma longa) has been used in Ayurvedic and traditional Asian wellness for over 4,000 years, prized for its golden root.",
    benefits: "Helps support healthy joints, normal mobility, and the body's natural response to everyday physical stress.",
    symptoms_supported: "Occasional joint stiffness, everyday aches after activity, general joint comfort.",
    how_to_use: "Take 1 tablet twice daily with food and water, or as directed by your healthcare provider.",
    contraindications: "Not recommended during pregnancy or nursing. Avoid if you have gallbladder issues or take blood-thinning medication. Stop use before surgery.",
    ingredients: "Turmeric root extract (95% curcuminoids), black pepper extract (piperine), vegetable cellulose capsule.",
    trust_badges: ["gmp", "lab_tested", "doctor_approved"],
    stock_qty: 48,
    weight_grams: 120,
    categories: ["tablets"],
    needs: ["joint-support", "pain-relief"],
  },
  {
    slug: "chamomile-calm-tea",
    name: "Chamomile Calm Herbal Tea",
    type: "herbal_tea",
    price_cents: 1450,
    size: "20 tea bags",
    short_description: "A soothing caffeine-free blend to help support relaxation and restful evenings.",
    history: "Chamomile has been brewed as a calming evening tea across Europe and the Middle East for centuries.",
    benefits: "Helps support relaxation, a calm mood, and a gentle wind-down before sleep.",
    symptoms_supported: "Occasional restlessness, difficulty unwinding, evening tension.",
    how_to_use: "Steep one bag in hot water for 5 minutes. Enjoy 30–60 minutes before bedtime.",
    contraindications: "Avoid if allergic to plants in the daisy (Asteraceae) family. Consult your provider if pregnant or taking sedatives.",
    ingredients: "Organic chamomile flowers, lemon balm, lavender.",
    trust_badges: ["gmp", "lab_tested"],
    stock_qty: 60,
    weight_grams: 60,
    categories: ["herbal-teas"],
    needs: ["sleep", "stress-mood"],
  },
  {
    slug: "arnica-warming-muscle-oil",
    name: "Arnica Warming Muscle Oil",
    type: "oil",
    price_cents: 1900,
    size: "100 ml",
    short_description: "A warming botanical massage oil to help soothe tired muscles in the back and neck.",
    history: "Arnica montana, a mountain flower, has a long folk tradition for post-activity muscle care.",
    benefits: "Helps support relief of everyday muscle tension and comfort in the back, neck, and shoulders.",
    symptoms_supported: "Tired, tense muscles; everyday back and neck discomfort after activity.",
    how_to_use: "Massage a small amount into the affected area 2–3 times daily. For external use only.",
    contraindications: "Do not apply to broken skin or open wounds. Not for use during pregnancy. Avoid if allergic to arnica or daisy-family plants.",
    ingredients: "Arnica-infused sunflower oil, ginger root extract, menthol, rosemary essential oil.",
    trust_badges: ["lab_tested", "third_party"],
    stock_qty: 35,
    weight_grams: 140,
    categories: ["oils"],
    needs: ["pain-relief", "back-neck-support"],
  },
  {
    slug: "ashwagandha-daily-balance-drops",
    name: "Ashwagandha Daily Balance Drops",
    type: "drops",
    price_cents: 2999,
    size: "30 ml liquid extract",
    short_description: "An adaptogenic herbal extract to help support the body's response to daily stress.",
    history: "Ashwagandha (Withania somnifera) is a cornerstone adaptogen in Ayurvedic tradition, known as a 'rejuvenating' herb.",
    benefits: "Helps support a balanced response to everyday stress, steady energy, and healthy aging.",
    symptoms_supported: "Everyday stress, low daytime energy, feeling run-down.",
    how_to_use: "Add 1 ml (about 30 drops) to water or tea once daily.",
    contraindications: "Not recommended during pregnancy. Consult your provider if you have a thyroid condition or take sedatives or immunosuppressants.",
    ingredients: "Ashwagandha root extract, vegetable glycerin, purified water, natural ethanol.",
    trust_badges: ["gmp", "lab_tested", "third_party"],
    stock_qty: 42,
    weight_grams: 90,
    categories: ["drops"],
    needs: ["stress-mood", "healthy-aging"],
  },
  {
    slug: "ginger-immunity-support",
    name: "Ginger Immunity Support",
    type: "supplement",
    price_cents: 2100,
    size: "90 capsules",
    short_description: "Concentrated ginger with vitamin C to help support everyday immune wellness.",
    history: "Ginger has been a warming wellness root in traditional kitchens and remedies for thousands of years.",
    benefits: "Helps support a healthy immune response and digestive comfort.",
    symptoms_supported: "Seasonal immune support needs, occasional digestive upset.",
    how_to_use: "Take 1 capsule daily with food.",
    contraindications: "Consult your provider if pregnant, taking blood thinners, or before surgery.",
    ingredients: "Ginger root extract, acerola cherry (vitamin C), zinc, vegetable capsule.",
    trust_badges: ["gmp", "doctor_approved"],
    stock_qty: 55,
    weight_grams: 110,
    categories: ["herbal-supplements"],
    needs: ["immunity"],
  },
  {
    slug: "cinnamon-blood-sugar-support",
    name: "Cinnamon Blood Sugar Support Tablets",
    type: "tablet",
    price_cents: 2250,
    size: "60 tablets",
    short_description: "Ceylon cinnamon with chromium to help support healthy blood sugar already in the normal range.",
    history: "Ceylon cinnamon, the 'true cinnamon', has been valued as a warming wellness spice for centuries.",
    benefits: "Helps support healthy blood sugar metabolism already within the normal range and daily energy balance.",
    symptoms_supported: "Maintaining steady daily energy; supporting balanced metabolism.",
    how_to_use: "Take 1 tablet twice daily with meals.",
    contraindications: "Not a substitute for diabetes medication. If you have diabetes or take blood-sugar medication, consult your provider before use. Avoid during pregnancy.",
    ingredients: "Ceylon cinnamon bark extract, chromium picolinate, vegetable cellulose.",
    trust_badges: ["lab_tested", "doctor_approved"],
    stock_qty: 40,
    weight_grams: 115,
    categories: ["tablets"],
    needs: ["blood-sugar-support"],
  },
];

const conditions = [
  {
    slug: "back-neck-pain",
    name: "Back & Neck Pain",
    description: "Everyday back and neck discomfort is common with age, posture, and activity. Natural approaches focus on supporting muscle comfort and mobility.",
    symptoms: "Stiffness in the morning, tension after sitting or activity, tight shoulders and neck.",
    usage_notes: "Topical warming oils may help support muscle comfort when massaged into the area. Anti-inflammatory herbs like turmeric may help support the body's natural recovery. Gentle movement and stretching are encouraged.",
    who_should_not_use: "Pregnant or nursing individuals should avoid arnica products. Anyone on blood thinners should consult a provider before using turmeric. Seek medical care for severe, radiating, or persistent pain.",
    products: [
      { slug: "arnica-warming-muscle-oil", usage: "Massage into the back and neck 2–3 times daily." },
      { slug: "turmeric-joint-comfort", usage: "Take daily to help support the body's recovery response." },
    ],
  },
  {
    slug: "trouble-sleeping",
    name: "Trouble Sleeping",
    description: "Occasional restlessness and difficulty winding down can affect rest. Calming herbs and a consistent evening routine may help support relaxation.",
    symptoms: "Difficulty falling asleep, restless evenings, feeling tense at night.",
    usage_notes: "Caffeine-free calming teas like chamomile may help support a relaxed wind-down. Adaptogens like ashwagandha may help support a balanced stress response that contributes to restful evenings.",
    who_should_not_use: "Those allergic to daisy-family plants should avoid chamomile. Ashwagandha is not recommended during pregnancy or with sedative medication. Consult a provider for ongoing sleep problems.",
    products: [
      { slug: "chamomile-calm-tea", usage: "Drink 30–60 minutes before bed." },
      { slug: "ashwagandha-daily-balance-drops", usage: "Take once daily to help support a calm stress response." },
    ],
  },
  {
    slug: "joint-stiffness",
    name: "Joint Stiffness",
    description: "Joint stiffness and reduced mobility are common with healthy aging and activity. Herbal support focuses on comfort and everyday movement.",
    symptoms: "Stiff joints, especially in the morning; reduced flexibility; discomfort after activity.",
    usage_notes: "Curcumin from turmeric may help support healthy joints and the body's response to everyday stress. Warming topical oils may help support comfort and mobility.",
    who_should_not_use: "Avoid turmeric supplements if pregnant, on blood thinners, or before surgery. Consult your provider for persistent joint swelling or pain.",
    products: [
      { slug: "turmeric-joint-comfort", usage: "Take twice daily with food." },
      { slug: "arnica-warming-muscle-oil", usage: "Massage into stiff joints as needed." },
    ],
  },
  {
    slug: "low-immunity",
    name: "Low Immunity",
    description: "Supporting your everyday immune wellness is especially important during seasonal changes. Certain herbs and nutrients may help support a healthy immune response.",
    symptoms: "Feeling run-down during seasonal changes, wanting extra daily immune support.",
    usage_notes: "Ginger combined with vitamin C and zinc may help support a healthy immune response and digestive comfort as part of a balanced routine.",
    who_should_not_use: "Consult your provider if pregnant, on blood thinners, or before surgery. Not a substitute for medical care during illness.",
    products: [
      { slug: "ginger-immunity-support", usage: "Take one capsule daily with food." },
    ],
  },
];

// ── Insert products ──
const productIdBySlug = {};
for (const p of products) {
  const { categories, needs, ...row } = p;
  const { data, error } = await db
    .from("products")
    .upsert(row, { onConflict: "slug" })
    .select("id, slug")
    .single();
  if (error) { console.error("product", p.slug, error.message); continue; }
  productIdBySlug[data.slug] = data.id;
  console.log("product ✓", data.slug);
}

// ── Map products to categories / needs ──
const { data: cats } = await db.from("product_categories").select("id, slug");
const { data: needsRows } = await db.from("health_needs").select("id, slug");
const catId = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
const needId = Object.fromEntries(needsRows.map((n) => [n.slug, n.id]));

for (const p of products) {
  const pid = productIdBySlug[p.slug];
  if (!pid) continue;
  for (const cs of p.categories) {
    if (catId[cs]) await db.from("product_category_map").upsert({ product_id: pid, category_id: catId[cs] });
  }
  for (const ns of p.needs) {
    if (needId[ns]) await db.from("product_health_need_map").upsert({ product_id: pid, health_need_id: needId[ns] });
  }
}
console.log("maps ✓");

// ── Insert conditions + links ──
for (const c of conditions) {
  const { products: linked, ...row } = c;
  const { data, error } = await db
    .from("conditions")
    .upsert(row, { onConflict: "slug" })
    .select("id, slug")
    .single();
  if (error) { console.error("condition", c.slug, error.message); continue; }
  for (const l of linked) {
    const pid = productIdBySlug[l.slug];
    if (pid) await db.from("condition_products").upsert({ condition_id: data.id, product_id: pid, usage_instructions: l.usage });
  }
  console.log("condition ✓", data.slug);
}

console.log("\n✅ Demo seed complete.");
