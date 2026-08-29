import { NextResponse } from "next/server";
import { getCurrentUser } from "@/core/lib/session";
import { getWishlistTourIds } from "@/features/wishlist/service";

// GET /api/wishlist — returns the saved tour ids for the current user.
// Used by the client-side wishlist toggle on statically-generated tour pages
// (SSG pages cannot read per-user session state at build time).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }
  const ids = await getWishlistTourIds(user.id);
  return NextResponse.json({ ok: true, ids });
}
