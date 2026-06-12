import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import {
  FileText,
  Truck,
  Package,
  CalendarClock,
  Video,
  Phone,
  Leaf,
  LogOut,
  UserRound,
  ShieldCheck,
  ArrowRight,
  Clock,
  BadgeCheck,
  PackageOpen,
  PackageCheck,
  XCircle,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyOrders } from "@/lib/services/account";
import { getMyConsultations } from "@/lib/services/consultations";
import { signOutAction } from "../../(auth)/actions";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  pending: "honey",
  paid: "mint",
  processing: "gold",
  shipped: "nature",
  delivered: "forest",
  cancelled: "terracotta",
  refunded: "muted",
};

const STATUS_ICON: Record<string, LucideIcon> = {
  pending: Clock,
  paid: BadgeCheck,
  processing: PackageOpen,
  shipped: Truck,
  delivered: PackageCheck,
  cancelled: XCircle,
  refunded: RotateCcw,
};

const CONSULT_VARIANT: Record<string, BadgeProps["variant"]> = {
  pending: "honey",
  scheduled: "nature",
  confirmed: "nature",
  completed: "forest",
  cancelled: "terracotta",
};

export default async function AccountPage() {
  const locale = await getLocale();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  const [{ data: profile }, orders, consultations] = await Promise.all([
    supabase.from("profiles").select("full_name, role, phone").eq("id", user!.id).single(),
    getMyOrders(),
    getMyConsultations(),
  ]);

  const initial = (profile?.full_name ?? user!.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <>
      {/* ── Account hero band ── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-cream to-[#EFEADD]/40">
        <div aria-hidden className="pointer-events-none absolute -top-24 -end-24 opacity-[0.04]">
          <Leaf className="size-[20rem] text-forest" strokeWidth={0.75} />
        </div>
        <div className="container-page relative py-12 md:py-16">
          <div className="flex flex-wrap items-center justify-between gap-6 animate-fade-up">
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className="flex size-14 shrink-0 items-center justify-center rounded-full bg-forest text-xl font-bold text-cream shadow-soft ring-2 ring-gold/40"
              >
                {initial}
              </span>
              <div>
                <p className="eyebrow">Your wellness space</p>
                <h1 className="mt-0.5 text-3xl font-bold text-forest md:text-4xl">My Account</h1>
                <p className="mt-1 text-sm text-muted-foreground">{user!.email}</p>
              </div>
            </div>
            <form action={signOutAction}>
              <Button variant="outline" size="sm" type="submit" className="h-11">
                <LogOut className="size-4 rtl:rotate-180" aria-hidden /> Sign out
              </Button>
            </form>
          </div>
          <div className="gold-divider mt-8" />
        </div>
      </section>

      <div className="container-page py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Profile ── */}
          <Card className="h-fit rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-lg">
                <span className="flex size-9 items-center justify-center rounded-full bg-gold/15">
                  <UserRound className="size-5 text-gold-600" aria-hidden />
                </span>
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Name
                </p>
                <p className="mt-0.5 text-sm font-medium text-forest">
                  {profile?.full_name ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Phone
                </p>
                <p className="mt-0.5 text-sm font-medium text-forest" dir="ltr">
                  {profile?.phone ?? "—"}
                </p>
              </div>
              {profile?.role === "admin" && (
                <div className="border-t border-border pt-4">
                  <a
                    href="/admin"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-forest/30 px-5 text-sm font-semibold text-forest transition-colors hover:border-forest/50 hover:bg-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <ShieldCheck className="size-4 text-gold-600" aria-hidden />
                    Admin dashboard
                    <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Orders ── */}
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-nature/10">
                <Package className="size-5 text-nature" aria-hidden />
              </span>
              <h2 className="text-xl font-bold text-forest md:text-2xl">My Orders</h2>
              {orders.length > 0 && (
                <Badge variant="muted" className="tabular-nums">
                  {orders.length}
                </Badge>
              )}
            </div>

            {orders.length === 0 ? (
              <Card className="rounded-2xl border-dashed">
                <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-cream">
                    <PackageOpen className="size-6 text-forest/40" aria-hidden />
                  </span>
                  <p className="text-sm text-muted-foreground">You have no orders yet.</p>
                  <a
                    href="/shop"
                    className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-nature underline-offset-4 hover:underline"
                  >
                    Browse the shop
                    <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
                  </a>
                </CardContent>
              </Card>
            ) : (
              <ul className="space-y-4">
                {orders.map((o) => {
                  const StatusIcon = STATUS_ICON[o.status] ?? Clock;
                  return (
                    <Card
                      key={o.id}
                      className="overflow-hidden rounded-2xl transition-shadow duration-300 hover:shadow-soft"
                    >
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-forest">
                              Order{" "}
                              <span className="tabular-nums" dir="ltr">
                                #{o.id.slice(0, 8).toUpperCase()}
                              </span>
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {new Date(o.created_at).toLocaleDateString("en-US")}
                            </p>
                          </div>
                          <Badge variant={STATUS_VARIANT[o.status] ?? "muted"}>
                            <StatusIcon aria-hidden />
                            {STATUS_LABEL[o.status] ?? o.status}
                          </Badge>
                        </div>

                        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                          {o.order_items.map((it, i) => (
                            <li key={i} className="flex justify-between gap-4">
                              <span>
                                {it.name_snapshot} × {it.quantity}
                              </span>
                              <span className="tabular-nums">
                                {formatPrice((it.unit_price_cents * it.quantity) / 100, o.currency)}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                          <p className="text-sm text-muted-foreground">
                            Total{" "}
                            <span className="ms-1 text-base font-bold tabular-nums text-forest">
                              {formatPrice(o.total_cents / 100, o.currency)}
                            </span>
                          </p>
                          {o.invoices?.[0]?.pdf_url && (
                            <a
                              href={o.invoices[0].pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-forest/20 px-4 text-sm font-semibold text-forest transition-colors hover:border-forest/40 hover:bg-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              <FileText className="size-4 text-gold-600" aria-hidden /> Invoice
                            </a>
                          )}
                        </div>

                        {(o.tracking_status || o.tracking_number) && (
                          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-mint/25 bg-mint/10 p-3.5 text-sm text-forest">
                            <Truck className="size-4 shrink-0 text-nature" aria-hidden />
                            <span className="min-w-0">
                              {o.tracking_status ?? "In transit"}
                              {o.tracking_number && (
                                <>
                                  {" · "}
                                  <span className="tabular-nums" dir="ltr">
                                    {o.tracking_number}
                                  </span>
                                </>
                              )}
                              {o.eta && ` · ETA ${new Date(o.eta).toLocaleDateString("en-US")}`}
                            </span>
                            {o.tracking_url && (
                              <a
                                href={o.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ms-auto font-semibold text-nature underline-offset-4 hover:underline"
                              >
                                Track
                              </a>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* ── Consultations ── */}
        <div className="mt-14">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-nature/10">
              <CalendarClock className="size-5 text-nature" aria-hidden />
            </span>
            <h2 className="text-xl font-bold text-forest md:text-2xl">My Consultations</h2>
            {consultations.length > 0 && (
              <Badge variant="muted" className="tabular-nums">
                {consultations.length}
              </Badge>
            )}
          </div>

          {consultations.length === 0 ? (
            <Card className="rounded-2xl border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-cream">
                  <CalendarClock className="size-6 text-forest/40" aria-hidden />
                </span>
                <p className="text-sm text-muted-foreground">You have no consultations yet.</p>
                <a
                  href="/consultation"
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-nature underline-offset-4 hover:underline"
                >
                  Book one
                  <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
                </a>
              </CardContent>
            </Card>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {consultations.map((c) => (
                <Card key={c.id} className="rounded-2xl transition-shadow duration-300 hover:shadow-soft">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-nature/10">
                          {c.type === "video" ? (
                            <Video className="size-4 text-nature" aria-hidden />
                          ) : (
                            <Phone className="size-4 text-nature" aria-hidden />
                          )}
                        </span>
                        <div>
                          <p className="font-semibold text-forest">
                            {c.scheduled_at
                              ? new Date(c.scheduled_at).toLocaleString("en-US", {
                                  dateStyle: "full",
                                  timeStyle: "short",
                                })
                              : "Scheduled soon"}
                          </p>
                          <p className="mt-0.5 text-sm capitalize text-muted-foreground">
                            {c.type} · <span className="tabular-nums">{c.duration_min} min</span>
                          </p>
                        </div>
                      </div>
                      <Badge variant={CONSULT_VARIANT[c.status] ?? "muted"} className="capitalize">
                        {c.status}
                      </Badge>
                    </div>
                    {c.meeting_link && (
                      <a
                        href={c.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-forest/20 px-4 text-sm font-semibold text-forest transition-colors hover:border-forest/40 hover:bg-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <Video className="size-4 text-nature" aria-hidden /> Join video session
                      </a>
                    )}
                    {c.type === "phone" && (
                      <p className="mt-4 text-sm text-muted-foreground">
                        We&apos;ll call you at the scheduled time.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
