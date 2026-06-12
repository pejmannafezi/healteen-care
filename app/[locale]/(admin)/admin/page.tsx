import { Link } from "@/i18n/navigation";
import {
  Package, ClipboardList, Activity, DollarSign, AlertTriangle, ArrowRight, Inbox,
} from "lucide-react";
import { getAdminOverview } from "@/lib/services/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending", paid: "Paid", processing: "Processing",
  shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", refunded: "Refunded",
};

const STATUS_VARIANT: Record<string, "gold" | "nature" | "honey" | "forest" | "mint" | "terracotta" | "muted"> = {
  pending: "gold", paid: "nature", processing: "honey", shipped: "forest",
  delivered: "mint", cancelled: "muted", refunded: "terracotta",
};

const TH = "px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-muted-foreground";

export default async function AdminOverviewPage() {
  const o = await getAdminOverview();

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<DollarSign />} label="Revenue (paid)" value={formatPrice(o.revenueCents / 100)} tone="gold" />
        <Stat icon={<ClipboardList />} label="Orders" value={String(o.orderCount)} tone="forest" />
        <Stat icon={<Package />} label="Products" value={String(o.productCount)} tone="nature" />
        <Stat icon={<Activity />} label="Conditions" value={String(o.conditionCount)} tone="mint" />
      </div>

      {o.lowStock.length > 0 && (
        <Card className="border-terracotta/30 bg-terracotta/5">
          <CardContent className="p-5">
            <p className="flex items-center gap-2 font-semibold text-terracotta">
              <AlertTriangle className="size-4 shrink-0" /> Low stock
            </p>
            <ul className="mt-3 space-y-2">
              {o.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 text-sm text-forest/85">
                  <span className="min-w-0 truncate">{p.name}</span>
                  <Badge variant="terracotta" className="shrink-0 tabular-nums">{p.stock_qty} left</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <section aria-label="Recent orders">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-forest">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium text-nature transition-colors hover:bg-nature/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View all <ArrowRight className="size-3.5 rtl:rotate-180" />
          </Link>
        </div>

        <Card className="overflow-hidden">
          {o.recentOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center">
              <Inbox className="size-8 text-nature/40" aria-hidden />
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th scope="col" className={TH}>Order</th>
                    <th scope="col" className={TH}>Customer</th>
                    <th scope="col" className={TH}>Status</th>
                    <th scope="col" className={cn(TH, "text-end")}>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {o.recentOrders.map((ord) => (
                    <tr key={ord.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-5 py-3.5 font-mono text-xs text-forest/60">
                        #{ord.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="max-w-[16rem] truncate px-5 py-3.5 text-forest/85">{ord.email}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={STATUS_VARIANT[ord.status] ?? "muted"}>
                          {STATUS_LABEL[ord.status] ?? ord.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-end font-semibold tabular-nums text-forest">
                        {formatPrice(ord.total_cents / 100, ord.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

const TONES = {
  gold: "bg-gold/15 text-gold-600",
  forest: "bg-forest/10 text-forest",
  nature: "bg-nature/10 text-nature",
  mint: "bg-mint/15 text-nature",
} as const;

function Stat({
  icon, label, value, tone,
}: {
  icon: React.ReactNode; label: string; value: string; tone: keyof typeof TONES;
}) {
  return (
    <Card className="card-hover">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5", TONES[tone])}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums leading-tight text-forest">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
