import { NextResponse } from "next/server";
import { getAdminApiError } from "@/core/api/admin-auth";
import { promoteCustomerToAdmin } from "@/features/admin/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const authError = await getAdminApiError();
  if (authError) return authError;

  try {
    const { id } = await params;
    const result = await promoteCustomerToAdmin(id);

    if (result === "not_found") {
      return NextResponse.json({ ok: false, error: "Customer not found." }, { status: 404 });
    }
    if (result === "forbidden") {
      return NextResponse.json({ ok: false, error: "This account is already an administrator." }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to promote this account." }, { status: 500 });
  }
}
