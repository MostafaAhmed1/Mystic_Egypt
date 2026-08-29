import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Optimistic authorization checks (protects routes by redirecting based on the JWT).
// Proxy only performs lightweight, cookie-based checks. Authoritative, data-source
// checks happen in the DAL (see src/core/lib/session.ts).
const AUTH_PAGES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

function isAuthPage(path: string): boolean {
  return AUTH_PAGES.some((page) => path === page);
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = Boolean(token?.id);
  const isProtectedRoute =
    path.startsWith("/dashboard") || path.startsWith("/admin");
  const isAuthRoute = isAuthPage(path);

  // Redirect unauthenticated users away from protected routes.
  if (isProtectedRoute && !isLoggedIn) {
    const url = new URL("/login", request.nextUrl);
    if (!path.startsWith("/login")) {
      url.searchParams.set("callbackUrl", path);
    }
    return NextResponse.redirect(url);
  }

  // Only admins may access /admin.
  if (path.startsWith("/admin") && token && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  // Unverified users must verify their email before using protected routes.
  if (isProtectedRoute && token && !token.email_verified) {
    const url = new URL("/verify-email", request.nextUrl);
    if (typeof token.email === "string") {
      url.searchParams.set("email", token.email);
    }
    return NextResponse.redirect(url);
  }

  // Send already-authenticated, verified users away from auth pages.
  if (isAuthRoute && token && token.email_verified) {
    const home = token.role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(home, request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
