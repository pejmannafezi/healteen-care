import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { profile } = await requireAdmin();
  const name = profile?.full_name ?? "Admin";

  return (
    <div className="container-page py-8 lg:py-10">
      <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="mt-1 text-3xl font-bold text-forest">Dashboard</h1>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-border bg-card py-1.5 pe-5 ps-2 shadow-card">
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-forest text-sm font-bold uppercase text-cream"
            >
              {name.charAt(0)}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-forest">{name}</p>
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <ShieldCheck className="size-3 text-gold-600" /> Store manager
              </p>
            </div>
          </div>
        </div>
        <div className="gold-divider mt-6" />
      </header>

      <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:h-fit lg:self-start">
          <AdminNav />
          <Link
            href="/"
            className="mt-4 inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-nature transition-colors hover:bg-nature/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <ArrowLeft className="size-3.5 rtl:rotate-180" /> Back to site
          </Link>
        </aside>
        <div className="min-w-0 animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
