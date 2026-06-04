import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { saveBlogPost } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

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
      <Link href="/admin/blog" className="text-sm text-nature hover:underline">← Back to blog</Link>
      <h2 className="mb-6 mt-2 text-2xl font-bold">{isNew ? "New post" : "Edit post"}</h2>
      <Card>
        <CardContent className="p-6">
          <form action={saveBlogPost} className="space-y-4">
            <input type="hidden" name="id" value={post?.id ?? "new"} />
            <div>
              <Label>Title</Label>
              <Input name="title" defaultValue={post?.title ?? ""} required />
            </div>
            <div>
              <Label>Excerpt (short summary)</Label>
              <Textarea name="excerpt" defaultValue={post?.excerpt ?? ""} rows={2} />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea name="content" defaultValue={post?.content ?? ""} rows={14} />
            </div>
            <div>
              <Label>Cover image</Label>
              {post?.cover_image && (
                <div className="relative my-2 aspect-[16/9] w-48 overflow-hidden rounded-lg border border-border">
                  <Image src={post.cover_image} alt="" fill sizes="192px" className="object-cover" />
                </div>
              )}
              <input type="file" name="cover" accept="image/*" className="text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="is_published" defaultChecked={post?.is_published ?? false} />
              Published (visible on the site)
            </label>
            <Button type="submit">Save post</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
