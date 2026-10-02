"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useAnalytics } from "@/shared/hooks/use-analytics";

function grantConsent(measurementId: string) {
  window.gtag("consent", "update", {
    ad_storage: "granted",
    analytics_storage: "granted",
  });
  window.gtag("event", "page_view", {
    page_path: window.location.pathname,
    send_to: measurementId,
  });
}

type AnalyticsProviderProps = {
  gaId?: string;
};

export function AnalyticsProvider({ gaId }: AnalyticsProviderProps) {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    if (!gaId) return;
    const id = gaId;
    function checkConsent() {
      const match = document.cookie.match(/(?:^|; )cookie_consent=([^;]*)/);
      if (match?.[1] === "accepted") {
        setConsented(true);
        grantConsent(id);
      }
    }
    checkConsent();
    window.addEventListener("cookie-consent-accepted", checkConsent);
    return () => window.removeEventListener("cookie-consent-accepted", checkConsent);
  }, [gaId]);

  if (!gaId) return null;

  return (
    <>
      <Script
        id="ga4-consent-init"
        strategy="afterInteractive"
      >
        {`window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function () {window.dataLayer.push(arguments);};
window.gtag("consent", "default", {
  ad_storage: "denied",
  analytics_storage: "denied",
});`}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-config" strategy="afterInteractive">
        {`window.gtag("js", new Date());
window.gtag("config", "${gaId}", {
  send_page_view: false,
});`}
      </Script>
      {consented && <AnalyticsTracker />}
    </>
  );
}

function AnalyticsTracker() {
  useAnalytics();
  return null;
}
