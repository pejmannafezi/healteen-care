"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

export interface Story {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  caption: string | null;
  link_url: string | null;
}

export function StoriesBar({ stories }: { stories: Story[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!stories || stories.length === 0) return null;

  const active = open !== null ? stories[open] : null;
  const go = (dir: number) => {
    setOpen((i) => {
      if (i === null) return null;
      const next = i + dir;
      if (next < 0 || next >= stories.length) return null; // close at ends
      return next;
    });
  };

  return (
    <>
      {/* Bar */}
      <div className="border-b border-border bg-cream">
        <div className="container-page flex gap-4 overflow-x-auto py-4">
          {stories.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setOpen(i)}
              className="flex shrink-0 flex-col items-center gap-1.5"
              aria-label={s.caption ?? "Story"}
            >
              <span className="rounded-full bg-gradient-to-tr from-gold via-nature to-mint p-[3px]">
                <span className="block overflow-hidden rounded-full border-2 border-cream">
                  <span className="relative block size-16 bg-nature/10">
                    {s.media_type === "image" ? (
                      <Image src={s.media_url} alt="" fill sizes="64px" className="object-cover" />
                    ) : (
                      <video src={s.media_url} className="size-16 object-cover" muted playsInline />
                    )}
                  </span>
                </span>
              </span>
              {s.caption && <span className="max-w-[72px] truncate text-xs text-forest/70">{s.caption}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen viewer */}
      {active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90">
          <button onClick={() => setOpen(null)} className="absolute right-4 top-4 text-white/80 hover:text-white" aria-label="Close">
            <X className="size-7" />
          </button>
          {open! > 0 && (
            <button onClick={() => go(-1)} className="absolute left-3 text-white/70 hover:text-white" aria-label="Previous">
              <ChevronLeft className="size-9" />
            </button>
          )}
          {open! < stories.length - 1 && (
            <button onClick={() => go(1)} className="absolute right-3 text-white/70 hover:text-white" aria-label="Next">
              <ChevronRight className="size-9" />
            </button>
          )}

          <div className="relative flex h-[80vh] w-[min(92vw,420px)] flex-col overflow-hidden rounded-2xl bg-black">
            {active.media_type === "image" ? (
              <Image src={active.media_url} alt={active.caption ?? ""} fill sizes="420px" className="object-contain" />
            ) : (
              <video src={active.media_url} className="h-full w-full object-contain" controls autoPlay playsInline />
            )}
            {(active.caption || active.link_url) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                {active.caption && <p className="text-cream">{active.caption}</p>}
                {active.link_url && (
                  <a href={active.link_url} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-1.5 text-sm font-semibold text-forest">
                    View <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
