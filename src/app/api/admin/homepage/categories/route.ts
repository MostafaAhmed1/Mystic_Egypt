import { NextResponse } from "next/server";
import { getAdminApiError } from "@/core/api/admin-auth";
import {
  createHomepageCategory,
  listAdminHomepageCategories,
} from "@/features/homepage/service";
import {
  HomepageValidationError,
  parseHomepageCategoryInput,
} from "@/features/homepage/validation";

export async function GET() {
  const authError = await getAdminApiError();
  if (authError) return authError;

  try {
    const categories = await listAdminHomepageCategories();
    return NextResponse.json({ ok: true, categories });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to load homepage categories." }, { status: 500 });
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
    const category = await createHomepageCategory(parseHomepageCategoryInput(body));
    return NextResponse.json({ ok: true, category }, { status: 201 });
  } catch (error) {
    if (error instanceof HomepageValidationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Unable to create homepage category." }, { status: 500 });
  }
}
