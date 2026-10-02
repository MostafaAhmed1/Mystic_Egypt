import { NextResponse } from "next/server";
import { getAdminApiError } from "@/core/api/admin-auth";
import {
  deleteHomepageService,
  updateHomepageService,
} from "@/features/homepage/service";
import {
  HomepageValidationError,
  parseHomepageServiceInput,
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
    const service = await updateHomepageService(id, parseHomepageServiceInput(body));
    if (!service) {
      return NextResponse.json({ ok: false, error: "Service not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, service });
  } catch (error) {
    if (error instanceof HomepageValidationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Unable to update homepage service." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const authError = await getAdminApiError();
  if (authError) return authError;

  try {
    const { id } = await params;
    const deleted = await deleteHomepageService(id);
    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Service not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to delete homepage service." }, { status: 500 });
  }
}
