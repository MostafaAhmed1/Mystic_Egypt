import { NextResponse } from "next/server";
import { getAdminApiError } from "@/core/api/admin-auth";
import {
  createHomepageOffer,
  listAdminHomepageOffers,
} from "@/features/homepage/service";
import {
  HomepageValidationError,
  parseHomepageOfferInput,
} from "@/features/homepage/validation";

export async function GET() {
  const authError = await getAdminApiError();
  if (authError) return authError;

  try {
    const offers = await listAdminHomepageOffers();
    return NextResponse.json({ ok: true, offers });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to load homepage offers." }, { status: 500 });
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
    const offer = await createHomepageOffer(parseHomepageOfferInput(body));
    return NextResponse.json({ ok: true, offer }, { status: 201 });
  } catch (error) {
    if (error instanceof HomepageValidationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Unable to create homepage offer." }, { status: 500 });
  }
}
