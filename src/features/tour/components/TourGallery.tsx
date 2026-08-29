"use client";

import { useState } from "react";
import { cn } from "@/core/utils";
import { TourImage } from "@/features/tour/components/TourImage";
import type { TourImageDto } from "@/features/tour/types";

export function TourGallery({
  images,
  title,
}: {
  images: TourImageDto[];
  title: string;
}) {
  const primary = images.find((img) => img.is_primary) ?? images[0];
  const [active, setActive] = useState(primary);

  if (!active) {
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

  return (
    <div className="space-y-3">
      <TourImage
        src={active.image_url}
        alt={title}
        sizes="(min-width: 768px) 60vw, 100vw"
        className="aspect-[16/9] w-full rounded-2xl object-cover"
        fallbackLabel={title}
      />
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(img)}
              aria-label={`View image ${img.id}`}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-opacity",
                active.id === img.id
                  ? "border-primary ring-2 ring-ring/40"
                  : "border-border opacity-60 hover:opacity-100",
              )}
            >
              <TourImage
                src={img.image_url}
                alt=""
                sizes="96px"
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
