"use client";

import type { BookableTour } from "@/features/booking/types";
import { useBookingCart, type CartAddon } from "@/features/booking/store";
import { formatCurrency } from "@/core/utils";

export function OrderSummary({
  tour,
}: {
  tour: Pick<BookableTour, "base_price" | "currency" | "title">;
}) {
  const numPeople = useBookingCart((s) => s.numPeople);
  const addons = useBookingCart((s) => s.addons);

  const tourTotal = tour.base_price * numPeople;
  const addonsTotal = addons.reduce((sum, a) => sum + a.price * a.quantity, 0);
  const grandTotal = tourTotal + addonsTotal;

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="font-heading text-base font-semibold">Order summary</h3>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">
            {tour.title} × {numPeople}
          </dt>
          <dd>{formatCurrency(tourTotal, tour.currency)}</dd>
        </div>

        {addons.map((a) => (
          <AddonRow key={a.addon_id} addon={a} currency={tour.currency} />
        ))}

        <div className="!mt-4 flex justify-between gap-4 border-t pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatCurrency(grandTotal, tour.currency)}</dd>
        </div>
      </dl>
    </div>
  );
}

function AddonRow({
  addon,
  currency,
}: {
  addon: CartAddon;
  currency: BookableTour["currency"];
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">
        {addon.name} × {addon.quantity}
      </dt>
      <dd>{formatCurrency(addon.price * addon.quantity, currency)}</dd>
    </div>
  );
}
