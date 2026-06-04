import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// NOTE: these helpers use the service-role client and must ONLY be called from
// admin-guarded pages/actions (see lib/auth/admin.ts requireAdmin).

export async function getAdminOverview() {
  const db = createSupabaseAdminClient();
  const [products, orders, conditions, paidOrders, lowStock] = await Promise.all([
    db.from("products").select("id", { count: "exact", head: true }),
    db.from("orders").select("id", { count: "exact", head: true }),
    db.from("conditions").select("id", { count: "exact", head: true }),
    db.from("orders").select("total_cents").eq("status", "paid"),
    db.from("products").select("id, name, stock_qty, low_stock_threshold"),
  ]);

  const revenueCents = (paidOrders.data ?? []).reduce((n, o) => n + (o.total_cents ?? 0), 0);
  const low = (lowStock.data ?? []).filter((p) => p.stock_qty <= p.low_stock_threshold);

  const { data: recent } = await db
    .from("orders")
    .select("id, email, status, total_cents, currency, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  return {
    productCount: products.count ?? 0,
    orderCount: orders.count ?? 0,
    conditionCount: conditions.count ?? 0,
    revenueCents,
    lowStock: low,
    recentOrders: recent ?? [],
  };
}

export async function adminListProducts() {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("products")
    .select("id, name, slug, type, price_cents, currency, stock_qty, is_active, images")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function adminGetProduct(id: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db.from("products").select("*").eq("id", id).single();
  return data;
}

export async function adminListOrders() {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("orders")
    .select("id, email, status, total_cents, currency, created_at, tracking_number, tracking_status, shipping_address, order_items(name_snapshot, quantity)")
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function adminListConditions() {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("conditions")
    .select("id, name, slug, is_published, image_url")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function adminTaxonomies() {
  const db = createSupabaseAdminClient();
  const [cats, needs] = await Promise.all([
    db.from("product_categories").select("id, slug, name").order("sort_order"),
    db.from("health_needs").select("id, slug, name").order("sort_order"),
  ]);
  return { categories: cats.data ?? [], needs: needs.data ?? [] };
}
