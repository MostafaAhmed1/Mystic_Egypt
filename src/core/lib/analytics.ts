const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

export type GtagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "set",
      targetId: string,
      config?: Record<string, unknown>,
    ) => void;
  }
}

export function pageview(url: string) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") return;
  window.gtag("config", GA_MEASUREMENT_ID, { page_path: url });
}

export function event({ action, category, label, value }: GtagEvent) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") return;
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
}
