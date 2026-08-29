import "server-only";
import { prisma } from "@/core/lib/prisma";
import type { Currency } from "@/core/constants/currencies";

// Wishlist (favorites) business logic backed by the implicit
// User.wishlist <-> Tour.wishlist_users many-to-many relation (PRD §4.3).

export interface WishlistTourDto {
  id: string;
  title: string;
  slug: string;
  base_price: number;
  currency: Currency;
  image: string | null;
}

/** Tours saved by a user (dashboard wishlist tab). */
export async function listUserWishlist(
  userId: string,
): Promise<WishlistTourDto[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      wishlist: {
        orderBy: { created_at: "desc" },
        include: { images: { select: { image_url: true } } },
      },
    },
  });
  if (!user) {
    return [];
  }
  return user.wishlist.map((tour) => ({
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    base_price: tour.base_price,
    currency: normalizeCurrency(tour.currency),
    image: tour.images[0]?.image_url ?? null,
  }));
}

/** Ids of tours the user has saved — used to render toggle state on tour pages. */
export async function getWishlistTourIds(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { wishlist: { select: { id: true } } },
  });
  return user?.wishlist.map((t) => t.id) ?? [];
}

/**
 * Adds or removes a tour from the user's wishlist. Returns the new state.
 * Throws if the tour does not exist.
 */
export async function toggleWishlist(
  userId: string,
  tourId: string,
): Promise<boolean> {
  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) {
    throw new Error("Tour not found.");
  }
  const saved = await getWishlistTourIds(userId);
  const isSaved = saved.includes(tourId);
  await prisma.user.update({
    where: { id: userId },
    data: {
      wishlist: isSaved
        ? { disconnect: { id: tourId } }
        : { connect: { id: tourId } },
    },
  });
  return !isSaved;
}

function normalizeCurrency(value: string): Currency {
  if (value === "USD" || value === "GBP" || value === "EUR") {
    return value;
  }
  return "USD";
}
