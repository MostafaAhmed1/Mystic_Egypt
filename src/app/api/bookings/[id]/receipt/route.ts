import { NextResponse } from "next/server";
import { getCurrentUser } from "@/core/lib/session";
import { saveReceiptFile } from "@/core/lib/receipt-upload";
import { markBookingReceiptSubmitted } from "@/features/booking/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get("receipt");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No receipt file provided." }, { status: 400 });
  }

  const saved = await saveReceiptFile(file);
  if (!saved.url) {
    return NextResponse.json({ ok: false, error: saved.error }, { status: 400 });
  }

  const result = await markBookingReceiptSubmitted(id, user.id, saved.url);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, receiptUrl: saved.url });
}
