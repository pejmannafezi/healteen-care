import { Link } from "@/i18n/navigation";

export function LiveBanner({ title }: { title?: string | null }) {
  return (
    <Link
      href="/live"
      className="block border-b border-forest-700 bg-forest text-cream transition-colors hover:bg-forest-700"
    >
      <div className="container-page flex items-center gap-3 py-2.5 text-sm">
        <span className="relative flex size-2.5" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terracotta opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-terracotta" />
        </span>
        <span className="font-bold uppercase tracking-wide">Live now</span>
        <span className="truncate text-cream/85">{title ?? "Watch & shop with us"} →</span>
      </div>
    </Link>
  );
}
