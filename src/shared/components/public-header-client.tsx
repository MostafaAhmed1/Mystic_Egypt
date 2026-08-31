"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Phone, ShieldCheck } from "lucide-react";
import { LanguageSwitcher } from "@/shared/components/language-switcher";
import { useLocale } from "@/shared/hooks/use-locale";

type PublicHeaderClientProps = {
  user: { name: string; role: "CLIENT" | "ADMIN" } | null;
  whatsapp?: string | null;
};

export function PublicHeaderClient({ user, whatsapp }: PublicHeaderClientProps) {
  const { t } = useTranslation();
  const { href } = useLocale();

  return (
    <div className="hidden items-center gap-3 md:flex">
      <LanguageSwitcher />
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(t("nav.whatsapp") + " " + "Mystic Egypt")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground"
        >
          <Phone className="size-4" aria-hidden />
          {t("nav.whatsapp")}
        </a>
      )}
      {user ? (
        <Link
          href={href(user.role === "ADMIN" ? "/admin" : "/dashboard")}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <ShieldCheck className="size-4" aria-hidden />
          {user.role === "ADMIN" ? t("nav.admin") : t("nav.myAccount")}
        </Link>
      ) : (
        <>
          <Link
            href={href("/login")}
            className="text-sm font-medium text-foreground/80 hover:text-foreground"
          >
            {t("nav.login")}
          </Link>
          <Link
            href={href("/register")}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("nav.signup")}
          </Link>
        </>
      )}
    </div>
  );
}
