"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Eye, EyeOff } from "lucide-react";
import { ToggleCmsPublishedButton } from "@/features/admin/components/CmsActions";
import { useLocale } from "@/shared/hooks/use-locale";

interface CmsPageItem {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  updated_at: Date | string;
}

interface AdminCmsClientProps {
  pages: CmsPageItem[];
  search: string;
  published: string;
}

export function AdminCmsClient({
  pages,
  search,
  published,
}: AdminCmsClientProps) {
  const { t } = useTranslation("common");
  const { href } = useLocale();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("admin.cmsPages")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("admin.manageCmsDescription")}
          </p>
        </div>
        <Link
          href={href("/admin/cms/new")}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          {t("admin.addPage")}
        </Link>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder={t("admin.searchPagesPlaceholder")}
          className="h-10 w-full max-w-xs rounded-xl border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          name="published"
          defaultValue={published}
          className="h-10 rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t("admin.all")}</option>
          <option value="true">{t("admin.published")}</option>
          <option value="false">{t("admin.draft")}</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-xl border bg-card px-4 text-sm font-medium hover:bg-muted"
        >
          {t("tours.filter")}
        </button>
      </form>

      {/* Table */}
      <div className="rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-start text-muted-foreground">
                <th className="px-4 py-3 font-medium">{t("admin.title")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.slug")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.status")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.updated")}</th>
                <th className="px-4 py-3 text-end font-medium">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    {t("admin.noCmsPagesFound")}
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{page.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">/{page.slug}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          page.published
                            ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                            : "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                        }`}
                      >
                        {page.published ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                        {page.published ? t("admin.published") : t("admin.draft")}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {new Date(page.updated_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/cms/${page.slug}/edit`}
                          className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted"
                          title={t("admin.edit")}
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <ToggleCmsPublishedButton pageId={page.id} published={page.published} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
