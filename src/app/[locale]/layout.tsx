import type { Metadata } from "next";
import { Cinzel, Inter, Noto_Kufi_Arabic } from "next/font/google";
import { Toaster } from "@/shared/components/ui/sonner";
import { AuthProvider } from "@/shared/components/session-provider";
import { I18nProvider } from "@/shared/components/i18n-provider";
import { CookieConsent } from "@/shared/components/cookie-consent";
import { AnalyticsProvider } from "@/shared/components/analytics-provider";
import { MetaPixelProvider } from "@/shared/components/meta-pixel-provider";
import { ScrollProgressLazy } from "@/shared/components/scroll-progress-lazy";
import { JsonLd } from "@/shared/components/json-ld";
import { organizationSchema, websiteSchema } from "@/core/utils/structured-data";
import { dir, locales, type Locale } from "@/core/i18n-config";
import { getServerT } from "@/core/lib/i18n-server";
import "../globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getServerT(locale as Locale);

  return {
    title: {
      default: t("seo.site.title"),
      template: t("seo.site.titleTemplate"),
    },
    description: t("seo.site.description"),
    icons: {
      icon: "/icon.png",
      shortcut: "/icon.png",
      apple: "/icon.png",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  return (
    <html
      lang={locale}
      dir={dir[locale as Locale]}
      suppressHydrationWarning
      className={`${cinzel.variable} ${inter.variable} ${notoKufiArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={[organizationSchema(), websiteSchema(locale as Locale)]} />
        <a href="#main-content" className="skip-link">
          {getServerT(locale as Locale)("a11y.skipToContent")}
        </a>
        <ScrollProgressLazy />
        <AnalyticsProvider gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <I18nProvider locale={locale as Locale}>
          <AuthProvider>
            {children}
            <MetaPixelProvider pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID} />
          </AuthProvider>
        </I18nProvider>
        <CookieConsent />
        <Toaster />
      </body>
    </html>
  );
}
