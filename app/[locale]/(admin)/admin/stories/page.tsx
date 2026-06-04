import Image from "next/image";
import { Trash2, Plus } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { addStory, deleteStory } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminStoriesPage() {
  const db = createSupabaseAdminClient();
  const { data: stories } = await db
    .from("stories")
    .select("id, media_url, media_type, caption, is_active")
    .order("sort_order");

  const count = stories?.length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-1 text-lg font-bold">Stories ({count}/3)</h2>
        <p className="mb-4 text-sm text-forest/60">Up to 3 stories show as circles at the top of the home page.</p>

        {count < 3 ? (
          <Card>
            <CardContent className="p-5">
              <form action={addStory} className="space-y-4">
                <div>
                  <Label>Image or video</Label>
                  <input type="file" name="media" accept="image/*,video/*" required className="block text-sm" />
                  <p className="mt-1 text-xs text-forest/50">Image up to 6MB, video up to 50MB.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Caption (optional)</Label>
                    <Input name="caption" placeholder="New arrivals" />
                  </div>
                  <div>
                    <Label>Link (optional)</Label>
                    <Input name="link_url" placeholder="/shop" />
                  </div>
                </div>
                <Button type="submit"><Plus /> Add story</Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card><CardContent className="p-4 text-sm text-forest/60">You have 3 stories. Delete one to add another.</CardContent></Card>
        )}
      </div>

      {count > 0 && (
        <div className="flex flex-wrap gap-4">
          {stories!.map((s) => (
            <Card key={s.id} className="w-40">
              <CardContent className="p-3">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-nature/10">
                  {s.media_type === "image" ? (
                    <Image src={s.media_url} alt="" fill sizes="160px" className="object-cover" />
                  ) : (
                    <video src={s.media_url} className="h-full w-full object-cover" muted />
                  )}
                </div>
                <p className="mt-2 truncate text-xs text-forest/70">{s.caption ?? s.media_type}</p>
                <form action={deleteStory} className="mt-2">
                  <input type="hidden" name="id" value={s.id} />
                  <Button variant="ghost" size="sm" type="submit" className="w-full text-terracotta"><Trash2 /> Delete</Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
