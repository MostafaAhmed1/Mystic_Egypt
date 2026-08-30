import Link from "next/link";
import { getCurrentUser } from "@/core/lib/session";
import { BrandLogo } from "@/shared/components/brand-logo";
import { MobileNav } from "@/shared/components/mobile-nav";
import { PublicHeaderClient } from "@/shared/components/public-header-client";
import { HeaderNavLinks } from "@/shared/components/header-nav-links";

export async function PublicHeader() {
  const user = await getCurrentUser();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLogo />

        <HeaderNavLinks />

        <PublicHeaderClient user={user} whatsapp={whatsapp} />

        <MobileNav user={user} whatsapp={whatsapp} />
      </div>
    </header>
  );
}
