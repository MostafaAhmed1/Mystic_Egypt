"use client";

import Image from "next/image";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/core/utils";

type TourImageProps = {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  /** Optional label shown over the gradient fallback when no image exists. */
  fallbackLabel?: string | null;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
};

/**
 * Renders a tour image with Next.js Image optimization when a real file exists,
 * and an elegant themed placeholder otherwise (before admin uploads real photos in M6).
 */
export function TourImage({
  src,
  alt,
  sizes,
  className,
  fallbackLabel,
  fill,
  width,
  height,
  priority,
}: TourImageProps) {
  const [failed, setFailed] = useState(false);
  const hasImage = Boolean(src) && !failed;

  if (hasImage) {
    return (
      <Image
        src={src as string}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        priority={priority}
        className={cn("bg-muted/40", className)}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-200 via-orange-200 to-stone-300 p-4 text-center text-stone-700",
        className,
      )}
    >
      <MapPin className="size-8 text-stone-500" aria-hidden />
      {fallbackLabel && <span className="text-xs font-medium">{fallbackLabel}</span>}
    </div>
  );
}
