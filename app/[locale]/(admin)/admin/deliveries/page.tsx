import { Package, Truck, CheckCircle2, AlertTriangle, MapPin } from "lucide-react";
import { getDeliveryReport } from "@/lib/services/admin";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Deliveries" };

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending", paid: "Paid", processing: "Processing",
  shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", refunded: "Refunded",
};

type Addr = {
  name?: string; line1?: string; line2?: string;
  city?: string; state?: string; postal_code?: string; country?: string; phone?: string;
} | null;

function formatAddress(addr: Addr): string {
  if (!addr) return "No shipping address on file";
  const parts = [
    addr.line1,
    addr.line2,
    [addr.city, addr.state, addr.postal_code].filter(Boolean).join(", "),
    addr.country,
  ].filter(Boolean);
  return parts.join(" · ");
}

const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

export default async function AdminDeliveriesPage() {
  const r = await getDeliveryReport();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold">Deliveries</h2>
        <p className="text-sm text-forest/60">
          Live fulfillment snapshot — stock left, what&apos;s in the post, what&apos;s
          delivered, and everything still owed a delivery.
        </p>
      </div>

      {/* ── Stat row ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Package />} label="Units in stock" value={String(r.totalStock)} />
        <Stat icon={<Truck />} label="In post / out for delivery" value={String(r.inPost.length)} />
        <Stat icon={<CheckCircle2 />} label="Delivered" value={String(r.delivered.length)} />
        <Stat icon={<MapPin />} label="Not delivered yet" value={String(r.notDelivered.length)} />
      </div>

      {/* ── Products left ── */}
      <Section title="Product stock left" count={r.products.length}>
        {r.products.length === 0 ? (
          <Empty>No products yet.</Empty>
        ) : (
          <ul className="divide-y divide-border">
            {r.products.map((p) => {
              const low = p.stock_qty <= p.low_stock_threshold;
              return (
                <li key={p.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                  <span className="flex-1 truncate text-forest/80">
                    {p.name}
                    {!p.is_active && <span className="ml-2 text-xs text-forest/40">(inactive)</span>}
                  </span>
                  {low && (
                    <span className="flex items-center gap-1 rounded-full bg-terracotta/10 px-2 py-0.5 text-xs text-terracotta">
                      <AlertTriangle className="size-3" /> Low
                    </span>
                  )}
                  <span className="w-20 text-right font-semibold text-forest">{p.stock_qty} left</span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* ── In post / out for delivery ── */}
      <Section title="In post — out for delivery" count={r.inPost.length}>
        {r.inPost.length === 0 ? (
          <Empty>Nothing in transit right now.</Empty>
        ) : (
          <ul className="divide-y divide-border">
            {r.inPost.map((o) => {
              const addr = o.shipping_address as Addr;
              return (
                <li key={o.id} className="space-y-1 p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-forest/50">#{o.id.slice(0, 8).toUpperCase()}</span>
                    <span className="flex-1 truncate font-medium text-forest/85">{addr?.name ?? o.email}</span>
                    <span className="text-xs text-forest/60">ETA {fmtDate(o.eta)}</span>
                  </div>
                  <p className="text-xs text-forest/60">
                    {o.tracking_carrier ?? "Carrier ?"} · {o.tracking_number ?? "no tracking #"}
                    {o.tracking_status ? ` · ${o.tracking_status}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* ── Delivered (with date) ── */}
      <Section title="Delivered" count={r.delivered.length}>
        {r.delivered.length === 0 ? (
          <Empty>No deliveries completed yet.</Empty>
        ) : (
          <ul className="divide-y divide-border">
            {r.delivered.map((o) => {
              const addr = o.shipping_address as Addr;
              return (
                <li key={o.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                  <span className="font-mono text-xs text-forest/50">#{o.id.slice(0, 8).toUpperCase()}</span>
                  <span className="flex-1 truncate text-forest/85">{addr?.name ?? o.email}</span>
                  <span className="flex items-center gap-1 text-xs text-nature">
                    <CheckCircle2 className="size-3" /> {fmtDate(o.delivered_at)}
                  </span>
                  <span className="w-20 text-right font-semibold text-forest">
                    {formatPrice(o.total_cents / 100, o.currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* ── Not delivered — name & address (all) ── */}
      <Section title="Not delivered — name & address" count={r.notDelivered.length}>
        {r.notDelivered.length === 0 ? (
          <Empty>Everything has been delivered. 🎉</Empty>
        ) : (
          <ul className="divide-y divide-border">
            {r.notDelivered.map((o) => {
              const addr = o.shipping_address as Addr;
              return (
                <li key={o.id} className="space-y-1 p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-forest/50">#{o.id.slice(0, 8).toUpperCase()}</span>
                    <span className="flex-1 truncate font-medium text-forest/85">
                      {addr?.name ?? "—"} <span className="text-forest/50">· {o.email}</span>
                    </span>
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold-600">
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                  <p className="flex items-start gap-1 text-xs text-forest/60">
                    <MapPin className="mt-0.5 size-3 shrink-0" />
                    <span>
                      {formatAddress(addr)}
                      {addr?.phone ? ` · ☎ ${addr.phone}` : ""}
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
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

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-lg font-bold">{title}</h2>
        <span className="rounded-full bg-forest/10 px-2 py-0.5 text-xs font-medium text-forest/70">{count}</span>
      </div>
      <Card>
        <CardContent className="p-0">{children}</CardContent>
      </Card>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="p-6 text-center text-sm text-forest/60">{children}</p>;
}
