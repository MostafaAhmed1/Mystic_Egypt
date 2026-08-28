// Pure cancellation policy function implementing the PRD §8 tiered rules:
//   - >= 30 days before tour: 95% refund (5% administrative fee)
//   - 29 to 15 days before tour:  50% refund
//   - < 15 days before tour:       0% refund
// Exception: any non-refundable third-party costs (e.g. internal flight tickets)
// are deducted in full first, regardless of when the cancellation occurs.

export interface CancellationResult {
  /** Number of full days between the cancellation moment and the tour date. */
  daysBefore: number;
  /** Refund ratio (0..1) applied to the refundable portion. */
  refundRatio: number;
  /** Amount (in the booking currency) that is refundable. */
  refundableAmount: number;
  /** Amount (in the booking currency) that is non-refundable and always deducted. */
  nonRefundableAmount: number;
  /** Final amount (in the booking currency) to return to the customer. */
  refundAmount: number;
}

export const CANCELLATION_TIERS = [
  { minDays: 30, refundRatio: 0.95 },
  { minDays: 15, refundRatio: 0.5 },
  { minDays: 0, refundRatio: 0 },
] as const;

export function getCancellationRefundRatio(daysBefore: number): number {
  if (daysBefore >= 30) {
    return 0.95;
  }
  if (daysBefore >= 15) {
    return 0.5;
  }
  return 0;
}

/**
 * Computes the refund for a cancelled booking.
 *
 * @param totalAmount  - Total paid amount in the booking currency.
 * @param tourDate     - The tour date (Date).
 * @param cancelledAt  - The moment of cancellation (Date). Defaults to now.
 * @param nonRefundableAmount - Third-party non-refundable costs to deduct in full.
 */
export function calculateCancellationRefund(
  totalAmount: number,
  tourDate: Date,
  cancelledAt: Date = new Date(),
  nonRefundableAmount = 0
): CancellationResult {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = tourDate.getTime() - cancelledAt.getTime();
  const daysBefore = Math.ceil(diffMs / msPerDay);

  const refundRatio = getCancellationRefundRatio(daysBefore);

  // Non-refundable third-party costs are always deducted in full.
  const nonRefundable = Math.min(nonRefundableAmount, totalAmount);

  // The refundable portion is whatever is left after the non-refundable costs.
  const refundable = Math.max(totalAmount - nonRefundable, 0);

  const refundAmount = Math.min(
    Math.round(refundable * refundRatio * 100) / 100,
    totalAmount
  );

  return {
    daysBefore,
    refundRatio,
    refundableAmount: refundable,
    nonRefundableAmount: nonRefundable,
    refundAmount,
  };
}
