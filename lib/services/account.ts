import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AccountOrder {
  id: string;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  tracking_number: string | null;
  tracking_status: string | null;
  tracking_url: string | null;
  eta: string | null;
  order_items: { name_snapshot: string; quantity: number; unit_price_cents: number }[];
  invoices: { number: string; pdf_url: string | null }[];
}

/** Orders for the signed-in user (RLS guarantees ownership). */
export async function getMyOrders(): Promise<AccountOrder[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("orders")
    .select(
      `id, status, total_cents, currency, created_at, tracking_number, tracking_status, tracking_url, eta,
       order_items(name_snapshot, quantity, unit_price_cents),
       invoices(number, pdf_url)`
    )
    .order("created_at", { ascending: false });
  return (data ?? []) as AccountOrder[];
}
