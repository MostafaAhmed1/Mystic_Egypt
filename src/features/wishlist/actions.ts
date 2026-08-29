"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/core/lib/session";
import { toggleWishlist } from "@/features/wishlist/service";

/**
 * Toggles a tour in the current user's wishlist. Requires a logged-in session
 * (redirects to /login otherwise). Returns the resulting saved state.
 */
export async function toggleWishlistAction(
  tourId: string,
): Promise<{ ok: boolean; inWishlist: boolean; loginRequired?: boolean }> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const inWishlist = await toggleWishlist(user.id, tourId);
  return { ok: true, inWishlist };
}
