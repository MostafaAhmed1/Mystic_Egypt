import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPolicyContent,
  isPolicyType,
  POLICY_TYPES,
} from "@/features/policy/content";
import { PolicyLayout } from "@/features/policy/components/PolicyLayout";
import { buildPageMetadata } from "@/core/utils/seo";
import type { Locale } from "@/core/i18n-config";

// Static content pages. dynamicParams=false so any unknown /policies/* URL is a
// 404 at build time and never falls through to an on-demand static render.
export const dynamicParams = false;

export function generateStaticParams() {
  return POLICY_TYPES.map((policy) => ({ policy }));
}

type PolicyPageProps = {
  params: Promise<{ locale: string; policy: string }>;
};

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { locale, policy } = await params;
  if (!isPolicyType(policy)) return { title: "Page Not Found" };

  const content = getPolicyContent(policy, locale);

  return buildPageMetadata({
    pathname: `/policies/${policy}`,
    locale: locale as Locale,
    title: content.title,
    description: content.description,
    ogType: "website",
  });
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { locale, policy } = await params;
  if (!isPolicyType(policy)) notFound();

  const content = getPolicyContent(policy, locale);

  return <PolicyLayout content={content} />;
}