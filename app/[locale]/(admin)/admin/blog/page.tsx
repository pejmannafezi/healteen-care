import { Link } from "@/i18n/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deleteBlogPost } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminBlogPage() {
  const db = createSupabaseAdminClient();
  const { data: posts } = await db
    .from("blog_posts")
    .select("id, title, slug, is_published, published_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold">Blog ({posts?.length ?? 0})</h2>
        <Link href="/admin/blog/new"><Button size="sm"><Plus /> New post</Button></Link>
      </div>
      <Card>
        <CardContent className="p-0">
          {!posts || posts.length === 0 ? (
            <p className="p-8 text-center text-sm text-forest/60">No posts yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {posts.map((p) => (
                <li key={p.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-forest">{p.title}</p>
                    <p className="text-xs text-forest/50">{p.is_published ? "Published" : "Draft"}</p>
                  </div>
                  <Link href={`/admin/blog/${p.id}`}>
                    <Button variant="ghost" size="icon" aria-label="Edit"><Pencil /></Button>
                  </Link>
                  <form action={deleteBlogPost}>
                    <input type="hidden" name="id" value={p.id} />
                    <Button variant="ghost" size="icon" type="submit" className="text-terracotta" aria-label="Delete"><Trash2 /></Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
