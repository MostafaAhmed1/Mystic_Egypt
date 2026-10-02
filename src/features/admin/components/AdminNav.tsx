"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  LayoutTemplate,
  CalendarDays,
  FileText,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/core/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Manage",
    items: [
      { href: "/admin/tours", label: "Tours", icon: Map },
      { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: LayoutTemplate },
      { href: "/admin/cms", label: "CMS", icon: FileText },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/admins", label: "Admins", icon: Users },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  return (
    <nav aria-label="Admin" className="flex flex-col gap-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-obsidian/60">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const href = `/${locale}${item.href}`;
              const active = item.exact ? pathname === href : pathname.startsWith(href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
                      active
                        ? "bg-gold/10 text-obsidian"
                        : "text-obsidian/60 hover:bg-sand hover:text-obsidian",
                    )}
                  >
                    {active && (
                      <span
                        aria-hidden
                        className="absolute inset-y-2 start-0 w-1 rounded-full bg-gold"
                      />
                    )}
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors duration-200",
                        active
                          ? "text-gold-dark"
                          : "text-obsidian/50 group-hover:text-obsidian/80",
                      )}
                      aria-hidden
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
