import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { saveBlogPost } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const FILE_CLS =
  "block w-full max-w-md cursor-pointer rounded-xl border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground transition-colors hover:border-nature/50 file:me-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cream";

export default async function BlogEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";
  const db = createSupabaseAdminClient();
  const post = isNew ? null : (await db.from("blog_posts").select("*").eq("id", id).single()).data;

  return (
    <div>
      <Link
        href="/admin/blog"
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full text-sm font-medium text-nature transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-3.5 rtl:rotate-180" /> Back to blog
      </Link>
      <h2 className="mb-1 mt-2 text-2xl font-bold text-forest">{isNew ? "New post" : "Edit post"}</h2>
      <div className="gold-divider mb-6 mt-3 max-w-[10rem]" />

      <Card>
        <CardContent className="p-6 pt-6">
          <form action={saveBlogPost} className="space-y-5">
            <input type="hidden" name="id" value={post?.id ?? "new"} />
            <div>
              <Label htmlFor="bp-title">Title</Label>
              <Input id="bp-title" name="title" defaultValue={post?.title ?? ""} required />
            </div>
            <div>
              <Label htmlFor="bp-excerpt">Excerpt (short summary)</Label>
              <Textarea id="bp-excerpt" name="excerpt" defaultValue={post?.excerpt ?? ""} rows={2} />
            </div>
            <div>
              <Label htmlFor="bp-content">Content</Label>
              <Textarea id="bp-content" name="content" defaultValue={post?.content ?? ""} rows={14} />
            </div>
            <div>
              <Label htmlFor="bp-cover">Cover image</Label>
              {post?.cover_image && (
                <div className="relative my-2 aspect-[16/9] w-48 overflow-hidden rounded-xl border border-border shadow-card">
                  <Image src={post.cover_image} alt="" fill sizes="192px" className="object-cover" />
                </div>
              )}
              <input id="bp-cover" type="file" name="cover" accept="image/*" className={FILE_CLS} />
            </div>
            <label className="flex w-fit cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm font-medium text-forest transition-colors hover:border-nature/50 has-[:checked]:border-nature has-[:checked]:bg-mint/10">
              <input type="checkbox" name="is_published" defaultChecked={post?.is_published ?? false} className="size-4 accent-forest" />
              Published (visible on the site)
            </label>
            <Button type="submit">Save post</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
