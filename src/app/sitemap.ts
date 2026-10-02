import type { MetadataRoute } from "next";
import { listPublicTourSlugs } from "@/features/tour/service";
import { listPublishedCmsPages } from "@/features/admin/service";
import { POLICY_TYPES } from "@/features/policy/content";
import { SITE_URL } from "@/core/utils/seo";
import { locales, defaultLocale } from "@/core/i18n-config";

export const dynamic = "force-dynamic";

/** hreflang alternates for a locale-relative path suffix ("" = home). */
function alternatesFor(suffix: string): { languages: Record<string, string> } {
  return {
    languages: Object.fromEntries(
      locales.map((locale) => [locale, `${SITE_URL}/${locale}${suffix}`]),
    ),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let tourSlugs: string[] = [];
  let cmsPages: { slug: string; updated_at: Date }[] = [];
  try {
    tourSlugs = await listPublicTourSlugs();
    cmsPages = await listPublishedCmsPages();
  } catch {
    // DB not available during Docker build
  }

  const homepage = {
    url: `${SITE_URL}/${defaultLocale}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 1,
    alternates: alternatesFor(""),
  };

  const toursIndex = {
    url: `${SITE_URL}/${defaultLocale}/tours`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
    alternates: alternatesFor("/tours"),
  };

  const contactPage = {
    url: `${SITE_URL}/${defaultLocale}/contact`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
    alternates: alternatesFor("/contact"),
  };

  const tourPages: MetadataRoute.Sitemap = tourSlugs.map((slug) => ({
    url: `${SITE_URL}/${defaultLocale}/tours/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
    alternates: alternatesFor(`/tours/${slug}`),
  }));

  const cmsPageEntries: MetadataRoute.Sitemap = cmsPages.map((page) => ({
    url: `${SITE_URL}/${defaultLocale}/${page.slug}`,
    lastModified: page.updated_at,
    changeFrequency: "monthly" as const,
    priority: 0.5,
    alternates: alternatesFor(`/${page.slug}`),
  }));

  const policyPages: MetadataRoute.Sitemap = POLICY_TYPES.map((policy) => ({
    url: `${SITE_URL}/${defaultLocale}/policies/${policy}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.3,
    alternates: alternatesFor(`/policies/${policy}`),
  }));

  return [
    homepage,
    toursIndex,
    contactPage,
    ...tourPages,
    ...cmsPageEntries,
    ...policyPages,
  ];
}