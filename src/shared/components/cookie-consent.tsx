"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Cookie } from "lucide-react";

const COOKIE_NAME = "cookie_consent";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookieValue(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function CookieConsent() {
  const { t } = useTranslation("common");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getCookieValue(COOKIE_NAME);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    setCookieValue(COOKIE_NAME, "accepted", COOKIE_MAX_AGE);
    setVisible(false);
  }

  function handleReject() {
    setCookieValue(COOKIE_NAME, "rejected", COOKIE_MAX_AGE);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
        <div className="flex items-center gap-3 text-center sm:text-start">
          <Cookie className="size-5 shrink-0 text-primary" aria-hidden />
          <p className="text-sm text-muted-foreground">
            {t("cookieConsent.message")}
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={handleReject}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium hover:bg-accent"
          >
            {t("cookieConsent.rejectNonEssential")}
          </button>
          <button
            onClick={handleAccept}
            className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("cookieConsent.acceptAll")}
          </button>
        </div>
      </div>
    </div>
  );
}
