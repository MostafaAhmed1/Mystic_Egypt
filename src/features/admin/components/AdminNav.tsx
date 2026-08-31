"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  CalendarDays,
  FileText,
  Users,
  Settings,
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
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function AdminNav() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  return (
    <nav aria-label="Admin" className="flex flex-col gap-1">
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
