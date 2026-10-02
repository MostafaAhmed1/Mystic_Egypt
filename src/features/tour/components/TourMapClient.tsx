"use client";

import dynamic from "next/dynamic";
import type { TourPointDto } from "@/features/tour/types";

const TourMap = dynamic(() => import("@/features/tour/components/TourMap").then((m) => m.TourMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full items-center justify-center rounded-2xl border border-gold/10 bg-obsidian/5">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
        <span className="text-xs text-obsidian/40">Loading map...</span>
      </div>
    </div>
  ),
});

export function TourMapClient({ route }: { route: TourPointDto[] }) {
  return <TourMap route={route} />;
}
