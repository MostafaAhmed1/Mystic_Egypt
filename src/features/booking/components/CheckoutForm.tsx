"use client";

import { useState } from "react";
import { Field } from "@/shared/components/ui/field";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { useBookingCart } from "@/features/booking/store";
import { PAYMENT_METHODS, type PaymentMethod } from "@/features/booking/constants";
import type { AddonDto, BookableTour } from "@/features/booking/types";
import { OrderSummary } from "./OrderSummary";
import { AddOnsSection } from "./AddOnsSection";
import { ReceiptUpload, type ReceiptFileState } from "./ReceiptUpload";
import { StripePaymentSection } from "./StripePaymentSection";
import { useLocale } from "@/shared/hooks/use-locale";
import { BookingSuccess } from "./BookingSuccess";
import { createBookingRequest, uploadReceiptRequest } from "@/features/booking/api";

type Step = "form" | "stripe" | "success";

export function CheckoutForm({
  tour,
  addons,
  stripePublishableKey,
}: {
  tour: BookableTour;
  addons: AddonDto[];
  stripePublishableKey: string;
}) {
  const { href } = useLocale();
  const tourDate = useBookingCart((s) => s.tourDate);
  const numPeople = useBookingCart((s) => s.numPeople);
  const cartAddons = useBookingCart((s) => s.addons);
  const setTourDate = useBookingCart((s) => s.setTourDate);
  const setNumPeople = useBookingCart((s) => s.setNumPeople);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PAYMENT_METHODS.STRIPE,
  );
  const [step, setStep] = useState<Step>("form");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptFileState>({
    file: null,
    error: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const today = todayString();

  async function handleSubmit() {
    setError(null);

    if (!tourDate) {
      setError("Please choose a tour date.");
      return;
    }
    if (tourDate < today) {
      setError("The tour date cannot be in the past.");
      return;
    }
    if (!Number.isInteger(numPeople) || numPeople < 1) {
      setError("Please enter a valid number of people.");
      return;
    }
    if (!agreeTerms) {
      setError("Please accept the terms and cancellation policy to continue.");
      return;
    }
    if (
      paymentMethod === PAYMENT_METHODS.BANK_TRANSFER &&
      !receipt.file
    ) {
      setError(receipt.error ?? "Please upload your bank transfer receipt.");
      return;
    }

    setPending(true);

    const result = await createBookingRequest({
      tour_id: tour.id,
      tour_date: tourDate,
      num_people: numPeople,
      addons: cartAddons.map((a) => ({
        addon_id: a.addon_id,
        quantity: a.quantity,
      })),
      payment_method: paymentMethod,
    });

    if (!result.ok || !result.booking) {
      setPending(false);
      setError(result.error ?? "Something went wrong creating your booking.");
      return;
    }

    setBookingId(result.booking.id);

    if (paymentMethod === PAYMENT_METHODS.STRIPE) {
      if (result.paymentIntentClientSecret) {
        setClientSecret(result.paymentIntentClientSecret);
        setStep("stripe");
      } else {
        setError(
          "Stripe could not be reached. Please try again or choose bank transfer.",
        );
      }
      setPending(false);
      return;
    }

    // Bank transfer: mandatory receipt upload → pending review.
    if (receipt.file) {
      const upload = await uploadReceiptRequest(result.booking.id, receipt.file);
      if (!upload.ok) {
        setPending(false);
        setError(upload.error ?? "Receipt could not be uploaded. Please try again.");
        return;
      }
    }

    setPending(false);
    setStep("success");
  }

  if (step === "success" && bookingId) {
    return (
      <BookingSuccess bookingId={bookingId} paymentMethod={paymentMethod} />
    );
  }

  if (step === "stripe" && clientSecret && bookingId) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold">Pay securely with Stripe</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your card details never touch our servers — they are handled securely
          by Stripe.
        </p>
        <div className="mt-5">
          <StripePaymentSection
            publishableKey={stripePublishableKey}
            clientSecret={clientSecret}
            onSuccess={() => setStep("success")}
            onCancel={() => {
              setStep("form");
              setClientSecret(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      noValidate
    >
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          {/* Date & travellers */}
          <section>
            <h2 className="font-heading mb-4 text-lg font-semibold">
              Travel details
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <Label htmlFor="tour-date">Tour date</Label>
                <Input
                  id="tour-date"
                  type="date"
                  min={today}
                  value={tourDate}
                  onChange={(e) => setTourDate(e.target.value)}
                />
              </Field>
              <Field>
                <Label htmlFor="num-people">Number of people</Label>
                <Input
                  id="num-people"
                  type="number"
                  min={1}
                  value={numPeople}
                  onChange={(e) => setNumPeople(Number(e.target.value))}
                />
              </Field>
            </div>
          </section>

          <Separator />

          {/* Add-ons */}
          <section>
            <h2 className="font-heading mb-4 text-lg font-semibold">
              Add-ons (optional)
            </h2>
            <AddOnsSection addons={addons} />
          </section>

          <Separator />

          {/* Payment method */}
          <section>
            <h2 className="font-heading mb-1 text-lg font-semibold">
              Payment method
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Choose how you would like to pay for your booking.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <PaymentOption
                selected={paymentMethod === PAYMENT_METHODS.STRIPE}
                onSelect={() => setPaymentMethod(PAYMENT_METHODS.STRIPE)}
                title="Pay by card (Stripe)"
                description="Secure PCI-DSS compliant card payment via Stripe Elements."
              />
              <PaymentOption
                selected={paymentMethod === PAYMENT_METHODS.BANK_TRANSFER}
                onSelect={() => setPaymentMethod(PAYMENT_METHODS.BANK_TRANSFER)}
                title="Bank transfer"
                description="Pay directly by bank transfer and upload your receipt for review."
              />
            </div>

            {paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && (
              <div className="mt-4">
                <Label htmlFor="receipt">Transfer receipt (required)</Label>
                <div className="mt-2">
                  <ReceiptUpload value={receipt} onChange={setReceipt} />
                </div>
              </div>
            )}
          </section>

          {/* Terms */}
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 size-4 rounded border-input accent-primary"
            />
            <span className="text-muted-foreground">
              I agree to the{" "}
              <a href={href("/terms")} target="_blank" className="underline underline-offset-4">
                terms &amp; conditions
              </a>{" "}
              and{" "}
              <a href={href("/terms")} target="_blank" className="underline underline-offset-4">
                cancellation policy
              </a>
              .
            </span>
          </label>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending
              ? "Processing…"
              : paymentMethod === PAYMENT_METHODS.BANK_TRANSFER
                ? "Submit booking"
                : "Continue to payment"}
          </Button>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary tour={tour} />
        </div>
      </div>
    </form>
  );
}

function PaymentOption({
  selected,
  onSelect,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rounded-xl border p-4 text-left transition-colors ${
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-input bg-card hover:bg-muted/40"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={`flex size-4 items-center justify-center rounded-full border ${
            selected ? "border-primary" : "border-muted-foreground/40"
          }`}
        >
          {selected && <span className="size-2 rounded-full bg-primary" />}
        </span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
    </button>
  );
}

function todayString(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}
