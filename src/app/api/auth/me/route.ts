import { NextResponse } from "next/server";
import { getCurrentUser } from "@/core/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  // DTO: only safe fields are returned by getCurrentUser (never the password hash).
  return NextResponse.json({ user });
}
