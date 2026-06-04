import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { FileText, Truck, Package, CalendarClock, Video, Phone } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyOrders } from "@/lib/services/account";
import { getMyConsultations } from "@/lib/services/consultations";
import { signOutAction } from "../../(auth)/actions";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="container-page py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="mt-1 text-forest/60">{user!.email}</p>
        </div>
        <form action={signOutAction}>
          <Button variant="outline" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </div>
      <div className="gold-divider mt-4" />

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* Profile */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-forest/80">
            <p><span className="font-semibold">Name:</span> {profile?.full_name ?? "—"}</p>
            <p><span className="font-semibold">Phone:</span> {profile?.phone ?? "—"}</p>
            {profile?.role === "admin" && (
              <p className="pt-2">
                <a href="/admin" className="font-semibold text-nature hover:underline">
                  → Admin dashboard
                </a>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Orders */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Package className="size-5 text-nature" /> My Orders
          </h2>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-forest/60">
                You have no orders yet.
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-4">
              {orders.map((o) => (
                <Card key={o.id} className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-forest">
                          Order #{o.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-forest/50">
                          {new Date(o.created_at).toLocaleDateString("en-US")}
                        </p>
                      </div>
                      <span className="rounded-full bg-nature/10 px-3 py-1 text-xs font-semibold text-nature">
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-1 text-sm text-forest/75">
                      {o.order_items.map((it, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{it.name_snapshot} × {it.quantity}</span>
                          <span>{formatPrice((it.unit_price_cents * it.quantity) / 100, o.currency)}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <span className="font-bold text-forest">
                        {formatPrice(o.total_cents / 100, o.currency)}
                      </span>
                      {o.invoices?.[0]?.pdf_url && (
                        <a
                          href={o.invoices[0].pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-nature hover:underline"
                        >
                          <FileText className="size-4" /> Invoice
                        </a>
                      )}
                    </div>

                    {(o.tracking_status || o.tracking_number) && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-cream p-3 text-sm text-forest/80">
                        <Truck className="size-4 text-nature" />
                        <span>
                          {o.tracking_status ?? "In transit"}
                          {o.tracking_number && ` · ${o.tracking_number}`}
                          {o.eta && ` · ETA ${new Date(o.eta).toLocaleDateString("en-US")}`}
                        </span>
                        {o.tracking_url && (
                          <a href={o.tracking_url} target="_blank" rel="noopener noreferrer" className="ml-auto font-semibold text-nature hover:underline">
                            Track
                          </a>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Consultations */}
      <div className="mt-12">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <CalendarClock className="size-5 text-nature" /> My Consultations
        </h2>
        {consultations.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-forest/60">
              You have no consultations yet.{" "}
              <a href="/consultation" className="font-semibold text-nature hover:underline">Book one →</a>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {consultations.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2">
                    {c.type === "video" ? <Video className="size-4 text-nature" /> : <Phone className="size-4 text-nature" />}
                    <span className="font-semibold text-forest">
                      {c.scheduled_at
                        ? new Date(c.scheduled_at).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })
                        : "Scheduled soon"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-forest/60 capitalize">
                    {c.type} · {c.duration_min} min · {c.status}
                  </p>
                  {c.meeting_link && (
                    <a href={c.meeting_link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-nature hover:underline">
                      <Video className="size-4" /> Join video session
                    </a>
                  )}
                  {c.type === "phone" && (
                    <p className="mt-3 text-sm text-forest/70">We'll call you at the scheduled time.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
