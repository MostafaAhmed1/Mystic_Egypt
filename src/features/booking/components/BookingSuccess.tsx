"use client";

import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import type { PaymentMethod } from "@/features/booking/constants";
import { PAYMENT_METHODS } from "@/features/booking/constants";

export function BookingSuccess({
  bookingId,
  paymentMethod,
}: {
  bookingId: string;
  paymentMethod: PaymentMethod;
}) {
  const isBankTransfer = paymentMethod === PAYMENT_METHODS.BANK_TRANSFER;
  const isStripe = paymentMethod === PAYMENT_METHODS.STRIPE;
  const shortId = bookingId.slice(0, 8);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center">
      {isBankTransfer ? (
        <Clock className="size-12 text-amber-600" aria-hidden />
      ) : (
        <CheckCircle2 className="size-12 text-emerald-600" aria-hidden />
      )}
      <h1 className="font-heading text-2xl font-semibold">
        {isBankTransfer ? "Booking submitted for review" : "Booking confirmed"}
      </h1>
      <p className="text-sm text-muted-foreground">
        {isBankTransfer
          ? "Thank you! Your booking and receipt have been received. Our team will review them and confirm shortly."
          : `Payment successful. Your booking #${shortId} is confirmed.`}
      </p>
      <p className="w-full rounded-xl bg-muted/40 px-4 py-3 text-sm font-medium">
        Booking reference: #{shortId}
      </p>
      {isStripe && (
        <p className="text-xs text-muted-foreground">
          A confirmation email has been sent to your inbox.
        </p>
      )}
      <Link
        href="/dashboard"
        className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Go to my dashboard
      </Link>
    </div>
  );
}
