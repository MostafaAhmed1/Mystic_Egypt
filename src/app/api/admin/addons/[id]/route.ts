import { NextResponse } from "next/server";
import { getAdminApiError } from "@/core/api/admin-auth";
import {
  AddonInUseError,
  AddonValidationError,
  deleteAddon,
  parseAddonInput,
  updateAddon,
} from "@/features/admin/service";

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
    const addon = await updateAddon(id, parseAddonInput(body));
    if (!addon) {
      return NextResponse.json({ ok: false, error: "Add-on not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, addon });
  } catch (error) {
    if (error instanceof AddonValidationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Unable to update add-on." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const authError = await getAdminApiError();
  if (authError) return authError;

  try {
    const { id } = await params;
    const deleted = await deleteAddon(id);
    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Add-on not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AddonInUseError) {
      return NextResponse.json(
        {
          ok: false,
          error: `This add-on is used by ${error.bookingCount} booking(s) and cannot be deleted. Edit it instead.`,
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: false, error: "Unable to delete add-on." }, { status: 500 });
  }
}
