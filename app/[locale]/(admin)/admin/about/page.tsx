import Image from "next/image";
import { FileText } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { saveAbout } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FILE_CLS =
  "block w-full cursor-pointer rounded-xl border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground transition-colors hover:border-nature/50 file:me-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cream";

export default async function AdminAboutPage() {
  const db = createSupabaseAdminClient();
  const { data: about } = await db.from("about_content").select("*").eq("id", 1).single();

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About page</CardTitle>
          <CardDescription>Your public story, photo and résumé.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form action={saveAbout} className="space-y-5">
            <div>
              <Label htmlFor="ab-headline">Headline</Label>
              <Input id="ab-headline" name="headline" defaultValue={about?.headline ?? ""} placeholder="About Pejman Nafezi" />
            </div>
            <div>
              <Label htmlFor="ab-body">Bio / story</Label>
              <Textarea id="ab-body" name="body" defaultValue={about?.body ?? ""} rows={10} placeholder="Tell your story…" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ab-image">Photo</Label>
                {about?.image_url && (
                  <div className="relative my-2 size-28 overflow-hidden rounded-xl border border-border shadow-card">
                    <Image src={about.image_url} alt="" fill sizes="112px" className="object-cover" />
                  </div>
                )}
                <input id="ab-image" type="file" name="image" accept="image/*" className={FILE_CLS} />
              </div>
              <div>
                <Label htmlFor="ab-resume">Résumé (PDF)</Label>
                {about?.resume_url && (
                  <p className="my-2">
                    <a
                      href={about.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-nature hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <FileText className="size-4" aria-hidden /> Current résumé →
                    </a>
                  </p>
                )}
                <input id="ab-resume" type="file" name="resume" accept="application/pdf" className={FILE_CLS} />
              </div>
            </div>

            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
