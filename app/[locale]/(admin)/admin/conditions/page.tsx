import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Activity, Plus, Pencil, Trash2 } from "lucide-react";
import { adminListConditions } from "@/lib/services/admin";
import { deleteCondition } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminConditionsPage() {
  const conditions = await adminListConditions();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold">Health Library ({conditions.length})</h2>
        <Link href="/admin/conditions/new">
          <Button size="sm"><Plus /> Add condition</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {conditions.length === 0 ? (
            <p className="p-8 text-center text-sm text-forest/60">No conditions yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {conditions.map((c) => (
                <li key={c.id} className="flex items-center gap-4 p-4">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-nature/10">
                    {c.image_url ? (
                      <Image src={c.image_url} alt="" fill sizes="48px" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><Activity className="size-5 text-nature/40" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-forest">{c.name}</p>
                    <p className="text-xs text-forest/50">{c.is_published ? "Published" : "Hidden"}</p>
                  </div>
                  <Link href={`/admin/conditions/${c.id}`}>
                    <Button variant="ghost" size="icon" aria-label="Edit"><Pencil /></Button>
                  </Link>
                  <form action={deleteCondition}>
                    <input type="hidden" name="id" value={c.id} />
                    <Button variant="ghost" size="icon" type="submit" aria-label="Delete" className="text-terracotta"><Trash2 /></Button>
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
