import { Link } from "@/i18n/navigation";
import { Plus, Pencil, Trash2, Newspaper } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deleteBlogPost } from "./actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TH = "px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-muted-foreground";

export default async function AdminBlogPage() {
  const db = createSupabaseAdminClient();
  const { data: posts } = await db
    .from("blog_posts")
    .select("id, title, slug, is_published, published_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-forest">Blog</h2>
          <Badge variant="outline" className="tabular-nums">{posts?.length ?? 0}</Badge>
        </div>
        <Link href="/admin/blog/new"><Button size="sm"><Plus /> New post</Button></Link>
      </div>

      <Card className="overflow-hidden">
        {!posts || posts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Newspaper className="size-8 text-nature/40" aria-hidden />
            <p className="text-sm text-muted-foreground">No posts yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th scope="col" className={TH}>Post</th>
                  <th scope="col" className={TH}>Status</th>
                  <th scope="col" className={cn(TH, "text-end")}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3.5">
                      <span className="block min-w-0 max-w-[24rem] truncate font-semibold text-forest">{p.title}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {p.is_published ? (
                        <Badge variant="nature">Published</Badge>
                      ) : (
                        <Badge variant="gold">Draft</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/blog/${p.id}`}>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0" aria-label="Edit">
                            <Pencil />
                          </Button>
                        </Link>
                        <form action={deleteBlogPost}>
                          <input type="hidden" name="id" value={p.id} />
                          <Button
                            variant="ghost"
                            size="sm"
                            type="submit"
                            aria-label="Delete"
                            className="h-9 w-9 p-0 text-terracotta hover:bg-terracotta/10 hover:text-terracotta"
                          >
                            <Trash2 />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
