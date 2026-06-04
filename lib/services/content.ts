import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface About {
  headline: string | null;
  body: string | null;
  image_url: string | null;
  resume_url: string | null;
}

export async function getAbout(): Promise<About> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("about_content")
    .select("headline, body, image_url, resume_url")
    .eq("id", 1)
    .single();
  return (data as About) ?? { headline: null, body: null, image_url: null, resume_url: null };
}

export async function getStories() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("stories")
    .select("id, media_url, media_type, caption, link_url")
    .eq("is_active", true)
    .order("sort_order")
    .limit(3);
  return data ?? [];
}

export async function getPublishedBlogPosts() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, cover_image, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  return data ?? [];
}

export async function getBlogPost(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, excerpt, cover_image, content, published_at, is_published")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data;
}

export async function getPublishedWebinars() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("webinars")
    .select("id, slug, title, description, scheduled_at, duration_min, price_cents, capacity, recording_url")
    .eq("is_published", true)
    .order("scheduled_at", { ascending: true });
  return data ?? [];
}

export async function getWebinar(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("webinars")
    .select("id, slug, title, description, scheduled_at, duration_min, price_cents, capacity, recording_url, is_published")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data;
}

/** The current live session (live first, otherwise the next scheduled). */
export async function getActiveOrNextLive() {
  const supabase = await createSupabaseServerClient();
  const { data: liveNow } = await supabase
    .from("live_sessions")
    .select("id, title, description, status, scheduled_at, youtube_url, instagram_url, meeting_url")
    .eq("status", "live")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (liveNow) return liveNow;

  const { data: next } = await supabase
    .from("live_sessions")
    .select("id, title, description, status, scheduled_at, youtube_url, instagram_url, meeting_url")
    .eq("status", "scheduled")
    .gt("scheduled_at", new Date(Date.now() - 3600_000).toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return next ?? null;
}

export async function getLiveFeaturedProducts(liveId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("live_featured_products")
    .select("products(id, slug, name, price_cents, currency, images, stock_qty)")
    .eq("live_session_id", liveId);
  return (data ?? []).map((r: { products: unknown }) => r.products).filter(Boolean);
}
