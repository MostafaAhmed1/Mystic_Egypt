import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { listCmsPages } from "@/features/admin/service";
import { ToggleCmsPublishedButton } from "@/features/admin/components/CmsActions";

export const metadata = {
  title: "CMS Pages",
};

export default async function AdminCmsListPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; published?: string; page?: string }>;
}) {
  const params = await searchParams;
  const result = await listCmsPages({
    search: params.search,
    published: params.published,
    page: parseInt(params.page ?? "1", 10),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">CMS Pages</h1>
          <p className="text-sm text-muted-foreground">
            Manage static content pages (About, Privacy, Terms, etc.).
          </p>
        </div>
        <Link
          href="/admin/cms/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Add Page
        </Link>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          name="search"
          defaultValue={params.search ?? ""}
          placeholder="Search pages..."
          className="h-10 w-full max-w-xs rounded-xl border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          name="published"
          defaultValue={params.published ?? ""}
          className="h-10 rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-xl border bg-card px-4 text-sm font-medium hover:bg-muted"
        >
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {result.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No CMS pages found.
                  </td>
                </tr>
              ) : (
                result.items.map((page) => (
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
                        {page.published ? "Published" : "Draft"}
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
                          title="Edit"
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
