import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <span className="text-sm text-forest/60">{profile?.full_name ?? "Admin"}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <AdminNav />
          <Link href="/" className="mt-4 block px-3 text-xs text-nature hover:underline">
            ← Back to site
          </Link>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
