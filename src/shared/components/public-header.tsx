import Link from "next/link";
import { Menu, X, Phone, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/core/lib/session";
import { BrandLogo } from "@/shared/components/brand-logo";
import { MobileNav } from "@/shared/components/mobile-nav";

const NAV_LINKS = [
  { href: "/tours", label: "Tours" },
  { href: "/#why-us", label: "Why Us" },
] as const;

export async function PublicHeader() {
  const user = await getCurrentUser();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLogo />

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/80 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello Mystic Egypt!")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground"
            >
              <Phone className="size-4" aria-hidden />
              WhatsApp
            </a>
          )}
          {user ? (
            <Link
              href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <ShieldCheck className="size-4" aria-hidden />
              {user.role === "ADMIN" ? "Admin" : "My account"}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-foreground/80 hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <MobileNav user={user} links={NAV_LINKS} whatsapp={whatsapp} />
      </div>
    </header>
  );
}
