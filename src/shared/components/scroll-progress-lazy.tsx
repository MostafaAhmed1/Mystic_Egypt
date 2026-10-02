"use client";

import dynamic from "next/dynamic";

const ScrollProgress = dynamic(
  () => import("@/shared/components/scroll-progress").then((m) => m.ScrollProgress),
  { ssr: false },
);

export function ScrollProgressLazy() {
  return <ScrollProgress />;
}