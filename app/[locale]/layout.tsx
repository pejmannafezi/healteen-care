import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ChatWidget } from "@/components/site/chat-widget";
import { EditModeProvider } from "@/components/site/edit-mode";
import { EditToolbar } from "@/components/site/edit-toolbar";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === "fa" ? "rtl" : "ltr";

  // Auth state for the header (logged-in vs guest, admin link).
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    isAdmin = p?.role === "admin";
  }
  const headerUser = user ? { email: user.email ?? "", isAdmin } : null;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className={fontVariables}>
      <body className="min-h-dvh flex flex-col bg-cream">
        <NextIntlClientProvider messages={messages}>
          <EditModeProvider isAdmin={isAdmin}>
            <a href="#main-content" className="skip-link">
              {locale === "fa" ? "پرش به محتوای اصلی" : "Skip to main content"}
            </a>
            <SiteHeader user={headerUser} />
            <main id="main-content" className="flex-1">{children}</main>
            <SiteFooter />
            <ChatWidget />
            <EditToolbar />
          </EditModeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
