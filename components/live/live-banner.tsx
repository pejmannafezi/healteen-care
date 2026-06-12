import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

export function LiveBanner({ title }: { title?: string | null }) {
  return (
    <Link
      href="/live"
      className="group block border-b border-gold/25 bg-gradient-to-r from-forest via-forest-700 to-forest text-cream transition-colors hover:from-forest-700 hover:to-forest-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
    >
      <div className="container-page flex min-h-11 items-center gap-3 py-2.5 text-sm">
        <span className="relative flex size-2.5 shrink-0" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terracotta opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-terracotta" />
        </span>
        <span className="shrink-0 font-bold uppercase tracking-wide text-gold">Live now</span>
        <span className="hidden h-3.5 w-px shrink-0 bg-cream/25 sm:block" aria-hidden />
        <span className="truncate text-cream/85">{title ?? "Watch & shop with us"}</span>
        <ArrowRight
          className="ms-auto size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
          aria-hidden
        />
      </div>
    </Link>
  );
}
