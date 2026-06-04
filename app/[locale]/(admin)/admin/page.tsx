import { Link } from "@/i18n/navigation";
import { Package, ClipboardList, Activity, DollarSign, AlertTriangle } from "lucide-react";
import { getAdminOverview } from "@/lib/services/admin";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending", paid: "Paid", processing: "Processing",
  shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", refunded: "Refunded",
};

export default async function AdminOverviewPage() {
  const o = await getAdminOverview();

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<DollarSign />} label="Revenue (paid)" value={formatPrice(o.revenueCents / 100)} />
        <Stat icon={<ClipboardList />} label="Orders" value={String(o.orderCount)} />
        <Stat icon={<Package />} label="Products" value={String(o.productCount)} />
        <Stat icon={<Activity />} label="Conditions" value={String(o.conditionCount)} />
      </div>

      {o.lowStock.length > 0 && (
        <Card className="border-terracotta/30 bg-terracotta/5">
          <CardContent className="p-5">
            <p className="flex items-center gap-2 font-semibold text-terracotta">
              <AlertTriangle className="size-4" /> Low stock
            </p>
            <ul className="mt-2 space-y-1 text-sm text-forest/80">
              {o.lowStock.map((p) => (
                <li key={p.id}>{p.name} — {p.stock_qty} left</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-nature hover:underline">View all →</Link>
        </div>
        <Card>
          <CardContent className="p-0">
            {o.recentOrders.length === 0 ? (
              <p className="p-6 text-center text-sm text-forest/60">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {o.recentOrders.map((ord) => (
                  <li key={ord.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                    <span className="font-mono text-xs text-forest/50">#{ord.id.slice(0, 8).toUpperCase()}</span>
                    <span className="flex-1 truncate text-forest/80">{ord.email}</span>
                    <span className="rounded-full bg-nature/10 px-2 py-0.5 text-xs text-nature">{STATUS_LABEL[ord.status] ?? ord.status}</span>
                    <span className="font-semibold">{formatPrice(ord.total_cents / 100, ord.currency)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex size-11 items-center justify-center rounded-xl bg-nature/10 text-nature [&_svg]:size-5">
          {icon}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-forest/50">{label}</p>
          <p className="text-xl font-bold text-forest">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
