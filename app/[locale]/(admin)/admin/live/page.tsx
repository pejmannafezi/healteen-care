import { Radio, Trash2, Square, Users, Video } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminListProducts } from "@/lib/services/admin";
import { createLiveSession, goLive, endLive, deleteLiveSession } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminLivePage() {
  const db = createSupabaseAdminClient();
  const [{ data: sessions }, products, { count: subCount }] = await Promise.all([
    db.from("live_sessions").select("*").order("created_at", { ascending: false }).limit(20),
    adminListProducts(),
    db.from("live_subscribers").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-8">
      <p className="flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-forest/80 shadow-card">
        <Users className="size-4 shrink-0 text-nature" aria-hidden />
        <span className="font-semibold tabular-nums text-forest">{subCount ?? 0}</span>
        subscriber(s) will be notified when you go live.
      </p>

      {/* Create session */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Schedule a live session</CardTitle>
          <CardDescription>Set it up now, go live when you&apos;re ready.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form action={createLiveSession} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ls-title">Title</Label>
                <Input id="ls-title" name="title" required placeholder="New product launch live" />
              </div>
              <div>
                <Label htmlFor="ls-when">Date &amp; time (optional)</Label>
                <Input id="ls-when" name="scheduled_at" type="datetime-local" />
              </div>
            </div>
            <div>
              <Label htmlFor="ls-desc">Description</Label>
              <Textarea id="ls-desc" name="description" rows={2} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="ls-yt">YouTube live URL</Label>
                <Input id="ls-yt" name="youtube_url" placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div>
                <Label htmlFor="ls-ig">Instagram URL (optional)</Label>
                <Input id="ls-ig" name="instagram_url" placeholder="https://instagram.com/..." />
              </div>
              <div>
                <Label htmlFor="ls-meet">Meeting URL (optional)</Label>
                <Input id="ls-meet" name="meeting_url" placeholder="https://meet.google.com/..." />
              </div>
            </div>
            <div>
              <Label>Featured products (shown to buy during the live)</Label>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {products.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground transition-colors hover:border-nature/50 has-[:checked]:border-nature has-[:checked]:bg-mint/10"
                  >
                    <input type="checkbox" name="products" value={p.id} className="size-4 shrink-0 accent-forest" />
                    <span className="min-w-0 truncate">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit">Create session</Button>
          </form>
        </CardContent>
      </Card>

      {/* Sessions */}
      <section>
        <div className="mb-3 flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-forest">Sessions</h2>
          <Badge variant="outline" className="tabular-nums">{sessions?.length ?? 0}</Badge>
        </div>
        {!sessions || sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
              <Video className="size-8 text-nature/40" aria-hidden />
              <p className="text-sm text-muted-foreground">No sessions yet.</p>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-4">
            {sessions.map((s) => (
              <li key={s.id}>
                <Card className={s.status === "live" ? "border-terracotta/40" : undefined}>
                  <CardContent className="p-5 pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-forest">{s.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString("en-US") : "No date"}
                        </p>
                      </div>
                      <Badge
                        variant={s.status === "live" ? "terracotta" : s.status === "ended" ? "muted" : "gold"}
                        className="capitalize"
                      >
                        {s.status === "live" && <Radio className="animate-pulse" aria-hidden />}
                        {s.status}
                      </Badge>
                    </div>

                    {s.status !== "ended" && (
                      <form action={goLive} className="mt-4 flex flex-wrap items-end gap-3 border-t border-border pt-4">
                        <input type="hidden" name="id" value={s.id} />
                        <div className="min-w-48 flex-1">
                          <Label htmlFor={`yt-${s.id}`}>YouTube URL</Label>
                          <Input id={`yt-${s.id}`} name="youtube_url" defaultValue={s.youtube_url ?? ""} className="h-11" placeholder="https://youtube.com/watch?v=..." />
                        </div>
                        {s.status !== "live" ? (
                          <Button type="submit" className="bg-terracotta hover:bg-terracotta/90 hover:shadow-soft">
                            <Radio /> Go Live + notify
                          </Button>
                        ) : (
                          <span className="inline-flex h-11 items-center gap-1.5 px-2 text-sm font-semibold text-terracotta">
                            <Radio className="size-4 animate-pulse" aria-hidden /> Live
                          </span>
                        )}
                      </form>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {s.status === "live" && (
                        <form action={endLive}>
                          <input type="hidden" name="id" value={s.id} />
                          <Button type="submit" variant="outline" size="sm"><Square /> End live</Button>
                        </form>
                      )}
                      <form action={deleteLiveSession}>
                        <input type="hidden" name="id" value={s.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
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
