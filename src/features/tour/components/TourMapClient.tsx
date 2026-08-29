"use client";

import dynamic from "next/dynamic";
import type { TourPointDto } from "@/features/tour/types";

const TourMap = dynamic(() => import("@/features/tour/components/TourMap").then((m) => m.TourMap), {
  ssr: false,
  loading: () => <div className="h-72 w-full rounded-2xl border bg-muted/30" />,
});

export function TourMapClient({ route }: { route: TourPointDto[] }) {
  return <TourMap route={route} />;
}
