import { NextResponse } from "next/server";
import { getCmsPageBySlug } from "@/features/admin/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const page = await getCmsPageBySlug(slug);
  if (!page) {
    return NextResponse.json({ ok: false, error: "Page not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, page });
}
