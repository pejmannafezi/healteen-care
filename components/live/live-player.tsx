import { Radio } from "lucide-react";
import { youtubeEmbedUrl } from "@/lib/youtube";

export function LivePlayer({ youtubeUrl }: { youtubeUrl: string | null }) {
  const embed = youtubeEmbedUrl(youtubeUrl);

  if (!embed) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-forest text-cream">
        <Radio className="size-10 text-mint" />
        <p className="font-semibold">The stream will appear here when we go live.</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
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
