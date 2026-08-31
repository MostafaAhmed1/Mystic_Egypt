import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { locales, defaultLocale, type Locale } from "@/core/i18n-config";

const LOCALES = locales as readonly string[];

function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale);
}

function getLocaleFromAcceptLanguage(header: string | null): Locale {
  if (!header) return defaultLocale;
  const preferred = header
    .split(",")
    .map((item) => item.split(";")[0].trim().slice(0, 2))
    .find((lang) => isValidLocale(lang));
  return preferred && isValidLocale(preferred) ? preferred : defaultLocale;
}

function getLocaleFromCookie(cookies: string | undefined): Locale | null {
  if (!cookies) return null;
  const match = cookies.match(/locale=([a-z]{2})/);
  if (match && isValidLocale(match[1])) return match[1] as Locale;
  return null;
}

// Auth page paths (without locale prefix)
const AUTH_PAGES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

function stripLocale(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length > 0 && isValidLocale(parts[0])) {
    return "/" + parts.slice(1).join("/");
  }
  return path;
}

function hasLocalePrefix(path: string): boolean {
  const firstSegment = path.split("/").filter(Boolean)[0];
  return isValidLocale(firstSegment);
}

function isAuthPage(pathWithoutLocale: string): boolean {
  return AUTH_PAGES.some((page) => pathWithoutLocale === page);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieHeader = request.headers.get("cookie") ?? undefined;

  // --- Locale detection and redirect ---
  if (!hasLocalePrefix(pathname)) {
    // Bare path like "/" or "/tours" — detect locale and redirect
    const cookieLocale = getLocaleFromCookie(cookieHeader);
    const acceptLang = request.headers.get("accept-language") ?? undefined;
    const locale = cookieLocale ?? getLocaleFromCookie(acceptLang) ?? defaultLocale;

    // Set locale cookie for future requests
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set("locale", locale, {
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
      sameSite: "lax",
    });
    return response;
  }

  // --- Extract locale from path ---
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  const locale = isValidLocale(firstSegment) ? firstSegment : defaultLocale;
  const pathWithoutLocale = stripLocale(pathname);

  // If locale segment is invalid, redirect to default
  if (!isValidLocale(firstSegment)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // --- Auth checks (using path without locale) ---
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = Boolean(token?.id);
  const isProtectedRoute =
    pathWithoutLocale.startsWith("/dashboard") || pathWithoutLocale.startsWith("/admin");
  const isAuthRoute = isAuthPage(pathWithoutLocale);

  // Redirect unauthenticated users away from protected routes.
  if (isProtectedRoute && !isLoggedIn) {
    const url = new URL(`/${locale}/login`, request.nextUrl);
    if (!pathWithoutLocale.startsWith("/login")) {
      url.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(url);
  }

  // Only admins may access /admin.
  if (pathWithoutLocale.startsWith("/admin") && token && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.nextUrl));
  }

  // Unverified users must verify their email before using protected routes.
  if (isProtectedRoute && token && !token.email_verified) {
    const url = new URL(`/${locale}/verify-email`, request.nextUrl);
    if (typeof token.email === "string") {
      url.searchParams.set("email", token.email);
    }
    return NextResponse.redirect(url);
  }

  // Send already-authenticated, verified users away from auth pages.
  if (isAuthRoute && token && token.email_verified) {
    const home = token.role === "ADMIN" ? `/${locale}/admin` : `/${locale}/dashboard`;
    return NextResponse.redirect(new URL(home, request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
