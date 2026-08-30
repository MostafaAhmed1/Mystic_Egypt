import { requireUser } from "@/core/lib/session";
import { listUserWishlist } from "@/features/wishlist/service";
import { DashboardWishlistClient } from "@/app/(dashboard)/dashboard/wishlist/dashboard-wishlist-client";

export const metadata = {
  title: "Favourites",
};

export default async function WishlistPage() {
  const user = await requireUser();
  const tours = await listUserWishlist(user.id);

  return <DashboardWishlistClient tours={tours} />;
}
