import { NextResponse } from "next/server";
import { getAdminApiError } from "@/core/api/admin-auth";
import {
  AddonValidationError,
  createAddon,
  listAdminAddons,
  parseAddonInput,
} from "@/features/admin/service";

export async function GET() {
  const authError = await getAdminApiError();
  if (authError) return authError;

  try {
    const addons = await listAdminAddons();
    return NextResponse.json({ ok: true, addons });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to load add-ons." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await getAdminApiError();
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  try {
    const addon = await createAddon(parseAddonInput(body));
    return NextResponse.json({ ok: true, addon }, { status: 201 });
  } catch (error) {
    if (error instanceof AddonValidationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Unable to create add-on." }, { status: 500 });
  }
}
