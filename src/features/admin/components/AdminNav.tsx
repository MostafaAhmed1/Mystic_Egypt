"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  CalendarDays,
  FileText,
  Users,
} from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/tours",
    label: "Tours",
    icon: Map,
  },
  {
    href: "/admin/bookings",
    label: "Bookings",
    icon: CalendarDays,
  },
  {
    href: "/admin/cms",
    label: "CMS",
    icon: FileText,
  },
  {
    href: "/admin/admins",
    label: "Admins",
    icon: Users,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "flex items-center gap-3 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                : "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            }
          >
            <Icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
