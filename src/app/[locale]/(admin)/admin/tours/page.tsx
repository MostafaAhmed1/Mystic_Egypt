import { listTours } from "@/features/admin/service";
import { AdminToursClient } from "@/app/[locale]/(admin)/admin/tours/admin-tours-client";

export const metadata = {
  title: "Tours Management",
};

export default async function AdminToursPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const status = params.status ?? "";
  const page = parseInt(params.page ?? "1", 10);

  const result = await listTours({ search, status, page, limit: 20 });

  return (
    <AdminToursClient
      tours={result.items}
      total={result.total}
      page={result.page}
      limit={result.limit}
      search={search}
      status={status}
    />
  );
}
