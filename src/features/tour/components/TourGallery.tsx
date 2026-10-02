"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/core/utils";
import { TourImage } from "@/features/tour/components/TourImage";
import type { TourImageDto } from "@/features/tour/types";

const VISIBLE_THUMBS = 5;

export function TourGallery({
  images,
  title,
}: {
  images: TourImageDto[];
  title: string;
}) {
  const primary = images.find((img) => img.is_primary) ?? images[0];
  const [activeIdx, setActiveIdx] = useState(primary ? images.indexOf(primary) : 0);
  const [lightbox, setLightbox] = useState(false);
  const [thumbOffset, setThumbOffset] = useState(0);

  const go = useCallback(
    (dir: -1 | 1) => {
      setActiveIdx((prev) => (prev + dir + images.length) % images.length);
    },
    [images.length],
  );

  // Keep thumbnails scrolled to show the active one
  useEffect(() => {
    if (activeIdx < thumbOffset) setThumbOffset(activeIdx);
    else if (activeIdx >= thumbOffset + VISIBLE_THUMBS) setThumbOffset(activeIdx - VISIBLE_THUMBS + 1);
  }, [activeIdx, thumbOffset]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "Escape") setLightbox(false);
    }
    if (lightbox) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [lightbox, go]);

  if (!images.length) {
    return (
      <TourImage
        src={null}
        alt={title}
        sizes="(min-width: 768px) 60vw, 100vw"
        className="aspect-[16/9] w-full rounded-2xl"
        fallbackLabel={title}
      />
    );
  }

  const active = images[activeIdx];
  const hasMany = images.length > VISIBLE_THUMBS;
  const thumbStart = hasMany ? thumbOffset : 0;
  const visibleThumbs = images.slice(thumbStart, thumbStart + VISIBLE_THUMBS);

  return (
    <>
      <div className="space-y-3">
        {/* Main image with arrows */}
        <div
          className="group relative aspect-[16/9] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-obsidian/5"
          onClick={() => setLightbox(true)}
        >
          <TourImage
            key={active.id}
            src={active.image_url}
            alt={`${title} — image ${activeIdx + 1}`}
            sizes="(min-width: 768px) 60vw, 100vw"
            fill
            lcp
            className="animate-fade-in object-cover"
            fallbackLabel={title}
          />

          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-obsidian/5" />

          {/* Counter */}
          <div className="absolute bottom-3 right-3 rounded-full bg-obsidian/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {activeIdx + 1} / {images.length}
          </div>

          {/* Zoom hint */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-obsidian/60 px-3 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <ZoomIn className="size-3" />
            Click to zoom
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-obsidian shadow-lg backdrop-blur-sm opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(1); }}
                className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-obsidian shadow-lg backdrop-blur-sm opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails — scrollable for many images */}
        {images.length > 1 && (
          <div className="relative flex items-center gap-2">
            {/* Left scroll arrow for many images */}
            {hasMany && thumbOffset > 0 && (
              <button
                type="button"
                onClick={() => setThumbOffset((o) => Math.max(0, o - 1))}
                className="absolute -left-1 z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/90 text-obsidian shadow-md hover:bg-white"
                aria-label="Scroll thumbnails left"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}

            <div className="flex flex-1 gap-2 overflow-hidden">
              {visibleThumbs.map((img) => {
                const realIdx = images.indexOf(img);
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveIdx(realIdx)}
                    aria-label={`View image ${realIdx + 1}`}
                    className={cn(
                      "relative h-20 flex-1 overflow-hidden rounded-xl border-2 transition-all duration-300",
                      realIdx === activeIdx
                        ? "border-gold shadow-[0_0_16px_rgba(212,175,55,0.35)] scale-[1.02]"
                        : "border-transparent opacity-50 hover:opacity-80 hover:border-gold/30",
                    )}
                  >
                    <TourImage
                      src={img.image_url}
                      alt=""
                      sizes="120px"
                      fill
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>

            {/* Right scroll arrow for many images */}
            {hasMany && thumbOffset + VISIBLE_THUMBS < images.length && (
              <button
                type="button"
                onClick={() => setThumbOffset((o) => Math.min(images.length - VISIBLE_THUMBS, o + 1))}
                className="absolute -right-1 z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/90 text-obsidian shadow-md hover:bg-white"
                aria-label="Scroll thumbnails right"
              >
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            className="absolute left-4 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            aria-label="Previous"
          >
            <ChevronLeft className="size-6" />
          </button>

          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <TourImage
              key={`lb-${active.id}`}
              src={active.image_url}
              alt={`${title} — image ${activeIdx + 1}`}
              fill
              className="animate-fade-in object-contain"
              sizes="90vw"
            />
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); go(1); }}
            className="absolute right-4 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            aria-label="Next"
          >
            <ChevronRight className="size-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            {activeIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
