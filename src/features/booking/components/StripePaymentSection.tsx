"use client";

import { useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError } from "@/shared/components/ui/field";

export function StripePaymentSection({
  publishableKey,
  clientSecret,
  onSuccess,
  onCancel,
}: {
  publishableKey: string;
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  if (!publishableKey) {
    return (
      <p className="text-sm text-destructive">
        Stripe is not configured for checkout.
      </p>
    );
  }

  const stripePromise = getStripePromise(publishableKey);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeForm onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}

let stripePromiseCache: Promise<Stripe | null> | null = null;

function getStripePromise(publishableKey: string): Promise<Stripe | null> {
  if (!stripePromiseCache) {
    stripePromiseCache = loadStripe(publishableKey);
  }
  return stripePromiseCache;
}

function StripeForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    if (!stripe || !elements) {
      return;
    }
    setPending(true);
    setError(null);
    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Payment could not be completed.");
      return;
    }
    onSuccess();
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      <Field>
        <FieldError errors={error ? [{ message: error }] : undefined} />
      </Field>
      <div className="flex justify-start gap-3">
        <Button type="submit" onClick={handleSubmit} disabled={!stripe || pending}>
          {pending ? "Processing…" : "Pay now"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Back
        </Button>
      </div>
    </div>
  );
}
