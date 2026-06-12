import Image from "next/image";
import { Trash2, Plus, Images } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { addStory, deleteStory } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FILE_CLS =
  "block w-full max-w-md cursor-pointer rounded-xl border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground transition-colors hover:border-nature/50 file:me-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cream";

export default async function AdminStoriesPage() {
  const db = createSupabaseAdminClient();
  const { data: stories } = await db
    .from("stories")
    .select("id, media_url, media_type, caption, is_active")
    .order("sort_order");

  const count = stories?.length ?? 0;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <CardTitle className="text-lg">Stories</CardTitle>
            <Badge variant="outline" className="tabular-nums">{count}/3</Badge>
          </div>
          <CardDescription>Up to 3 stories show as circles at the top of the home page.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {count < 3 ? (
            <form action={addStory} className="space-y-5">
              <div>
                <Label htmlFor="st-media">Image or video</Label>
                <input id="st-media" type="file" name="media" accept="image/*,video/*" required className={FILE_CLS} />
                <p className="mt-1.5 text-xs text-muted-foreground">Image up to 6MB, video up to 50MB.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="st-caption">Caption (optional)</Label>
                  <Input id="st-caption" name="caption" placeholder="New arrivals" />
                </div>
                <div>
                  <Label htmlFor="st-link">Link (optional)</Label>
                  <Input id="st-link" name="link_url" placeholder="/shop" />
                </div>
              </div>
              <Button type="submit"><Plus /> Add story</Button>
            </form>
          ) : (
            <p className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-forest">
              You have 3 stories. Delete one to add another.
            </p>
          )}
        </CardContent>
      </Card>

      {count > 0 ? (
        <ul className="flex flex-wrap gap-4">
          {stories!.map((s) => (
            <li key={s.id}>
              <Card className="w-44 card-hover">
                <CardContent className="p-3 pt-3">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-nature/10">
                    {s.media_type === "image" ? (
                      <Image src={s.media_url} alt="" fill sizes="176px" className="object-cover" />
                    ) : (
                      <video src={s.media_url} className="h-full w-full object-cover" muted />
                    )}
                  </div>
                  <p className="mt-2.5 truncate text-xs font-medium text-forest/80">{s.caption ?? s.media_type}</p>
                  <form action={deleteStory} className="mt-2">
                    <input type="hidden" name="id" value={s.id} />
                    <Button
                      variant="outline"
                      size="sm"
                      type="submit"
                      className="w-full border-terracotta/40 text-terracotta hover:border-terracotta hover:bg-terracotta/10"
                    >
                      <Trash2 /> Delete
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border p-10 text-center">
          <Images className="size-8 text-nature/40" aria-hidden />
          <p className="text-sm text-muted-foreground">No stories yet — your first one will appear here.</p>
        </div>
      )}
    </div>
  );
}
