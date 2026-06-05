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

// Deterministic fulfillment report for the admin Deliveries page.
// Exact counts straight from the DB (no LLM) behind requireAdmin.
export async function getDeliveryReport() {
  const db = createSupabaseAdminClient();
  const [products, orders] = await Promise.all([
    db
      .from("products")
      .select("id, name, stock_qty, low_stock_threshold, is_active")
      .order("stock_qty", { ascending: true }),
    db
      .from("orders")
      .select(
        "id, email, status, total_cents, currency, created_at, delivered_at, tracking_number, tracking_carrier, tracking_status, tracking_url, eta, shipping_address"
      )
      .order("created_at", { ascending: false }),
  ]);

  const prod = products.data ?? [];
  const ord = orders.data ?? [];

  const totalStock = prod.reduce((n, p) => n + (p.stock_qty ?? 0), 0);
  const lowStock = prod.filter((p) => p.stock_qty <= p.low_stock_threshold);

  // "In post / out for delivery" = handed to the carrier, in transit.
  const inPost = ord.filter((o) => o.status === "shipped");
  // Delivered (with date).
  const delivered = ord.filter((o) => o.status === "delivered");
  // "Not delivered" = every order that isn't delivered yet (all of them).
  const notDelivered = ord.filter((o) => o.status !== "delivered");

  return {
    products: prod,
    totalStock,
    lowStock,
    inPost,
    delivered,
    notDelivered,
    totalOrders: ord.length,
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
