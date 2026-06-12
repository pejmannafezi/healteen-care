import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Activity, Plus, Pencil, Trash2 } from "lucide-react";
import { adminListConditions } from "@/lib/services/admin";
import { deleteCondition } from "./actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TH = "px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-muted-foreground";

export default async function AdminConditionsPage() {
  const conditions = await adminListConditions();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-forest">Health Library</h2>
          <Badge variant="outline" className="tabular-nums">{conditions.length}</Badge>
        </div>
        <Link href="/admin/conditions/new">
          <Button size="sm"><Plus /> Add condition</Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        {conditions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Activity className="size-8 text-nature/40" aria-hidden />
            <p className="text-sm text-muted-foreground">No conditions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th scope="col" className={TH}>Condition</th>
                  <th scope="col" className={TH}>Status</th>
                  <th scope="col" className={cn(TH, "text-end")}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {conditions.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-nature/10">
                          {c.image_url ? (
                            <Image src={c.image_url} alt="" fill sizes="44px" className="object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Activity className="size-5 text-nature/40" aria-hidden />
                            </div>
                          )}
                        </div>
                        <span className="min-w-0 max-w-[20rem] truncate font-semibold text-forest">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.is_published ? (
                        <Badge variant="nature">Published</Badge>
                      ) : (
                        <Badge variant="muted">Hidden</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/conditions/${c.id}`}>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0" aria-label="Edit">
                            <Pencil />
                          </Button>
                        </Link>
                        <form action={deleteCondition}>
                          <input type="hidden" name="id" value={c.id} />
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
