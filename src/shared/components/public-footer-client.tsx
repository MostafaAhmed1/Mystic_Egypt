"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/shared/components/brand-logo";
import { ShieldCheck, Wallet, MapPin, Mail, Phone } from "lucide-react";
import { useLocale } from "@/shared/hooks/use-locale";
import { trackEvent } from "@/core/lib/analytics";
import { BUSINESS } from "@/core/constants/business";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

type PublicFooterProps = {
  phoneUK: string;
  phoneEG: string;
  whatsapp: string;
};

export function PublicFooter({ phoneUK, phoneEG, whatsapp }: PublicFooterProps) {
  const { t } = useTranslation();
  const { href } = useLocale();
  const facebook = BUSINESS.facebook;
  const instagram = BUSINESS.instagram;

  return (
    <footer className="bg-obsidian">
      {/* Gold accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Main footer content */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:justify-between lg:gap-8">
        {/* Brand column */}
        <div className="max-w-sm space-y-5">
          <div className="text-gold">
            <BrandLogo href={href("/")} />
          </div>
          <p className="text-sm leading-relaxed text-sandstone/60">
            {t("footer.description")}
          </p>
          <div className="space-y-3 text-sm text-sandstone/50">
            <p className="inline-flex items-center gap-2.5">
              <ShieldCheck className="size-4 text-gold" aria-hidden />
              {t("footer.ukRegistered")}
            </p>
            <p className="inline-flex items-center gap-2.5">
              <Wallet className="size-4 text-gold" aria-hidden />
              {t("footer.bestPrices")}
            </p>
            <p className="inline-flex items-center gap-2.5">
              <MapPin className="size-4 text-gold" aria-hidden />
              {t("footer.localExperts")}
            </p>
          </div>
          {/* Social links */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-9 items-center justify-center rounded-lg bg-sandstone/10 text-sandstone/50 transition-all duration-300 hover:bg-gold/20 hover:text-gold"
              aria-label="Facebook"
            >
              <FacebookIcon className="size-4" />
            </a>
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-9 items-center justify-center rounded-lg bg-sandstone/10 text-sandstone/50 transition-all duration-300 hover:bg-gold/20 hover:text-gold"
              aria-label="Instagram"
            >
              <InstagramIcon className="size-4" />
            </a>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello Mystic Egypt!")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("whatsapp_click", { location: "footer" })}
                className="inline-flex size-9 items-center justify-center rounded-lg bg-sandstone/10 text-sandstone/50 transition-all duration-300 hover:bg-green-600/20 hover:text-green-400"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="size-4" />
              </a>
            )}
          </div>
        </div>

        {/* Explore column */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold">
            {t("footer.explore")}
          </h3>
          <ul className="space-y-3 text-sm text-sandstone/60">
            <li>
              <Link href={href("/tours")} className="transition-colors duration-300 hover:text-gold">
                {t("nav.tours")}
              </Link>
            </li>
            <li>
              <Link href={href("/#why-us")} className="transition-colors duration-300 hover:text-gold">
                {t("footer.whyChooseUs")}
              </Link>
            </li>
            <li>
              <Link href={href("/contact")} className="transition-colors duration-300 hover:text-gold">
                {t("footer.contact")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Account column */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold">
            {t("footer.account")}
          </h3>
          <ul className="space-y-3 text-sm text-sandstone/60">
            <li>
              <Link href={href("/login")} className="transition-colors duration-300 hover:text-gold">
                {t("footer.login")}
              </Link>
            </li>
            <li>
              <Link href={href("/register")} className="transition-colors duration-300 hover:text-gold">
                {t("footer.createAccount")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal column */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold">
            {t("footer.legal")}
          </h3>
          <ul className="space-y-3 text-sm text-sandstone/60">
            <li>
              <Link href={href("/policies/privacy-policy")} className="transition-colors duration-300 hover:text-gold">
                {t("footer.privacyPolicy")}
              </Link>
            </li>
            <li>
              <Link href={href("/policies/terms-and-conditions")} className="transition-colors duration-300 hover:text-gold">
                {t("footer.termsConditions")}
              </Link>
            </li>
            <li>
              <Link href={href("/policies/cancellation-policy")} className="transition-colors duration-300 hover:text-gold">
                {t("footer.cancellationPolicy")}
              </Link>
            </li>
            <li>
              <Link href={href("/policies/cookie-policy")} className="transition-colors duration-300 hover:text-gold">
                {t("footer.cookiePolicy")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact column */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold">
            {t("footer.contact")}
          </h3>
          <ul className="space-y-3 text-sm text-sandstone/60">
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-gold/60" aria-hidden />
              {t("footer.ukAddress")}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-gold/60" aria-hidden />
              {t("footer.egyptAddress")}
            </li>
            <li>
              <a
                href="mailto:info@mysticegypt.net"
                className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-gold"
              >
                <Mail className="size-4 text-gold/60" aria-hidden />
                info@mysticegypt.net
              </a>
            </li>
            {phoneUK && (
              <li>
                <a
                  href={`tel:${phoneUK}`}
                  className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-gold"
                >
                  <Phone className="size-4 text-gold/60" aria-hidden />
                  {phoneUK} (UK)
                </a>
              </li>
            )}
            {phoneEG && (
              <li>
                <a
                  href={`tel:${phoneEG}`}
                  className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-gold"
                >
                  <Phone className="size-4 text-gold/60" aria-hidden />
                  {phoneEG} (Egypt)
                </a>
              </li>
            )}
            {whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello Mystic Egypt!")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("whatsapp_click", { location: "footer" })}
                  className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-gold"
                >
                  <WhatsAppIcon className="size-4 text-gold/60" />
                  WhatsApp
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-sandstone/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-sandstone/40 sm:flex-row sm:px-6">
          <p>&copy; {new Date().getFullYear()} {t("footer.copyright")}</p>
          <p className="font-heading tracking-wider">mysticegypt.net</p>
        </div>
      </div>
    </footer>
  );
}
