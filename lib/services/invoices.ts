import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "invoices";

interface InvoiceLine {
  name: string;
  quantity: number;
  unitPriceCents: number;
}

interface InvoiceOrder {
  id: string;
  email: string;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  shipping_address: Record<string, unknown> | null;
  created_at?: string;
}

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

async function buildPdf(order: InvoiceOrder, lines: InvoiceLine[], number: string) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const forest = rgb(0.102, 0.302, 0.227);
  const gray = rgb(0.4, 0.4, 0.4);
  let y = 790;

  const text = (s: string, x: number, yy: number, size = 10, f = font, color = rgb(0, 0, 0)) =>
    page.drawText(s, { x, y: yy, size, font: f, color });

  text("HEALTEEN CARE", 40, y, 20, bold, forest);
  text("Natural Healthcare & Herbal Wellness", 40, y - 16, 9, font, gray);
  text("INVOICE", 460, y, 16, bold, forest);
  text(`No. ${number}`, 460, y - 16, 9, font, gray);
  text(new Date(order.created_at ?? Date.now()).toLocaleDateString("en-US"), 460, y - 28, 9, font, gray);

  y -= 60;
  text("Bill To:", 40, y, 10, bold);
  text(order.email, 40, y - 14, 10);
  const addr = order.shipping_address as
    | { name?: string; line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string }
    | null;
  if (addr) {
    let ay = y - 28;
    for (const l of [addr.name, addr.line1, addr.line2, [addr.city, addr.state, addr.postal_code].filter(Boolean).join(", "), addr.country]) {
      if (l) { text(String(l), 40, ay, 10); ay -= 13; }
    }
  }

  // Table header
  y -= 110;
  page.drawRectangle({ x: 40, y: y - 4, width: 515, height: 22, color: rgb(0.95, 0.93, 0.87) });
  text("Item", 48, y + 2, 10, bold);
  text("Qty", 360, y + 2, 10, bold);
  text("Unit", 410, y + 2, 10, bold);
  text("Amount", 490, y + 2, 10, bold);
  y -= 24;

  for (const l of lines) {
    text(l.name.slice(0, 50), 48, y, 10);
    text(String(l.quantity), 365, y, 10);
    text(money(l.unitPriceCents, order.currency), 410, y, 10);
    text(money(l.unitPriceCents * l.quantity, order.currency), 490, y, 10);
    y -= 18;
  }

  // Totals
  y -= 10;
  page.drawLine({ start: { x: 360, y }, end: { x: 555, y }, color: gray, thickness: 0.5 });
  y -= 16;
  const totalRow = (label: string, value: number, b = false) => {
    text(label, 410, y, 10, b ? bold : font);
    text(money(value, order.currency), 490, y, 10, b ? bold : font);
    y -= 16;
  };
  totalRow("Subtotal", order.subtotal_cents);
  totalRow("Shipping", order.shipping_cents);
  if (order.tax_cents > 0) totalRow("Tax", order.tax_cents);
  totalRow("Total", order.total_cents, true);

  text("Thank you for choosing Healteen Care. Care Today. Live Strong Tomorrow.", 40, 60, 9, font, gray);
  return doc.save();
}

async function ensureBucket(admin: ReturnType<typeof createSupabaseAdminClient>) {
  const { data } = await admin.storage.getBucket(BUCKET);
  if (!data) {
    await admin.storage.createBucket(BUCKET, { public: false });
  }
}

/**
 * Generates a PDF invoice, stores it in the private "invoices" bucket, and
 * records an invoices row. Returns the invoice number + signed URL.
 * Non-fatal: callers should wrap in try/catch.
 */
export async function generateInvoice(order: InvoiceOrder, lines: InvoiceLine[]) {
  const admin = createSupabaseAdminClient();
  const number = `HC-${new Date().getFullYear()}-${order.id.slice(0, 8).toUpperCase()}`;

  const pdf = await buildPdf(order, lines, number);
  await ensureBucket(admin);

  const path = `${order.id}.pdf`;
  await admin.storage.from(BUCKET).upload(path, pdf, {
    contentType: "application/pdf",
    upsert: true,
  });

  // Long-lived signed URL (1 year) for easy access from the dashboard/email.
  const { data: signed } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  await admin
    .from("invoices")
    .upsert({ order_id: order.id, number, pdf_url: signed?.signedUrl ?? null }, { onConflict: "order_id" });

  return { number, url: signed?.signedUrl ?? null };
}
