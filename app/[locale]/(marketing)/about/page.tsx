import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { FileText, Leaf } from "lucide-react";
import { getAbout } from "@/lib/services/content";

export const metadata = { title: "About" };

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const about = await getAbout();

  return (
    <div className="container-page py-16">
      <div className="grid items-start gap-12 lg:grid-cols-[320px_1fr]">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-nature/10 to-mint/10">
          {about.image_url ? (
            <Image src={about.image_url} alt={about.headline ?? "About"} fill sizes="320px" className="object-cover" priority />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Leaf className="size-16 text-nature/40" strokeWidth={1} />
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow">About</p>
          <h1 className="mt-2 text-4xl font-bold">{about.headline ?? "About Pejman Nafezi"}</h1>
          <div className="gold-divider my-5 max-w-xs" />
          {about.body ? (
            <div className="prose-healteen whitespace-pre-line text-lg leading-relaxed text-forest/80">
              {about.body}
            </div>
          ) : (
            <p className="text-forest/60">A personal introduction is coming here soon.</p>
          )}

          {about.resume_url && (
            <a
              href={about.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-md border border-forest/30 px-5 py-2.5 text-sm font-semibold text-forest hover:bg-forest/5"
            >
              <FileText className="size-4" /> View résumé
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
