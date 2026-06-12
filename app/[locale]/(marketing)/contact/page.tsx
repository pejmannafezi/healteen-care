import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Leaf, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Contact" };

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="relative flex min-h-[60vh] items-center overflow-hidden">
      {/* Soft botanical backdrop */}
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -start-24 opacity-[0.04]">
        <Leaf className="size-96 text-forest" strokeWidth={0.75} />
      </div>

      <div className="container-page section relative">
        <div className="mx-auto max-w-xl animate-fade-up text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-nature/10">
            <Leaf className="size-8 text-nature" strokeWidth={1.2} />
          </span>
          <p className="eyebrow mt-5">Coming soon</p>
          <h1 className="mt-2 text-balance text-4xl font-bold text-forest md:text-5xl">Contact Us</h1>
          <div className="gold-divider mx-auto mt-5 max-w-[10rem]" />
          <p className="mt-5 text-lg leading-relaxed text-forest/70">
            A contact form and our details will appear here soon. In the meantime, email
            info@healteencare.com.
          </p>

          {/* Direct email card */}
          <a
            href="mailto:info@healteencare.com"
            className="card-hover group mt-10 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 text-start shadow-card hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-600">
                <Mail className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-bold text-forest">Email us directly</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  info@healteencare.com
                </span>
              </span>
            </span>
            <ArrowRight className="size-5 shrink-0 text-gold-600 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </a>

          <div className="mt-10">
            <Link href="/">
              <Button variant="outline">Back to home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
