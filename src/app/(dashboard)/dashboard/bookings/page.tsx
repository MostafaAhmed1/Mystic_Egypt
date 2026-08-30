import { requireUser } from "@/core/lib/session";
import { listUserBookings } from "@/features/dashboard/service";
import { DashboardBookingsClient } from "@/app/(dashboard)/dashboard/bookings/dashboard-bookings-client";

export const metadata = {
  title: "Bookings",
};

export default async function BookingsPage() {
  const user = await requireUser();
  const bookings = await listUserBookings(user.id);

  return <DashboardBookingsClient bookings={bookings} />;
}
