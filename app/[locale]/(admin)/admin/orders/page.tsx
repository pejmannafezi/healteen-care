import { adminListOrders } from "@/lib/services/admin";
import { updateOrder } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

export default async function AdminOrdersPage() {
  const orders = await adminListOrders();

  return (
    <div>
      <h2 className="mb-5 text-lg font-bold">Orders ({orders.length})</h2>

      {orders.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-forest/60">No orders yet.</CardContent></Card>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => {
            const addr = o.shipping_address as { name?: string; city?: string; state?: string } | null;
            return (
              <Card key={o.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-forest">#{o.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-forest/50">
                        {new Date(o.created_at).toLocaleString("en-US")} · {o.email}
                      </p>
                      <p className="mt-1 text-sm text-forest/75">
                        {(o.order_items ?? []).map((it) => `${it.name_snapshot} ×${it.quantity}`).join(", ")}
                      </p>
                      {addr && (
                        <p className="text-xs text-forest/50">
                          Ship to: {addr.name} · {addr.city}{addr.state ? `, ${addr.state}` : ""}
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-forest">{formatPrice(o.total_cents / 100, o.currency)}</span>
                  </div>

                  <form action={updateOrder} className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-5">
                    <input type="hidden" name="id" value={o.id} />
                    <label className="text-xs font-medium text-forest/70">
                      Status
                      <select name="status" defaultValue={o.status} className="mt-1 h-10 w-full rounded-md border border-border bg-white px-2 text-sm">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-forest/70">
                      Carrier
                      <Input name="tracking_carrier" defaultValue={(o as { tracking_carrier?: string }).tracking_carrier ?? ""} className="mt-1 h-10" placeholder="USPS" />
                    </label>
                    <label className="text-xs font-medium text-forest/70">
                      Tracking #
                      <Input name="tracking_number" defaultValue={o.tracking_number ?? ""} className="mt-1 h-10" />
                    </label>
                    <label className="text-xs font-medium text-forest/70">
                      Tracking status
                      <Input name="tracking_status" defaultValue={o.tracking_status ?? ""} className="mt-1 h-10" placeholder="In transit" />
                    </label>
                    <div className="flex items-end">
                      <Button type="submit" size="sm" className="w-full">Update</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            );
          })}
        </ul>
      )}
    </div>
  );
}
