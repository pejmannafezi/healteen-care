import { Link } from "@/i18n/navigation";
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
      <Link href="/admin/webinars" className="text-sm text-nature hover:underline">← Back to classes</Link>
      <h2 className="mb-6 mt-2 text-2xl font-bold">{isNew ? "New class" : "Edit class"}</h2>
      <Card>
        <CardContent className="p-6">
          <form action={saveWebinar} className="space-y-4">
            <input type="hidden" name="id" value={w?.id ?? "new"} />
            <div>
              <Label>Title</Label>
              <Input name="title" defaultValue={w?.title ?? ""} required />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea name="description" defaultValue={w?.description ?? ""} rows={5} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Date & time</Label>
                <Input name="scheduled_at" type="datetime-local" defaultValue={toLocalInput(w?.scheduled_at ?? null)} />
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input name="duration_min" type="number" min="0" defaultValue={w?.duration_min ?? 60} />
              </div>
              <div>
                <Label>Price (USD, 0 = free)</Label>
                <Input name="price" type="number" step="0.01" min="0" defaultValue={((w?.price_cents ?? 0) / 100).toFixed(2)} />
              </div>
              <div>
                <Label>Capacity (optional)</Label>
                <Input name="capacity" type="number" min="0" defaultValue={w?.capacity ?? ""} />
              </div>
            </div>
            <div>
              <Label>Recording URL (after the class)</Label>
              <Input name="recording_url" defaultValue={w?.recording_url ?? ""} placeholder="https://youtube.com/..." />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="is_published" defaultChecked={w?.is_published ?? false} />
              Published (visible on the site)
            </label>
            <Button type="submit">Save class</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
