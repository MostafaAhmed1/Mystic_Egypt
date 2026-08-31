import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/shared/components/ui/sonner";
import { AuthProvider } from "@/shared/components/session-provider";
import { I18nProvider } from "@/shared/components/i18n-provider";
import { CookieConsent } from "@/shared/components/cookie-consent";
import { AnalyticsProvider } from "@/shared/components/analytics-provider";
import { dir, type Locale } from "@/core/i18n-config";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }, { locale: "de" }];
}

export const metadata: Metadata = {
  title: {
    default: "Mystic Egypt | Luxury Tours & Experiences",
    template: "%s | Mystic Egypt",
  },
  description:
    "Authentic, luxurious tours across Egypt — from the Pyramids of Giza to the White Desert. UK-registered with local Egyptian experts.",
};

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AnalyticsProvider />
        <I18nProvider locale={locale as Locale}>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
        <CookieConsent />
        <Toaster />
      </body>
    </html>
  );
}
