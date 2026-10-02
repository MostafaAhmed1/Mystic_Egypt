import type { Metadata } from "next";
import { ContactPageClient } from "./contact-page-client";
import { buildPageMetadata } from "@/core/utils/seo";
import { getServerT } from "@/core/lib/i18n-server";
import type { Locale } from "@/core/i18n-config";
import { BUSINESS } from "@/core/constants/business";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getServerT(locale as Locale);

  return buildPageMetadata({
    pathname: "/contact",
    locale: locale as Locale,
    title: t("seo.contact.title"),
    description: t("seo.contact.description"),
  });
}

export default function ContactPage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const phoneUK = process.env.NEXT_PUBLIC_PHONE_UK ?? BUSINESS.phoneUK.display;
  const phoneEG = process.env.NEXT_PUBLIC_PHONE_EG ?? BUSINESS.phoneEG.display;

  return (
    <ContactPageClient phoneUK={phoneUK} phoneEG={phoneEG} whatsapp={whatsapp} />
  );
}
