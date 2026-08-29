import Stripe from "stripe";

// Lazy-init so the module can be imported even when STRIPE_SECRET_KEY is not
// yet configured (placeholder keys in local .env for test mode).
function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes("placeholder")) {
    return null;
  }
  return new Stripe(secretKey);
}

export function isStripeConfigured(): boolean {
  return getStripe() !== null;
}

/**
 * The server-side Stripe client. Returns null when the secret key is not
 * configured (production must set a real test/live key).
 */
export function stripe(): Stripe {
  const client = getStripe();
  if (!client) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY (test mode first).",
    );
  }
  return client;
}
