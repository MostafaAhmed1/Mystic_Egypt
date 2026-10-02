"use client";

import Image from "next/image";
import { useState } from "react";
import { Pyramid } from "lucide-react";
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
  /**
   * Marks this image as the page's Largest Contentful Paint element: loaded
   * eagerly at high priority. Next.js 16 equivalent of the deprecated
   * `priority` prop. Only one image per page should set this.
   */
  lcp?: boolean;
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
  lcp,
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
        loading={lcp ? "eager" : "lazy"}
        fetchPriority={lcp ? "high" : undefined}
        className={cn("bg-sandstone-dark/30", className)}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-sandstone-dark via-gold/10 to-sandstone-dark p-4 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-gold/10">
        <Pyramid className="size-7 text-gold/60" aria-hidden />
      </div>
      {fallbackLabel && (
        <span className="text-xs font-medium tracking-wider text-obsidian/40">
          {fallbackLabel}
        </span>
      )}
    </div>
  );
}
