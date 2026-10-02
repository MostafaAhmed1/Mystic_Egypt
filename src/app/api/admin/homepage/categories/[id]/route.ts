import { NextResponse } from "next/server";
import { getAdminApiError } from "@/core/api/admin-auth";
import {
  deleteHomepageCategory,
  updateHomepageCategory,
} from "@/features/homepage/service";
import {
  HomepageValidationError,
  parseHomepageCategoryInput,
} from "@/features/homepage/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  const authError = await getAdminApiError();
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  try {
    const { id } = await params;
    const category = await updateHomepageCategory(id, parseHomepageCategoryInput(body));
    if (!category) {
      return NextResponse.json({ ok: false, error: "Category not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, category });
  } catch (error) {
    if (error instanceof HomepageValidationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Unable to update homepage category." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const authError = await getAdminApiError();
  if (authError) return authError;

  try {
    const { id } = await params;
    const deleted = await deleteHomepageCategory(id);
    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Category not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to delete homepage category." }, { status: 500 });
  }
}
