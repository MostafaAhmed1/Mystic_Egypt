"use client";

import Script from "next/script";
import { useAnalytics } from "@/shared/hooks/use-analytics";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

function AnalyticsTracker() {
  useAnalytics();
  return null;
}

export function AnalyticsProvider() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', {
  page_path: window.location.pathname,
});`}
      </Script>
      <AnalyticsTracker />
    </>
  );
}
