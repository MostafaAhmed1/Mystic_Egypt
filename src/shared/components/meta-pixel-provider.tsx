"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  initMetaPixel,
  sendMetaEvent,
  updateMetaUserData,
  isMetaPixelEnabled,
  type MetaUserData,
} from "@/core/lib/meta-pixel";

/**
 * Loads the Meta Pixel behind the existing cookie-consent gate (the same
 * `cookie_consent` cookie that GA4 uses). Also fires the PageView event on
 * every route change — as both a browser Pixel event and a CAPI event with a
 * shared `event_id`, so Meta counts each page view exactly once.
 */
export function MetaPixelProvider({ pixelId }: { pixelId?: string }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [consented, setConsented] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!pixelId) return;
    function checkConsent() {
      const match = document.cookie.match(/(?:^|; )cookie_consent=([^;]*)/);
      setConsented(match?.[1] === "accepted");
    }
    checkConsent();
    window.addEventListener("cookie-consent-accepted", checkConsent);
    return () =>
      window.removeEventListener("cookie-consent-accepted", checkConsent);
  }, [pixelId]);

  // Grant consent + register the pixel with Automatic Advanced Matching data
  // (email + first/last name) once the session is available.
  useEffect(() => {
    if (!pixelId || !consented) return;
    if (!initialized.current) {
      initMetaPixel(deriveUserData(session?.user));
      initialized.current = true;
    }
  }, [pixelId, consented, session]);

  // Keep Advanced Matching fresh when the session loads after init.
  useEffect(() => {
    if (initialized.current && consented) {
      updateMetaUserData(deriveUserData(session?.user));
    }
  }, [session, consented]);

  // PageView on the current page + every route change (browser Pixel + CAPI,
  // shared event_id). `consented` is a dependency so the view that just
  // initialized the pixel (an effect declared ABOVE this one, so it runs
  // first within the same commit) is counted too — a full page load mounts
  // this provider before the pixel exists, and without this the first view
  // of every load was silently lost until an internal route change.
  useEffect(() => {
    if (consented && isMetaPixelEnabled()) {
      sendMetaEvent("PageView");
    }
  }, [pathname, consented]);

  return null;
}

function deriveUserData(
  user: { name?: string | null; email?: string | null } | undefined,
): MetaUserData | undefined {
  if (!user?.email) return undefined;
  const parts = (user.name ?? "").trim().replace(/\s+/g, " ").split(" ");
  const data: MetaUserData = { em: user.email };
  const fn = parts[0];
  const ln = parts.length > 1 ? parts.slice(1).join(" ") : undefined;
  if (fn) data.fn = fn;
  if (ln) data.ln = ln;
  return data;
}