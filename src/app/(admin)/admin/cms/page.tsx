import { listCmsPages } from "@/features/admin/service";
import { AdminCmsClient } from "@/app/(admin)/admin/cms/admin-cms-client";

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
    <AdminCmsClient
      pages={result.items}
      search={params.search ?? ""}
      published={params.published ?? ""}
    />
  );
}
