"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/core/lib/session";
import { toggleWishlist } from "@/features/wishlist/service";
import { getLocaleFromCookieString } from "@/core/utils/locale";
import { defaultLocale } from "@/core/i18n-config";

/**
 * Toggles a tour in the current user's wishlist. Requires a logged-in session
 * (redirects to /login otherwise). Returns the resulting saved state.
 */
export async function toggleWishlistAction(
  tourId: string,
): Promise<{ ok: boolean; inWishlist: boolean; loginRequired?: boolean }> {
  const user = await getCurrentUser();
  if (!user) {
    const cookieStore = await cookies();
    const locale = getLocaleFromCookieString(cookieStore.get("locale")?.value) ?? defaultLocale;
    redirect(`/${locale}/login`);
  }

  const inWishlist = await toggleWishlist(user.id, tourId);
  return { ok: true, inWishlist };
}
