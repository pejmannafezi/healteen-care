import { defineRouting } from "next-intl/routing";

/**
 * English is the active language (US market first). Farsi is wired in but
 * will be enabled once translations are provided — the architecture is ready.
 * `localePrefix: "as-needed"` keeps English URLs clean (no /en prefix).
 */
export const routing = defineRouting({
  locales: ["en", "fa"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
