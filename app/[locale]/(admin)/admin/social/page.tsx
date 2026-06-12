import { Sparkles, Check, Trash2, Megaphone } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateDraft, approveDraft, deleteDraft } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "email", label: "Email newsletter" },
  { value: "blog", label: "Blog" },
];

const SELECT_CLS =
  "mt-1.5 block h-11 w-full rounded-lg border border-border bg-white px-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

export default async function AdminSocialPage() {
  const db = createSupabaseAdminClient();
  const { data: drafts } = await db
    .from("social_posts")
    .select("id, platform, title, content, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate a draft</CardTitle>
          <CardDescription>
            The AI drafts on-brand content for your review. Nothing is published automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form action={generateDraft} className="grid gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-end">
            <label className="block text-xs font-medium text-forest/80">
              Platform
              <select name="platform" className={SELECT_CLS}>
                {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </label>
            <label className="block text-xs font-medium text-forest/80">
              Topic
              <Input name="topic" placeholder="e.g. turmeric for joint comfort" className="mt-1.5" required />
            </label>
            <Button type="submit"><Sparkles /> Generate</Button>
          </form>
        </CardContent>
      </Card>

      <section>
        <div className="mb-3 flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-forest">Drafts</h2>
          <Badge variant="outline" className="tabular-nums">{drafts?.length ?? 0}</Badge>
        </div>
        {!drafts || drafts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
              <Megaphone className="size-8 text-nature/40" aria-hidden />
              <p className="text-sm text-muted-foreground">No drafts yet. Generate your first above.</p>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-4">
            {drafts.map((d) => (
              <li key={d.id}>
                <Card>
                  <CardContent className="p-5 pt-5">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge variant="forest" className="capitalize">{d.platform}</Badge>
                      {d.status === "approved" ? (
                        <Badge variant="mint">approved</Badge>
                      ) : (
                        <Badge variant="gold">{d.status}</Badge>
                      )}
                      {d.title && <span className="min-w-0 truncate text-xs text-muted-foreground">· {d.title}</span>}
                    </div>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-forest/85">{d.content}</p>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                      {d.status !== "approved" && (
                        <form action={approveDraft}>
                          <input type="hidden" name="id" value={d.id} />
                          <Button type="submit" size="sm" variant="gold"><Check /> Approve</Button>
                        </form>
                      )}
                      <form action={deleteDraft}>
                        <input type="hidden" name="id" value={d.id} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="ghost"
                          className="text-terracotta hover:bg-terracotta/10 hover:text-terracotta"
                        >
                          <Trash2 /> Delete
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
