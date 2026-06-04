import Image from "next/image";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { saveAbout } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminAboutPage() {
  const db = createSupabaseAdminClient();
  const { data: about } = await db.from("about_content").select("*").eq("id", 1).single();

  return (
    <div>
      <h2 className="mb-5 text-lg font-bold">About page</h2>
      <Card>
        <CardContent className="p-6">
          <form action={saveAbout} className="space-y-4">
            <div>
              <Label>Headline</Label>
              <Input name="headline" defaultValue={about?.headline ?? ""} placeholder="About Pejman Nafezi" />
            </div>
            <div>
              <Label>Bio / story</Label>
              <Textarea name="body" defaultValue={about?.body ?? ""} rows={10} placeholder="Tell your story…" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Photo</Label>
                {about?.image_url && (
                  <div className="relative my-2 size-28 overflow-hidden rounded-lg border border-border">
                    <Image src={about.image_url} alt="" fill sizes="112px" className="object-cover" />
                  </div>
                )}
                <input type="file" name="image" accept="image/*" className="text-sm" />
              </div>
              <div>
                <Label>Résumé (PDF)</Label>
                {about?.resume_url && (
                  <p className="my-2 text-sm">
                    <a href={about.resume_url} target="_blank" rel="noopener noreferrer" className="text-nature hover:underline">
                      Current résumé →
                    </a>
                  </p>
                )}
                <input type="file" name="resume" accept="application/pdf" className="text-sm" />
              </div>
            </div>

            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
