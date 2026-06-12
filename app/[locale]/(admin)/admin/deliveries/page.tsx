import { Package, Truck, CheckCircle2, AlertTriangle, MapPin, CalendarRange } from "lucide-react";
import { getDeliveryReport } from "@/lib/services/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrintButton } from "@/components/admin/print-button";
import { formatPrice, cn } from "@/lib/utils";

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
  return parts.join(" · ") || "No shipping address on file";
}

const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

export default async function AdminDeliveriesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const sp = await searchParams;
  const from = sp.from && /^\d{4}-\d{2}-\d{2}$/.test(sp.from) ? sp.from : undefined;
  const fromISO = from ? new Date(`${from}T00:00:00`).toISOString() : undefined;
  const r = await getDeliveryReport(fromISO);

  const rangeLabel = from ? `${fmtDate(`${from}T00:00:00`)} → now` : "All time";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-forest">Deliveries</h2>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Live fulfillment snapshot — stock left, what&apos;s in the post, what&apos;s
            delivered, and everyone still owed a delivery (name · date · address).
          </p>
        </div>
        <PrintButton />
      </div>

      {/* ── Date-range report filter (chosen date → now) ── */}
      <Card className="print:hidden">
        <CardContent className="p-4 pt-4">
          <form method="GET" className="flex flex-wrap items-end gap-3">
            <label className="block text-xs font-medium text-forest/80">
              Report from date
              <input
                type="date"
                name="from"
                defaultValue={from ?? ""}
                className="mt-1.5 block h-11 rounded-lg border border-border bg-white px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              />
            </label>
            <span className="mb-3 text-sm text-muted-foreground">→ now</span>
            <button
              type="submit"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-forest-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              <CalendarRange className="size-4" /> Get report
            </button>
            {from && (
              <a
                href="?"
                className="mb-3 rounded-full text-sm font-medium text-nature hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Clear
              </a>
            )}
          </form>
        </CardContent>
      </Card>

      <p className="flex flex-wrap items-center gap-2 text-sm text-forest/75">
        <CalendarRange className="size-4 shrink-0 text-nature" aria-hidden />
        Showing orders for: <span className="font-semibold text-forest">{rangeLabel}</span>
        <span className="text-muted-foreground">({r.totalOrders} order{r.totalOrders === 1 ? "" : "s"})</span>
      </p>

      {/* ── Stat row ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Package />} label="Units in stock" value={String(r.totalStock)} tone="forest" />
        <Stat icon={<Truck />} label="In post / out for delivery" value={String(r.inPost.length)} tone="gold" />
        <Stat icon={<CheckCircle2 />} label="Delivered" value={String(r.delivered.length)} tone="nature" />
        <Stat icon={<MapPin />} label="Not delivered yet" value={String(r.notDelivered.length)} tone="terracotta" />
      </div>

      {/* ── Products left (always current, not date-filtered) ── */}
      <Section title="Product stock left" count={r.products.length}>
        {r.products.length === 0 ? (
          <Empty>No products yet.</Empty>
        ) : (
          <ul className="divide-y divide-border">
            {r.products.map((p) => {
              const low = p.stock_qty <= p.low_stock_threshold;
              return (
                <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
                  <span className="min-w-0 flex-1 truncate text-forest/85">
                    {p.name}
                    {!p.is_active && <span className="ms-2 text-xs text-muted-foreground">(inactive)</span>}
                  </span>
                  {low && (
                    <Badge variant="terracotta" className="shrink-0">
                      <AlertTriangle aria-hidden /> Low
                    </Badge>
                  )}
                  <span className="w-20 shrink-0 text-end font-semibold tabular-nums text-forest">
                    {p.stock_qty} left
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* ── In post / out for delivery ── */}
      <Section title="In post — out for delivery" count={r.inPost.length}>
        {r.inPost.length === 0 ? (
          <Empty>Nothing in transit in this range.</Empty>
        ) : (
          <ul className="divide-y divide-border">
            {r.inPost.map((o) => {
              const addr = o.shipping_address as Addr;
              return (
                <li key={o.id} className="space-y-1.5 px-5 py-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-forest/60">#{o.id.slice(0, 8).toUpperCase()}</span>
                    <span className="min-w-0 flex-1 truncate font-medium text-forest/90">{addr?.name ?? o.email}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">ETA {fmtDate(o.eta)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {o.tracking_carrier ?? "Carrier ?"} · {o.tracking_number ?? "no tracking #"}
                    {o.tracking_status ? ` · ${o.tracking_status}` : ""}
                  </p>
                  <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 size-3 shrink-0" aria-hidden />
                    <span>{formatAddress(addr)}</span>
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
          <Empty>No deliveries completed in this range.</Empty>
        ) : (
          <ul className="divide-y divide-border">
            {r.delivered.map((o) => {
              const addr = o.shipping_address as Addr;
              return (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-sm">
                  <span className="font-mono text-xs text-forest/60">#{o.id.slice(0, 8).toUpperCase()}</span>
                  <span className="min-w-[8rem] flex-1 truncate text-forest/90">{addr?.name ?? o.email}</span>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-nature">
                    <CheckCircle2 className="size-3" aria-hidden /> Delivered {fmtDate(o.updated_at)}
                  </span>
                  <span className="w-20 shrink-0 text-end font-semibold tabular-nums text-forest">
                    {formatPrice(o.total_cents / 100, o.currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* ── Not delivered — name · date · address (all of them) ── */}
      <Section title="Not delivered — name · date · address" count={r.notDelivered.length}>
        {r.notDelivered.length === 0 ? (
          <Empty>Everything in this range has been delivered. 🎉</Empty>
        ) : (
          <ul className="divide-y divide-border">
            {r.notDelivered.map((o) => {
              const addr = o.shipping_address as Addr;
              return (
                <li key={o.id} className="space-y-1.5 px-5 py-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs text-forest/60">#{o.id.slice(0, 8).toUpperCase()}</span>
                    <span className="min-w-0 flex-1 truncate font-medium text-forest/90">
                      {addr?.name ?? "—"} <span className="text-muted-foreground">· {o.email}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">Ordered {fmtDate(o.created_at)}</span>
                    <Badge variant="gold" className="shrink-0">{STATUS_LABEL[o.status] ?? o.status}</Badge>
                  </div>
                  <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 size-3 shrink-0" aria-hidden />
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

const TONES = {
  forest: "bg-forest/10 text-forest",
  gold: "bg-gold/15 text-gold-600",
  nature: "bg-nature/10 text-nature",
  terracotta: "bg-terracotta/10 text-terracotta",
} as const;

function Stat({
  icon, label, value, tone,
}: {
  icon: React.ReactNode; label: string; value: string; tone: keyof typeof TONES;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5 pt-5">
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

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2.5">
        <h2 className="text-lg font-bold text-forest">{title}</h2>
        <Badge variant="outline" className="tabular-nums">{count}</Badge>
      </div>
      <Card className="overflow-hidden">{children}</Card>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="p-8 text-center text-sm text-muted-foreground">{children}</p>;
}
