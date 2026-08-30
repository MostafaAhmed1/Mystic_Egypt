import { listBookings } from "@/features/admin/service";
import { AdminBookingsClient } from "@/app/(admin)/admin/bookings/admin-bookings-client";

export const metadata = {
  title: "Orders Management",
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    payment_method?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
    page?: string;
    view?: string;
  }>;
}) {
  const params = await searchParams;
  const result = await listBookings({
    status: params.status,
    payment_method: params.payment_method,
    search: params.search,
    date_from: params.date_from,
    date_to: params.date_to,
    page: parseInt(params.page ?? "1", 10),
    limit: 50,
  });

  const view = params.view ?? "table";

  // Build filter query string for pagination links
  const filterQs = new URLSearchParams();
  if (params.status) filterQs.set("status", params.status);
  if (params.payment_method) filterQs.set("payment_method", params.payment_method);
  if (params.search) filterQs.set("search", params.search);
  if (params.date_from) filterQs.set("date_from", params.date_from);
  if (params.date_to) filterQs.set("date_to", params.date_to);

  return (
    <AdminBookingsClient
      bookings={result.items.map((b) => ({
        id: b.id,
        tour_title: b.tour_title,
        user_name: b.user_name,
        user_email: b.user_email,
        total_amount: b.total_amount,
        currency: b.currency,
        status: b.status,
        payment_method: b.payment_method,
        tour_date: b.tour_date instanceof Date ? b.tour_date.toISOString() : String(b.tour_date),
        num_people: b.num_people,
        receipt_image_url: b.receipt_image_url,
        created_at: b.created_at instanceof Date ? b.created_at.toISOString() : String(b.created_at),
      }))}
      total={result.total}
      page={result.page}
      limit={result.limit}
      view={view}
      filterQs={filterQs.toString()}
      search={params.search ?? ""}
      status={params.status ?? ""}
      paymentMethod={params.payment_method ?? ""}
      dateFrom={params.date_from ?? ""}
      dateTo={params.date_to ?? ""}
    />
  );
}
