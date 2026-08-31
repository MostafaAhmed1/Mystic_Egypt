"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { pageview, event as gtagEvent, type GtagEvent } from "@/core/lib/analytics";

export function useAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    pageview(pathname);
  }, [pathname]);

  return {
    track: (evt: GtagEvent) => gtagEvent(evt),
  };
}
