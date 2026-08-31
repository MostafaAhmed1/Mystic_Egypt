import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/core/lib/auth";
import { prisma } from "@/core/lib/prisma";
import { getLocaleFromCookieString } from "@/core/utils/locale";
import { defaultLocale } from "@/core/i18n-config";

/**
 * Data Access Layer for authentication.
 * All secure, data-source-adjacent auth checks should live here.
 */

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "ADMIN";
  email_verified: boolean;
  is_2fa_verified: boolean;
  requires_2fa?: boolean;
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      email_verified: true,
      is_2fa_verified: true,
    },
  });

  if (!user) return null;

  return {
    ...user,
    requires_2fa: session.user.requires_2fa,
  };
});

/** Redirect to the login page when there is no authenticated session. */
export async function requireUser(): Promise<CurrentUser> {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieString(cookieStore.get("locale")?.value) ?? defaultLocale;
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }
  if (!user.email_verified) {
    redirect(`/${locale}/verify-email?email=${encodeURIComponent(user.email)}`);
  }
  if (user.requires_2fa) {
    redirect(`/${locale}/verify-2fa`);
  }
  return user;
}

/** Redirect when the user is not an admin. */
export async function requireAdmin(): Promise<CurrentUser> {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieString(cookieStore.get("locale")?.value) ?? defaultLocale;
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect(`/${locale}/login`);
  }
  return user;
}
