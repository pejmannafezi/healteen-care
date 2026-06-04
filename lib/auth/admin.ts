import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Guards admin pages/actions. Redirects non-admins. Returns the admin user.
 * Defence in depth: RLS already restricts admin data, but we also gate the UI.
 */
export async function requireAdmin() {
  const locale = await getLocale();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect({ href: "/login", locale });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "admin") redirect({ href: "/", locale });

  return { user: user!, profile };
}
