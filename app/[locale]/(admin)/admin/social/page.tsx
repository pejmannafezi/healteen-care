import { Sparkles, Check, Trash2 } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateDraft, approveDraft, deleteDraft } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "email", label: "Email newsletter" },
  { value: "blog", label: "Blog" },
];

export default async function AdminSocialPage() {
  const db = createSupabaseAdminClient();
  const { data: drafts } = await db
    .from("social_posts")
    .select("id, platform, title, content, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-lg font-bold">Generate a draft</h2>
        <Card>
          <CardContent className="p-5">
            <form action={generateDraft} className="grid gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-end">
              <label className="text-xs font-medium text-forest/70">
                Platform
                <select name="platform" className="mt-1 h-11 w-full rounded-md border border-border bg-white px-2 text-sm">
                  {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </label>
              <label className="text-xs font-medium text-forest/70">
                Topic
                <Input name="topic" placeholder="e.g. turmeric for joint comfort" className="mt-1" required />
              </label>
              <Button type="submit" size="lg"><Sparkles /> Generate</Button>
            </form>
            <p className="mt-2 text-xs text-forest/50">
              The AI drafts on-brand content for your review. Nothing is published automatically.
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold">Drafts ({drafts?.length ?? 0})</h2>
        {!drafts || drafts.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-sm text-forest/60">No drafts yet. Generate your first above.</CardContent></Card>
        ) : (
          <ul className="space-y-4">
            {drafts.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-forest/10 px-2 py-0.5 text-xs font-semibold text-forest capitalize">{d.platform}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${d.status === "approved" ? "bg-mint/20 text-forest" : "bg-gold/15 text-gold-600"}`}>{d.status}</span>
                    {d.title && <span className="truncate text-xs text-forest/50">· {d.title}</span>}
                  </div>
                  <p className="whitespace-pre-line text-sm text-forest/85">{d.content}</p>
                  <div className="mt-3 flex gap-2">
                    {d.status !== "approved" && (
                      <form action={approveDraft}>
                        <input type="hidden" name="id" value={d.id} />
                        <Button type="submit" size="sm" variant="gold"><Check /> Approve</Button>
                      </form>
                    )}
                    <form action={deleteDraft}>
                      <input type="hidden" name="id" value={d.id} />
                      <Button type="submit" size="sm" variant="ghost" className="text-terracotta"><Trash2 /> Delete</Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
