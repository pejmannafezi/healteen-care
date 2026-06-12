import { Link } from "@/i18n/navigation";
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deleteWebinar } from "./actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TH = "px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-muted-foreground";

export default async function AdminWebinarsPage() {
  const db = createSupabaseAdminClient();
  const { data: webinars } = await db
    .from("webinars")
    .select("id, title, scheduled_at, is_published")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-forest">Classes &amp; Webinars</h2>
          <Badge variant="outline" className="tabular-nums">{webinars?.length ?? 0}</Badge>
        </div>
        <Link href="/admin/webinars/new"><Button size="sm"><Plus /> New class</Button></Link>
      </div>

      <Card className="overflow-hidden">
        {!webinars || webinars.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <GraduationCap className="size-8 text-nature/40" aria-hidden />
            <p className="text-sm text-muted-foreground">No classes yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th scope="col" className={TH}>Class</th>
                  <th scope="col" className={TH}>Date</th>
                  <th scope="col" className={TH}>Status</th>
                  <th scope="col" className={cn(TH, "text-end")}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {webinars.map((w) => (
                  <tr key={w.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3.5">
                      <span className="block min-w-0 max-w-[20rem] truncate font-semibold text-forest">{w.title}</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap tabular-nums text-forest/75">
                      {w.scheduled_at ? new Date(w.scheduled_at).toLocaleDateString("en-US") : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      {w.is_published ? (
                        <Badge variant="nature">Published</Badge>
                      ) : (
                        <Badge variant="gold">Draft</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/webinars/${w.id}`}>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0" aria-label="Edit">
                            <Pencil />
                          </Button>
                        </Link>
                        <form action={deleteWebinar}>
                          <input type="hidden" name="id" value={w.id} />
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
