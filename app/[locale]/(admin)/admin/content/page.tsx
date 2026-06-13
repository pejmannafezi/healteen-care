import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { saveSiteContent } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FILE_CLS =
  "block w-full cursor-pointer rounded-xl border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground transition-colors hover:border-nature/50 file:me-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cream";

type Field = { key: string; label: string; multiline?: boolean };

const SECTIONS: { title: string; fields: Field[] }[] = [
  {
    title: "Homepage — hero",
    fields: [
      { key: "hero.eyebrow", label: "Eyebrow" },
      { key: "hero.title", label: "Title", multiline: true },
      { key: "hero.subtitle", label: "Subtitle", multiline: true },
      { key: "hero.ctaShop", label: "Shop button" },
      { key: "hero.ctaConsult", label: "Consult button" },
      { key: "hero.chip", label: "Quality chip" },
    ],
  },
  {
    title: "Homepage — Wellness Line",
    fields: [
      { key: "wellness.eyebrow", label: "Eyebrow" },
      { key: "wellness.title", label: "Title" },
      { key: "wellness.body", label: "Body", multiline: true },
    ],
  },
  {
    title: "About page",
    fields: [
      { key: "about.eyebrow", label: "Eyebrow" },
      { key: "about.heading", label: "Heading" },
      { key: "about.body", label: "Body", multiline: true },
    ],
  },
  {
    title: "Shop page",
    fields: [
      { key: "shop.eyebrow", label: "Eyebrow" },
      { key: "shop.title", label: "Title" },
      { key: "shop.subtitle", label: "Subtitle", multiline: true },
    ],
  },
];

export default async function AdminContentPage() {
  const db = createSupabaseAdminClient();
  const { data: rows } = await db.from("site_content").select("key, locale, text_value, image_url");

  const val = (key: string, locale: string) =>
    rows?.find((r) => r.key === key && r.locale === locale)?.text_value ?? "";
  const heroImage = rows?.find((r) => r.key === "hero.image")?.image_url ?? null;

  return (
    <form action={saveSiteContent} className="space-y-6">
      {/* Header + live-edit entry */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Site content</CardTitle>
            <CardDescription>
              Edit text per language (English &amp; Farsi); blank falls back to the built-in copy. Or edit
              directly on the page with the live editor.
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href="/?edit=1" target="_blank">
              <ExternalLink className="size-4" /> Edit live site
            </Link>
          </Button>
        </CardHeader>
      </Card>

      {SECTIONS.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className="text-base">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            {section.fields.map((f) => (
              <div key={f.key} className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`en__${f.key}`}>
                    {f.label} <span className="text-muted-foreground">· EN</span>
                  </Label>
                  {f.multiline ? (
                    <Textarea id={`en__${f.key}`} name={`en__${f.key}`} rows={2} defaultValue={val(f.key, "en")} />
                  ) : (
                    <Input id={`en__${f.key}`} name={`en__${f.key}`} defaultValue={val(f.key, "en")} />
                  )}
                </div>
                <div>
                  <Label htmlFor={`fa__${f.key}`}>
                    {f.label} <span className="text-muted-foreground">· FA</span>
                  </Label>
                  {f.multiline ? (
                    <Textarea id={`fa__${f.key}`} name={`fa__${f.key}`} rows={2} dir="rtl" defaultValue={val(f.key, "fa")} />
                  ) : (
                    <Input id={`fa__${f.key}`} name={`fa__${f.key}`} dir="rtl" defaultValue={val(f.key, "fa")} />
                  )}
                </div>
              </div>
            ))}

            {section.title === "Homepage — hero" && (
              <div>
                <Label htmlFor="heroImage">Hero image</Label>
                {heroImage && (
                  <div className="relative my-2 aspect-square w-40 overflow-hidden rounded-xl border border-border shadow-card">
                    <Image src={heroImage} alt="Current hero" fill sizes="160px" className="object-cover" />
                  </div>
                )}
                <input id="heroImage" type="file" name="heroImage" accept="image/*" className={FILE_CLS} />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Square image works best. Leave empty to keep the current one.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="sticky bottom-4 z-10">
        <Button type="submit" size="lg" className="shadow-lift">Save changes</Button>
      </div>
    </form>
  );
}
