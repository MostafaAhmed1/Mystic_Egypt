import { notFound } from "next/navigation";
import { getPublishedCmsPage } from "@/features/admin/service";
import { buildPageMetadata } from "@/core/utils/seo";
import type { Locale } from "@/core/i18n-config";
import type { Metadata } from "next";

type CmsPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

function contentExcerpt(html: string, max = 160): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPublishedCmsPage(slug);
  if (!page) return { title: "Page Not Found" };

  const description = contentExcerpt(page.content) || `Official page for ${page.title}.`;

  return buildPageMetadata({
    pathname: `/${slug}`,
    locale: locale as Locale,
    title: page.title,
    description,
    absoluteTitle: /mystic egypt/i.test(page.title),
  });
}

export default async function CmsPage({ params }: CmsPageProps) {
  const { slug } = await params;
  const page = await getPublishedCmsPage(slug);
  if (!page) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        {page.title}
      </h1>
      <div
        className="prose prose-gray mt-8 max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
