import { Radio } from "lucide-react";
import { youtubeEmbedUrl } from "@/lib/youtube";

export function LivePlayer({ youtubeUrl }: { youtubeUrl: string | null }) {
  const embed = youtubeEmbedUrl(youtubeUrl);

  if (!embed) {
    return (
      <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-forest to-forest-700 px-6 text-center text-cream shadow-soft">
        <span className="flex size-16 items-center justify-center rounded-full bg-cream/10">
          <Radio className="size-8 text-mint" aria-hidden />
        </span>
        <p className="font-semibold">The stream will appear here when we go live.</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-gold/20 bg-black shadow-soft">
      <iframe
        src={embed}
        title="Healteen Care live stream"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
