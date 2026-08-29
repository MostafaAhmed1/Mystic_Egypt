import Link from "next/link";
import { BrandLogo } from "@/shared/components/brand-logo";
import { ShieldCheck, Wallet, MapPin } from "lucide-react";

const FOOTER_LINKS = [
  { href: "/tours", label: "Tours" },
  { href: "/#why-us", label: "Why Choose Us" },
] as const;

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:justify-between">
        <div className="max-w-sm space-y-4">
          <BrandLogo />
          <p className="text-sm text-muted-foreground">
            Authentic, transparent tours across Egypt — UK-registered with a local team of
            Egyptian experts.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" aria-hidden />
              UK Registered Company
            </p>
            <p className="inline-flex items-center gap-2">
              <Wallet className="size-4 text-primary" aria-hidden />
              Best Local Prices Guaranteed
            </p>
            <p className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-primary" aria-hidden />
              Local Egyptian Experts
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Explore</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Account</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/login" className="hover:text-foreground">
                Log in
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-foreground">
                Create account
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>&copy; {new Date().getFullYear()} Mystic Egypt. All rights reserved.</p>
          <p>mysticegypt.net</p>
        </div>
      </div>
    </footer>
  );
}
