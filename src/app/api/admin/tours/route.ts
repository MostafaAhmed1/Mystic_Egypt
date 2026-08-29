import { NextResponse } from "next/server";
import { requireAdmin } from "@/core/lib/session";
import { listTours, createTour } from "@/features/admin/service";

export async function GET(request: Request) {
  const user = await requireAdmin();
  if (user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);

  const result = await listTours({ search, status, page, limit });
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
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

  const b = body as Record<string, unknown>;
  const title = typeof b.title === "string" ? b.title : "";
  const slug = typeof b.slug === "string" ? b.slug : "";
  const description = typeof b.description === "string" ? b.description : "";
  const base_price = typeof b.base_price === "number" ? b.base_price : 0;

  if (!title || !slug || !description || base_price <= 0) {
    return NextResponse.json({ ok: false, error: "Missing or invalid required fields." }, { status: 400 });
  }

  const tour = await createTour(
    {
      title,
      slug,
      description,
      inclusions: typeof b.inclusions === "string" ? b.inclusions : undefined,
      exclusions: typeof b.exclusions === "string" ? b.exclusions : undefined,
      base_price,
      currency: typeof b.currency === "string" ? (b.currency as "USD" | "GBP" | "EUR") : undefined,
      status: typeof b.status === "string" ? b.status : undefined,
      itinerary: Array.isArray(b.itinerary)
        ? (b.itinerary as { day_number: number; title: string; description: string }[])
        : [],
      images: Array.isArray(b.images)
        ? (b.images as { image_url: string; is_primary: boolean }[])
        : [],
      route: Array.isArray(b.route)
        ? (b.route as { order: number; label: string; lat: number; lng: number; is_stop: boolean }[])
        : [],
    },
    user.id,
  );

  return NextResponse.json({ ok: true, tour }, { status: 201 });
}
