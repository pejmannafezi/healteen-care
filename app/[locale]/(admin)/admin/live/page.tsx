import { Radio, Trash2, Square } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminListProducts } from "@/lib/services/admin";
import { createLiveSession, goLive, endLive, deleteLiveSession } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminLivePage() {
  const db = createSupabaseAdminClient();
  const [{ data: sessions }, products, { count: subCount }] = await Promise.all([
    db.from("live_sessions").select("*").order("created_at", { ascending: false }).limit(20),
    adminListProducts(),
    db.from("live_subscribers").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-8">
      <p className="text-sm text-forest/60">{subCount ?? 0} subscriber(s) will be notified when you go live.</p>

      {/* Create session */}
      <div>
        <h2 className="mb-3 text-lg font-bold">Schedule a live session</h2>
        <Card>
          <CardContent className="p-5">
            <form action={createLiveSession} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Title</Label>
                  <Input name="title" required placeholder="New product launch live" />
                </div>
                <div>
                  <Label>Date & time (optional)</Label>
                  <Input name="scheduled_at" type="datetime-local" />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea name="description" rows={2} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>YouTube live URL</Label>
                  <Input name="youtube_url" placeholder="https://youtube.com/watch?v=..." />
                </div>
                <div>
                  <Label>Instagram URL (optional)</Label>
                  <Input name="instagram_url" placeholder="https://instagram.com/..." />
                </div>
                <div>
                  <Label>Meeting URL (optional)</Label>
                  <Input name="meeting_url" placeholder="https://meet.google.com/..." />
                </div>
              </div>
              <div>
                <Label>Featured products (shown to buy during the live)</Label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {products.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="products" value={p.id} /> {p.name}
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit">Create session</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Sessions */}
      <div>
        <h2 className="mb-3 text-lg font-bold">Sessions</h2>
        {!sessions || sessions.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-sm text-forest/60">No sessions yet.</CardContent></Card>
        ) : (
          <ul className="space-y-4">
            {sessions.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-forest">{s.title}</p>
                      <p className="text-xs text-forest/50">
                        {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString("en-US") : "No date"}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                      s.status === "live" ? "bg-terracotta/15 text-terracotta" : s.status === "ended" ? "bg-muted text-forest/60" : "bg-gold/15 text-gold-600"
                    }`}>{s.status}</span>
                  </div>

                  {s.status !== "ended" && (
                    <form action={goLive} className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4">
                      <input type="hidden" name="id" value={s.id} />
                      <div className="flex-1 min-w-48">
                        <Label>YouTube URL</Label>
                        <Input name="youtube_url" defaultValue={s.youtube_url ?? ""} className="h-10" placeholder="https://youtube.com/watch?v=..." />
                      </div>
                      {s.status !== "live" ? (
                        <Button type="submit" className="bg-terracotta hover:opacity-90"><Radio /> Go Live + notify</Button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 text-sm font-semibold text-terracotta"><Radio className="animate-pulse" /> Live</span>
                      )}
                    </form>
                  )}

                  <div className="mt-3 flex gap-2">
                    {s.status === "live" && (
                      <form action={endLive}>
                        <input type="hidden" name="id" value={s.id} />
                        <Button type="submit" variant="outline" size="sm"><Square /> End live</Button>
                      </form>
                    )}
                    <form action={deleteLiveSession}>
                      <input type="hidden" name="id" value={s.id} />
                      <Button type="submit" variant="ghost" size="sm" className="text-terracotta"><Trash2 /> Delete</Button>
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
