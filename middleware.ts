import createMiddleware from "next-intl/middleware";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const intlMiddleware = createMiddleware(routing);

/**
 * Composed middleware:
 *  1. next-intl handles locale routing and produces the response.
 *  2. Supabase refreshes the auth session cookie onto that same response.
 *
 * If Supabase env vars are absent (e.g. before keys are configured) we skip
 * step 2 so the site still serves — auth-gated pages re-check server-side.
 */
export async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anon) {
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: CookieToSet[]) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    });
    // Touch the session so it refreshes if needed.
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
