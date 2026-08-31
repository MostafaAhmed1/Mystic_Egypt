import { notFound } from "next/navigation";
import { getPublishedCmsPage } from "@/features/admin/service";
import { buildAlternates } from "@/core/utils/seo";
import type { Locale } from "@/core/i18n-config";
import type { Metadata } from "next";

type CmsPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPublishedCmsPage(slug);
  if (!page) return { title: "Page Not Found" };

  return {
    title: page.title,
    ...buildAlternates(`/${slug}`, locale as Locale),
  };
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
