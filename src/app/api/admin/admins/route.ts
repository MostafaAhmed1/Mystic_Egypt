import { NextResponse } from "next/server";
import { requireAdmin } from "@/core/lib/session";
import { listAdmins, createAdmin } from "@/features/admin/service";

export async function GET() {
  const user = await requireAdmin();
  if (user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const admins = await listAdmins();
  return NextResponse.json({ ok: true, admins });
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
  const name = typeof b.name === "string" ? b.name : "";
  const email = typeof b.email === "string" ? b.email : "";
  const password = typeof b.password === "string" ? b.password : "";

  if (!name || !email || !password) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
  }

  try {
    const admin = await createAdmin({ name, email, password });
    return NextResponse.json({ ok: true, admin }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
