import { NextResponse } from "next/server";
import { requireAdmin } from "@/core/lib/session";
import { listBookings } from "@/features/admin/service";

export async function GET(request: Request) {
  const user = await requireAdmin();
  if (user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? undefined;
  const payment_method = url.searchParams.get("payment_method") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);

  const result = await listBookings({ status, payment_method, search, page, limit });
  return NextResponse.json({ ok: true, ...result });
}
