"use client";

import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { PaymentMethod } from "@/features/booking/constants";

export interface CreateBookingPayload {
  tour_id: string;
  tour_date: string;
  num_people: number;
  addons: { addon_id: string; quantity: number }[];
  payment_method: PaymentMethod;
  /** GA4 client id used to attribute the server-side purchase event to this
   * browsing session (carried via Stripe PaymentIntent metadata). */
  ga_client_id?: string;
  /** True when the visitor accepted cookies (Meta events are consent-gated). */
  meta_consent?: boolean;
  /** Meta browser id (`_fbp` cookie) — carried to the CAPI events. */
  fbp?: string;
  /** Meta click id (`_fbc` cookie) — carried to the CAPI events. */
  fbc?: string;
}

export interface CreateBookingResponse {
  ok: boolean;
  error?: string;
  booking?: {
    id: string;
    total_amount: number;
    status: string;
    tour_title: string;
  };
  paymentIntentClientSecret?: string | null;
}

export async function createBookingRequest(
  payload: CreateBookingPayload,
): Promise<CreateBookingResponse> {
  const res = await fetch(API_ENDPOINTS.BOOKINGS.CREATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as CreateBookingResponse;
}

export async function uploadReceiptRequest(
  bookingId: string,
  receipt: File,
): Promise<{ ok: boolean; error?: string; receiptUrl?: string }> {
  const formData = new FormData();
  formData.append("receipt", receipt);
  const res = await fetch(API_ENDPOINTS.BOOKINGS.UPLOAD_RECEIPT(bookingId), {
    method: "POST",
    body: formData,
  });
  return (await res.json()) as {
    ok: boolean;
    error?: string;
    receiptUrl?: string;
  };
}
