import { BookingStatusBadge } from "@/features/dashboard/components/status";
import type { BookingStatus } from "@/core/constants/booking";

interface RecentBooking {
  id: string;
  user_name: string;
  user_email: string;
  tour_title: string;
  tour_date: Date;
  num_people: number;
  total_amount: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: Date;
}

export function RecentBookingsTable({
  bookings,
}: {
  bookings: RecentBooking[];
}) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="text-lg font-semibold">Recent Bookings</h2>
      <p className="text-sm text-muted-foreground">
        Latest booking activity across the platform.
      </p>
      <div className="mt-4">
        {bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-start text-muted-foreground">
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Tour</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 text-end font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{b.user_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.user_email}
                        </p>
                      </div>
                    </td>
                    <td className="max-w-[200px] truncate py-3">
                      {b.tour_title}
                    </td>
                    <td className="whitespace-nowrap py-3">
                      {new Date(b.tour_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap py-3 text-end tabular-nums">
                      ${b.total_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3">
                      <BookingStatusBadge status={b.status as BookingStatus} />
                    </td>
                    <td className="whitespace-nowrap py-3 capitalize">
                      {b.payment_method.replace("_", " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
