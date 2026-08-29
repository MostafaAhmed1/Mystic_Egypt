import { NextResponse } from "next/server";
import { requireAdmin } from "@/core/lib/session";
import { getTourById, updateTour, deleteTour } from "@/features/admin/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireAdmin();
  if (user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const tour = await getTourById(id);
  if (!tour) {
    return NextResponse.json({ ok: false, error: "Tour not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, tour });
}

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

  const b = body as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  if (typeof b.title === "string") data.title = b.title;
  if (typeof b.slug === "string") data.slug = b.slug;
  if (typeof b.description === "string") data.description = b.description;
  if (b.inclusions !== undefined) data.inclusions = typeof b.inclusions === "string" ? b.inclusions : null;
  if (b.exclusions !== undefined) data.exclusions = typeof b.exclusions === "string" ? b.exclusions : null;
  if (typeof b.base_price === "number") data.base_price = b.base_price;
  if (typeof b.currency === "string") data.currency = b.currency;
  if (typeof b.status === "string") data.status = b.status;

  const tour = await updateTour(id, {
    ...data,
    itinerary: Array.isArray(b.itinerary)
      ? (b.itinerary as { day_number: number; title: string; description: string }[])
      : undefined,
    images: Array.isArray(b.images)
      ? (b.images as { image_url: string; is_primary: boolean }[])
      : undefined,
    route: Array.isArray(b.route)
      ? (b.route as { order: number; label: string; lat: number; lng: number; is_stop: boolean }[])
      : undefined,
  } as Parameters<typeof updateTour>[1]);

  return NextResponse.json({ ok: true, tour });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireAdmin();
  if (user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  await deleteTour(id);
  return NextResponse.json({ ok: true });
}
