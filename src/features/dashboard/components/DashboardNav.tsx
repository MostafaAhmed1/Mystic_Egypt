"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Heart,
  UserRound,
} from "lucide-react";
import { cn } from "@/core/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
  { href: "/dashboard/wishlist", label: "Favourites", icon: Heart },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
];

export function DashboardNav() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const href = `/${locale}${item.href}`;
        const active = item.exact
          ? pathname === href
          : pathname.startsWith(href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300",
              active
                ? "border border-gold/20 bg-gold/10 text-gold shadow-[0_2px_12px_rgba(212,175,55,0.1)]"
                : "text-obsidian/50 hover:bg-sand hover:text-obsidian"
            )}
          >
            <Icon
              className={cn(
                "size-4 transition-colors duration-300",
                active ? "text-gold" : "text-obsidian/30 group-hover:text-obsidian/60"
              )}
              aria-hidden
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
