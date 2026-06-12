import { Inbox, MapPin } from "lucide-react";
import { adminListOrders } from "@/lib/services/admin";
import { updateOrder } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

const STATUS_VARIANT: Record<string, "gold" | "nature" | "honey" | "forest" | "mint" | "terracotta" | "muted"> = {
  pending: "gold", paid: "nature", processing: "honey", shipped: "forest",
  delivered: "mint", cancelled: "muted", refunded: "terracotta",
};

const SELECT_CLS =
  "mt-1.5 block h-10 w-full rounded-lg border border-border bg-white px-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

export default async function AdminOrdersPage() {
  const orders = await adminListOrders();

  return (
    <div>
      <div className="mb-5 flex items-center gap-2.5">
        <h2 className="text-lg font-bold text-forest">Orders</h2>
        <Badge variant="outline" className="tabular-nums">{orders.length}</Badge>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
            <Inbox className="size-8 text-nature/40" aria-hidden />
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => {
            const addr = o.shipping_address as { name?: string; city?: string; state?: string } | null;
            return (
              <li key={o.id}>
                <Card className="overflow-hidden">
                <CardContent className="p-5 pt-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="font-mono text-sm font-semibold text-forest">
                          #{o.id.slice(0, 8).toUpperCase()}
                        </p>
                        <Badge variant={STATUS_VARIANT[o.status] ?? "muted"} className="capitalize">
                          {o.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleString("en-US")} · {o.email}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-forest/80">
                        {(o.order_items ?? []).map((it) => `${it.name_snapshot} ×${it.quantity}`).join(", ")}
                      </p>
                      {addr && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3 shrink-0" aria-hidden />
                          Ship to: {addr.name} · {addr.city}{addr.state ? `, ${addr.state}` : ""}
                        </p>
                      )}
                    </div>
                    <span className="text-lg font-bold tabular-nums text-forest">
                      {formatPrice(o.total_cents / 100, o.currency)}
                    </span>
                  </div>

                  <form
                    action={updateOrder}
                    className="mt-4 grid gap-3 rounded-xl border-t border-border bg-muted/30 p-4 -mx-5 -mb-5 rounded-t-none sm:grid-cols-2 lg:grid-cols-5"
                  >
                    <input type="hidden" name="id" value={o.id} />
                    <label className="block text-xs font-medium text-forest/80">
                      Status
                      <select name="status" defaultValue={o.status} className={SELECT_CLS}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </label>
                    <label className="block text-xs font-medium text-forest/80">
                      Carrier
                      <Input
                        name="tracking_carrier"
                        defaultValue={(o as { tracking_carrier?: string }).tracking_carrier ?? ""}
                        className="mt-1.5 h-10 bg-white"
                        placeholder="USPS"
                      />
                    </label>
                    <label className="block text-xs font-medium text-forest/80">
                      Tracking #
                      <Input name="tracking_number" defaultValue={o.tracking_number ?? ""} className="mt-1.5 h-10 bg-white" />
                    </label>
                    <label className="block text-xs font-medium text-forest/80">
                      Tracking status
                      <Input
                        name="tracking_status"
                        defaultValue={o.tracking_status ?? ""}
                        className="mt-1.5 h-10 bg-white"
                        placeholder="In transit"
                      />
                    </label>
                    <div className="flex items-end">
                      <Button type="submit" size="sm" className="h-10 w-full">Update</Button>
                    </div>
                  </form>
                </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
