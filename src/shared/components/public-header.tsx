"use client";

import { useSession } from "next-auth/react";
import { BrandLogo } from "@/shared/components/brand-logo";
import { MobileNav } from "@/shared/components/mobile-nav";
import { UtilityBar } from "@/shared/components/utility-bar";
import { HeaderNavLinks } from "@/shared/components/header-nav-links";
import { LanguageSwitcher } from "@/shared/components/language-switcher";
import { GlassmorphicHeader } from "@/shared/components/glassmorphic-header";
import { useLocale } from "@/shared/hooks/use-locale";
import { BUSINESS } from "@/core/constants/business";

export function PublicHeader() {
  const { data: session } = useSession();
  const { locale } = useLocale();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const phoneUK = process.env.NEXT_PUBLIC_PHONE_UK ?? BUSINESS.phoneUK.display;
  const phoneEG = process.env.NEXT_PUBLIC_PHONE_EG ?? BUSINESS.phoneEG.display;

  const user = session?.user
    ? { name: session.user.name ?? "", role: session.user.role }
    : null;

  return (
    <div className="sticky top-0 z-40">
      {/* Utility Bar - Desktop only */}
      <UtilityBar user={user} whatsapp={whatsapp} phoneUK={phoneUK} phoneEG={phoneEG} />

      {/* Main Header */}
      <GlassmorphicHeader>
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandLogo href={`/${locale}`} />

          <div className="hidden items-center md:flex">
            <HeaderNavLinks />
            <LanguageSwitcher variant="light" />
          </div>

          {/* Language + Mobile Menu */}
          <div className="flex items-center gap-4">
            <span className="md:hidden">
              <LanguageSwitcher variant="light" />
            </span>
            <MobileNav user={user} whatsapp={whatsapp} phoneUK={phoneUK} phoneEG={phoneEG} />
          </div>
        </div>
      </GlassmorphicHeader>
    </div>
  );
}