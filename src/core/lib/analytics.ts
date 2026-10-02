const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;
const GA_MEASUREMENT_SECRET = process.env.GA_MEASUREMENT_SECRET;

export type GtagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

declare global {
  interface Window {
    dataLayer: unknown[][];
    gtag: (
      command: "config" | "event" | "set" | "consent" | "js",
      targetId: string | Date,
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

/**
 * Send a GA4 event directly via the global gtag function (client-side).
 * Use this in client components that need to fire a specific event
 * without going through the useAnalytics hook.
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") return;
  window.gtag("event", eventName, params);
}

/**
 * Read the GA4 client id from the `_ga` cookie. The cookie value looks like
 * "GA1.1.1234567890.1234567890"; the client id is the last two dot-separated
 * segments. Returns null when the cookie is absent (no analytics consent yet).
 */
export function readGaClientId(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )_ga=([^;]*)/);
  if (!match?.[1]) return null;
  const segments = match[1].replace(/^GA\d\.\d\./, "").split(".");
  if (segments.length !== 2) return null;
  return `${segments[0]}.${segments[1]}`;
}

/**
 * Send a GA4 event from the server via the Measurement Protocol.
 * Returns true if GA4 accepted the event, false otherwise.
 * Never throws — callers can safely ignore the return value.
 *
 * `clientId` should be the real GA4 client id captured from the visitor's
 * browser (the second segment pair of the `_ga` cookie). When unavailable,
 * a valid-format synthetic id is used so the event is still accepted, but
 * it will not be attributed to a browsing session.
 */
export async function sendServerEvent(
  eventName: string,
  params: ServerEventParams,
  clientId?: string,
): Promise<boolean> {
  if (!GA_MEASUREMENT_ID || !GA_MEASUREMENT_SECRET) {
    console.warn(
      `[analytics] GA4 server event "${eventName}" skipped: missing GA_MEASUREMENT_SECRET`,
    );
    return false;
  }

  try {
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_MEASUREMENT_SECRET}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId?.trim() || fallbackClientId(),
        events: [
          {
            name: eventName,
            params,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error(
        `[analytics] GA4 server event "${eventName}" failed: HTTP ${response.status}`,
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error(
      `[analytics] GA4 server event "${eventName}" failed:`,
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}

export type ServerEventParams = Record<
  string,
  | string
  | number
  | boolean
  | Array<Record<string, string | number>>
>;

function fallbackClientId(): string {
  const random = Math.floor(Math.random() * 1e10);
  return `${random}.${Date.now().toString().slice(-10)}`;
}
