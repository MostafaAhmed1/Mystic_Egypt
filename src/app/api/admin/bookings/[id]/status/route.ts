import { NextResponse } from "next/server";
import { requireAdmin } from "@/core/lib/session";
import { updateBookingStatus } from "@/features/admin/service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireAdmin();
  if (user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const status = typeof (body as Record<string, unknown>).status === "string"
    ? (body as Record<string, string>).status
    : "";

  if (!status) {
    return NextResponse.json({ ok: false, error: "Missing status field." }, { status: 400 });
  }

  try {
    await updateBookingStatus(id, status);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
