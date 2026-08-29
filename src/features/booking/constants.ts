// Booking constants (checkout payment methods and limits).

export const PAYMENT_METHODS = {
  STRIPE: "stripe",
  BANK_TRANSFER: "bank_transfer",
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

// Bookings cannot be made for dates in the past.
export const MIN_BOOKING_DATE_OFFSET_DAYS = 0;
