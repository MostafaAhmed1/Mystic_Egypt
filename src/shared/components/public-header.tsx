import Link from "next/link";
import { getCurrentUser } from "@/core/lib/session";
import { BrandLogo } from "@/shared/components/brand-logo";
import { MobileNav } from "@/shared/components/mobile-nav";
import { PublicHeaderClient } from "@/shared/components/public-header-client";
import { HeaderNavLinks } from "@/shared/components/header-nav-links";
import { getLocaleFromCookieString } from "@/core/utils/locale";
import { defaultLocale } from "@/core/i18n-config";
import { cookies } from "next/headers";

export async function PublicHeader() {
  const user = await getCurrentUser();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieString(cookieStore.get("locale")?.value) ?? defaultLocale;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLogo href={`/${locale}`} />

        <HeaderNavLinks />

        <PublicHeaderClient user={user} whatsapp={whatsapp} />

        <MobileNav user={user} whatsapp={whatsapp} />
      </div>
    </header>
  );
}
