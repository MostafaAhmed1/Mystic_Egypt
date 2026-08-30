"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/core/utils";
import { LanguageSwitcher } from "@/shared/components/language-switcher";

type MobileNavProps = {
  user: { name: string; role: "CLIENT" | "ADMIN" } | null;
  links?: ReadonlyArray<{ href: string; label: string }>;
  whatsapp?: string | null;
};

export function MobileNav({ user, links = [], whatsapp }: MobileNavProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/tours", label: t("nav.tours") },
    { href: "/#why-us", label: t("nav.whyUs") },
  ];

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("nav.toggleMenu")}
        aria-expanded={open}
        className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-foreground"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 border-b bg-background px-4 py-4 shadow-lg">
          <nav className="flex flex-col gap-3 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn("py-1 text-foreground/80 hover:text-foreground")}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-1 border-border" />
            <div className="flex items-center gap-2 py-1">
              <LanguageSwitcher />
            </div>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello Mystic Egypt!")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-1 text-foreground/80 hover:text-foreground"
              >
                <Phone className="size-4" aria-hidden />
                {t("nav.whatsapp")}
              </a>
            )}
            {user ? (
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                onClick={() => setOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-primary-foreground hover:bg-primary/90"
              >
                {user.role === "ADMIN" ? t("nav.adminPanel") : t("nav.myAccount")}
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-border text-sm font-medium"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {t("nav.signup")}
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
