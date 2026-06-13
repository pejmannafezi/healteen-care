import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Editable, DB-backed site content (managed from /admin/content).
 * Text is stored per-locale; images are shared across locales (locale "_").
 * Every getter falls back to the value passed in, so the site keeps working
 * even when nothing has been customised yet.
 */
export interface SiteContent {
  /** Localised text for `key`, or `fallback` when not set. */
  text: (key: string, fallback: string) => string;
  /** Shared image URL for `key`, or `fallback` when not set. */
  image: (key: string, fallback: string) => string;
}

export async function getSiteContent(locale: string): Promise<SiteContent> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("site_content")
    .select("key, locale, text_value, image_url");

  const textMap = new Map<string, string>();
  const imageMap = new Map<string, string>();
  for (const row of data ?? []) {
    if (row.text_value) textMap.set(`${row.locale}:${row.key}`, row.text_value);
    if (row.image_url) imageMap.set(row.key, row.image_url);
  }

  return {
    text: (key, fallback) => textMap.get(`${locale}:${key}`) || fallback,
    image: (key, fallback) => imageMap.get(key) || fallback,
  };
}
