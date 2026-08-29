"use client";

import type { AddonDto } from "@/features/booking/types";
import { useBookingCart } from "@/features/booking/store";
import { formatCurrency } from "@/core/utils";
import { Button } from "@/shared/components/ui/button";
import { Minus, Plus } from "lucide-react";

export function AddOnsSection({ addons }: { addons: AddonDto[] }) {
  const cartAddons = useBookingCart((s) => s.addons);
  const addAddon = useBookingCart((s) => s.addAddon);
  const setAddonQuantity = useBookingCart((s) => s.setAddonQuantity);

  if (addons.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No add-ons are currently available for this tour.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {addons.map((addon) => {
        const inCart = cartAddons.find((a) => a.addon_id === addon.id);
        return (
          <div
            key={addon.id}
            className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4"
          >
            <div>
              <p className="text-sm font-medium">{addon.name}</p>
              {addon.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {addon.description}
                </p>
              )}
              <p className="mt-1 text-sm font-semibold">
                {formatCurrency(addon.price, addon.currency)}
              </p>
            </div>
            {inCart ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Decrease ${addon.name}`}
                  onClick={() => setAddonQuantity(addon.id, inCart.quantity - 1)}
                >
                  <Minus />
                </Button>
                <span className="w-8 text-center text-sm font-medium">
                  {inCart.quantity}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Increase ${addon.name}`}
                  onClick={() => setAddonQuantity(addon.id, inCart.quantity + 1)}
                >
                  <Plus />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  addAddon({
                    addon_id: addon.id,
                    name: addon.name,
                    price: addon.price,
                  })
                }
              >
                <Plus />
                Add
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
