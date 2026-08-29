import {
  DollarSign,
  CalendarDays,
  Clock,
  Map,
} from "lucide-react";

export const metadata = {
  title: "Admin Overview",
};

const STATS = [
  {
    label: "Total Revenue",
    value: "—",
    icon: DollarSign,
    description: "All-time confirmed revenue",
  },
  {
    label: "Total Bookings",
    value: "—",
    icon: CalendarDays,
    description: "All booking statuses",
  },
  {
    label: "Pending Review",
    value: "—",
    icon: Clock,
    description: "Awaiting receipt approval",
  },
  {
    label: "Active Tours",
    value: "—",
    icon: Map,
    description: "Currently open for booking",
  },
];

export default async function AdminOverviewPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          Platform-wide statistics and recent activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <Icon className="size-4 text-muted-foreground" aria-hidden />
              </div>
              <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Revenue & Bookings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Charts and detailed analytics will appear here in the next step.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Recent Bookings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Booking activity table will appear here in the next step.
        </p>
      </div>
    </div>
  );
}
