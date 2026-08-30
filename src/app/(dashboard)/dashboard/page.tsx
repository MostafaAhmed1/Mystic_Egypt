import { requireUser } from "@/core/lib/session";
import {
  getDashboardSummary,
  listUserBookings,
} from "@/features/dashboard/service";
import { DashboardOverviewClient } from "@/app/(dashboard)/dashboard/dashboard-overview-client";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardOverviewPage() {
  const user = await requireUser();
  const [summary, bookings] = await Promise.all([
    getDashboardSummary(user.id),
    listUserBookings(user.id),
  ]);
  const recent = bookings.slice(0, 4);

  return (
    <DashboardOverviewClient
      userName={user.name}
      summary={summary}
      recentBookings={recent}
    />
  );
}
