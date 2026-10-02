import { NextResponse } from "next/server";
import { getAdminApiError } from "@/core/api/admin-auth";
import {
  createHomepageService,
  listAdminHomepageServices,
} from "@/features/homepage/service";
import {
  HomepageValidationError,
  parseHomepageServiceInput,
} from "@/features/homepage/validation";

export async function GET() {
  const authError = await getAdminApiError();
  if (authError) return authError;

  try {
    const services = await listAdminHomepageServices();
    return NextResponse.json({ ok: true, services });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to load homepage services." }, { status: 500 });
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
    const service = await createHomepageService(parseHomepageServiceInput(body));
    return NextResponse.json({ ok: true, service }, { status: 201 });
  } catch (error) {
    if (error instanceof HomepageValidationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Unable to create homepage service." }, { status: 500 });
  }
}
