import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Leaf, ArrowRight } from "lucide-react";

// Locale-aware 404 — rendered inside the [locale] layout (has header/footer).
export default function LocaleNotFound() {
  return (
    <div className="relative flex min-h-[60vh] items-center overflow-hidden">
      {/* Soft botanical backdrop */}
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -end-24 opacity-[0.04]">
        <Leaf className="size-96 text-forest" strokeWidth={0.75} />
      </div>

      <div className="container-page section relative">
        <div className="mx-auto max-w-md animate-fade-up text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-nature/10">
            <Leaf className="size-8 text-nature" strokeWidth={1.2} />
          </span>
          <p className="eyebrow mt-5">404</p>
          <h1 className="mt-2 text-balance text-4xl font-bold text-forest md:text-5xl">
            Page not found
          </h1>
          <div className="gold-divider mx-auto mt-5 max-w-[10rem]" />
          <p className="mt-5 text-lg leading-relaxed text-forest/70">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link href="/">
              <Button size="lg">Back to home</Button>
            </Link>
            <Link href="/shop">
              <Button size="lg" variant="outline">
                Browse the shop <ArrowRight className="size-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
