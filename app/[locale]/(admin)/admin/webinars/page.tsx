import { Link } from "@/i18n/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deleteWebinar } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminWebinarsPage() {
  const db = createSupabaseAdminClient();
  const { data: webinars } = await db
    .from("webinars")
    .select("id, title, scheduled_at, is_published")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold">Classes & Webinars ({webinars?.length ?? 0})</h2>
        <Link href="/admin/webinars/new"><Button size="sm"><Plus /> New class</Button></Link>
      </div>
      <Card>
        <CardContent className="p-0">
          {!webinars || webinars.length === 0 ? (
            <p className="p-8 text-center text-sm text-forest/60">No classes yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {webinars.map((w) => (
                <li key={w.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-forest">{w.title}</p>
                    <p className="text-xs text-forest/50">
                      {w.is_published ? "Published" : "Draft"}
                      {w.scheduled_at ? ` · ${new Date(w.scheduled_at).toLocaleDateString("en-US")}` : ""}
                    </p>
                  </div>
                  <Link href={`/admin/webinars/${w.id}`}>
                    <Button variant="ghost" size="icon" aria-label="Edit"><Pencil /></Button>
                  </Link>
                  <form action={deleteWebinar}>
                    <input type="hidden" name="id" value={w.id} />
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
