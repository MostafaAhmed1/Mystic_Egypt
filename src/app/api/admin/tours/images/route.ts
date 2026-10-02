import { NextResponse } from "next/server";
import { requireAdmin } from "@/core/lib/session";
import { saveTourImageFile } from "@/features/admin/tour-image-upload";
import { removeTourImage } from "@/features/admin/service";

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No image file provided." }, { status: 400 });
  }

  const saved = await saveTourImageFile(file);
  if (!saved.url) {
    return NextResponse.json({ ok: false, error: saved.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, url: saved.url });
}

export async function DELETE(request: Request) {
  const user = await requireAdmin();
  if (user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const url = (body as Record<string, unknown>).url;
  if (typeof url !== "string" || !url) {
    return NextResponse.json({ ok: false, error: "Missing image address." }, { status: 400 });
  }
  const tourId = (body as Record<string, unknown>).tourId;
  if (tourId !== undefined && typeof tourId !== "string") {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  await removeTourImage(url, tourId);
  return NextResponse.json({ ok: true });
}
