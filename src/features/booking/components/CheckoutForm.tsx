"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Shield, CreditCard, Building2 } from "lucide-react";
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
import { trackEvent, readGaClientId } from "@/core/lib/analytics";
import {
  hasMetaConsent,
  readFbpCookie,
  readFbcCookie,
  sendMetaEvent,
} from "@/core/lib/meta-pixel";

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
  const [confirmTotal, setConfirmTotal] = useState<number | null>(null);

  const today = todayString();

  // Handle Stripe redirect-based payment methods (bancontact, iDEAL, Klarna, …):
  // the customer leaves the page during payment and Stripe returns them to this
  // same URL with a payment_intent_client_secret query param. Recover the
  // PaymentIntent status here and show the final state without a reload screen.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const intentSecret = params.get("payment_intent_client_secret");
    if (!intentSecret || !stripePublishableKey) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const stripe = await loadStripe(stripePublishableKey);
        if (!stripe || cancelled) return;
        const { paymentIntent } = await stripe.retrievePaymentIntent(intentSecret);
        if (cancelled) return;
        if (paymentIntent?.status === "succeeded" && params.get("booking_id")) {
          setBookingId(params.get("booking_id") as string);
          setStep("success");
        } else if (paymentIntent?.status === "requires_action") {
          void stripe.handleNextAction({ clientSecret: intentSecret });
        } else {
          setError(
            "Payment was not completed. Please try again or choose bank transfer.",
          );
          setStep("form");
        }
      } catch {
        setError("We could not verify your payment. Please try again.");
        setStep("form");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stripePublishableKey]);

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

    // Meta: consent + browser/click ids are carried into the Stripe PaymentIntent
    // metadata so the server-side Purchase event stays consent-gated and can be
    // attributed to this visitor. InitiateCheckout itself fires earlier, on the
    // tour page "Book Now" / "View tour" CTA clicks (see TourContent/TourCard).
    const metaConsented = hasMetaConsent();
    const fbp = metaConsented ? readFbpCookie() : "";
    const fbc = metaConsented ? readFbcCookie() : "";

    const result = await createBookingRequest({
      tour_id: tour.id,
      tour_date: tourDate,
      num_people: numPeople,
      addons: cartAddons.map((a) => ({
        addon_id: a.addon_id,
        quantity: a.quantity,
      })),
      payment_method: paymentMethod,
      ga_client_id: readGaClientId() ?? undefined,
      ...(metaConsented
        ? {
            meta_consent: true,
            fbp: fbp || undefined,
            fbc: fbc || undefined,
          }
        : {}),
    });

    if (!result.ok || !result.booking) {
      setPending(false);
      setError(result.error ?? "Something went wrong creating your booking.");
      return;
    }

    setBookingId(result.booking.id);
    setConfirmTotal(result.booking.total_amount);

    if (paymentMethod === PAYMENT_METHODS.STRIPE) {
      if (result.paymentIntentClientSecret) {
        setClientSecret(result.paymentIntentClientSecret);
        setStep("stripe");
        trackEvent("begin_checkout", {
          item_id: tour.id,
          item_name: tour.title,
          currency: tour.currency,
          value: result.booking.total_amount,
        });
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
      <div className="rounded-2xl border border-gold/10 bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)]">
        <h2 className="font-heading text-lg font-bold tracking-wider text-obsidian">Pay securely with Stripe</h2>
        <p className="mt-1 text-sm text-obsidian/50">
          Your card details never touch our servers — they are handled securely
          by Stripe.
        </p>
        <div className="mt-5">
          <StripePaymentSection
            publishableKey={stripePublishableKey}
            clientSecret={clientSecret}
            returnUrl={`${window.location.origin}${window.location.pathname}?booking_id=${bookingId}`}
            onSuccess={() => {
              // Browser Purchase (no-op unless consented). The event_id equals
              // the booking id — the same one the server CAPI webhook sends,
              // so Meta counts the purchase once.
              if (bookingId && confirmTotal !== null) {
                sendMetaEvent(
                  "Purchase",
                  {
                    content_type: "product",
                    content_ids: [tour.id, ...cartAddons.map((a) => a.addon_id)],
                    content_name: tour.title,
                    currency: tour.currency,
                    value: confirmTotal,
                    num_items: numPeople,
                  },
                  { eventId: bookingId },
                );
              }
              setStep("success");
            }}
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
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="font-heading mb-4 text-lg font-bold tracking-wider text-obsidian">
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
          </motion.section>

          <Separator className="bg-gold/10" />

          {/* Add-ons */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h2 className="font-heading mb-4 text-lg font-bold tracking-wider text-obsidian">
              Add-ons (optional)
            </h2>
            <AddOnsSection addons={addons} />
          </motion.section>

          <Separator className="bg-gold/10" />

          {/* Payment method */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="font-heading mb-1 text-lg font-bold tracking-wider text-obsidian">
              Payment method
            </h2>
            <p className="mb-4 text-sm text-obsidian/50">
              Choose how you would like to pay for your booking.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <PaymentOption
                selected={paymentMethod === PAYMENT_METHODS.STRIPE}
                onSelect={() => setPaymentMethod(PAYMENT_METHODS.STRIPE)}
                title="Pay by card (Stripe)"
                description="Secure PCI-DSS compliant card payment via Stripe Elements."
                icon={<CreditCard className="size-5" />}
              />
              <PaymentOption
                selected={paymentMethod === PAYMENT_METHODS.BANK_TRANSFER}
                onSelect={() => setPaymentMethod(PAYMENT_METHODS.BANK_TRANSFER)}
                title="Bank transfer"
                description="Pay directly by bank transfer and upload your receipt for review."
                icon={<Building2 className="size-5" />}
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
          </motion.section>

          {/* Terms */}
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 size-4 rounded border-sand/60 accent-gold"
            />
            <span className="text-obsidian/50">
              I agree to the{" "}
              <a href={href("/terms")} target="_blank" className="font-medium text-gold underline underline-offset-4 hover:text-gold-light">
                terms &amp; conditions
              </a>{" "}
              and{" "}
              <a href={href("/terms")} target="_blank" className="font-medium text-gold underline underline-offset-4 hover:text-gold-light">
                cancellation policy
              </a>
              .
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-lg bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full bg-gold text-obsidian font-semibold shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:bg-gold-light hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] transition-all duration-300"
            disabled={pending}
          >
            <Shield className="mr-2 size-4" aria-hidden />
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
  icon,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rounded-xl border p-4 text-start transition-all duration-200 ${
        selected
          ? "border-gold bg-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.15)]"
          : "border-sand/40 bg-white hover:border-gold/30 hover:bg-gold/[0.02]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={`flex size-5 items-center justify-center rounded-full border-2 transition-colors ${
            selected ? "border-gold bg-gold" : "border-sand/40"
          }`}
        >
          {selected && <span className="size-2 rounded-full bg-obsidian" />}
        </span>
        <span className={`transition-colors ${selected ? "text-gold" : "text-obsidian/40"}`}>
          {icon}
        </span>
        <span className="text-sm font-medium text-obsidian">{title}</span>
      </div>
      <p className="mt-2 text-xs text-obsidian/40">{description}</p>
    </button>
  );
}

function todayString(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}
