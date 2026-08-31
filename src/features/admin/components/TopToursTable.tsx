import { CURRENCY_SYMBOLS, type Currency } from "@/core/constants/currencies";

interface TopTour {
  tour_id: string;
  tour_title: string;
  booking_count: number;
  revenue: number;
}

export function TopToursTable({ tours }: { tours: TopTour[] }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="text-lg font-semibold">Top Selling Tours</h2>
      <p className="text-sm text-muted-foreground">
        Tours ranked by confirmed booking count.
      </p>
      <div className="mt-4">
        {tours.length === 0 ? (
          <p className="text-sm text-muted-foreground">No confirmed bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-start text-muted-foreground">
                  <th className="pb-3 font-medium">Tour</th>
                  <th className="pb-3 text-end font-medium">Bookings</th>
                  <th className="pb-3 text-end font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((tour, i) => (
                  <tr key={tour.tour_id} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {i + 1}
                        </span>
                        <span className="truncate font-medium">
                          {tour.tour_title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-end tabular-nums">
                      {tour.booking_count}
                    </td>
                    <td className="py-3 text-end tabular-nums">
                      ${tour.revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
