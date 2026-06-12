import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { saveWebinar } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export default async function WebinarEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";
  const db = createSupabaseAdminClient();
  const w = isNew ? null : (await db.from("webinars").select("*").eq("id", id).single()).data;

  return (
    <div>
      <Link
        href="/admin/webinars"
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full text-sm font-medium text-nature transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-3.5 rtl:rotate-180" /> Back to classes
      </Link>
      <h2 className="mb-1 mt-2 text-2xl font-bold text-forest">{isNew ? "New class" : "Edit class"}</h2>
      <div className="gold-divider mb-6 mt-3 max-w-[10rem]" />

      <Card>
        <CardContent className="p-6 pt-6">
          <form action={saveWebinar} className="space-y-5">
            <input type="hidden" name="id" value={w?.id ?? "new"} />
            <div>
              <Label htmlFor="wb-title">Title</Label>
              <Input id="wb-title" name="title" defaultValue={w?.title ?? ""} required />
            </div>
            <div>
              <Label htmlFor="wb-desc">Description</Label>
              <Textarea id="wb-desc" name="description" defaultValue={w?.description ?? ""} rows={5} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="wb-when">Date &amp; time</Label>
                <Input id="wb-when" name="scheduled_at" type="datetime-local" defaultValue={toLocalInput(w?.scheduled_at ?? null)} />
              </div>
              <div>
                <Label htmlFor="wb-duration">Duration (minutes)</Label>
                <Input id="wb-duration" name="duration_min" type="number" min="0" defaultValue={w?.duration_min ?? 60} />
              </div>
              <div>
                <Label htmlFor="wb-price">Price (USD, 0 = free)</Label>
                <Input id="wb-price" name="price" type="number" step="0.01" min="0" defaultValue={((w?.price_cents ?? 0) / 100).toFixed(2)} />
              </div>
              <div>
                <Label htmlFor="wb-capacity">Capacity (optional)</Label>
                <Input id="wb-capacity" name="capacity" type="number" min="0" defaultValue={w?.capacity ?? ""} />
              </div>
            </div>
            <div>
              <Label htmlFor="wb-recording">Recording URL (after the class)</Label>
              <Input id="wb-recording" name="recording_url" defaultValue={w?.recording_url ?? ""} placeholder="https://youtube.com/..." />
            </div>
            <label className="flex w-fit cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm font-medium text-forest transition-colors hover:border-nature/50 has-[:checked]:border-nature has-[:checked]:bg-mint/10">
              <input type="checkbox" name="is_published" defaultChecked={w?.is_published ?? false} className="size-4 accent-forest" />
              Published (visible on the site)
            </label>
            <Button type="submit">Save class</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
