import type { MetadataRoute } from "next";
import { listPublicTourSlugs } from "@/features/tour/service";

const BASE_URL = "https://mysticegypt.net";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tourSlugs = await listPublicTourSlugs();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/tours`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const tourPages: MetadataRoute.Sitemap = tourSlugs.map((slug) => ({
    url: `${BASE_URL}/tours/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...tourPages];
}
