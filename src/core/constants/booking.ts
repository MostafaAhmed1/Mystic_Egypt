// Booking status constants (mirrors Prisma BookingStatus enum).
export const BOOKING_STATUSES = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PENDING_RECEIPT_REVIEW: "PENDING_RECEIPT_REVIEW",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];
