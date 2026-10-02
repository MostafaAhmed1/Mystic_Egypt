import { NextResponse } from "next/server";
import { getCurrentUser } from "@/core/lib/session";

export async function getAdminApiError(): Promise<NextResponse | null> {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  if (user.role !== "ADMIN" || user.requires_2fa) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  return null;
}
