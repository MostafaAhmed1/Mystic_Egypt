"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface RevenueChartProps {
  data: { date: string; revenue: number; bookings: number }[];
}

const PERIODS = [
  { value: "daily", label: "30 Days" },
  { value: "weekly", label: "12 Weeks" },
  { value: "monthly", label: "12 Months" },
] as const;

export function RevenueChart({ data }: RevenueChartProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  const filtered = filterData(data, period);

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Revenue</h2>
          <p className="text-sm text-muted-foreground">
            Confirmed booking revenue over time.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border bg-muted/40 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                period === p.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-64">
        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No revenue data for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filtered}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={formatDate}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v: number) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function filterData(
  data: { date: string; revenue: number; bookings: number }[],
  period: "daily" | "weekly" | "monthly",
) {
  if (period === "daily") return data;
  // For weekly/monthly, the API already returns grouped data
  return data;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
