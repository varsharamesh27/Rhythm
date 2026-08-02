"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  HeartPulse,
  Home,
  ListChecks,
  ShieldCheck,
  Settings,
  UtensilsCrossed
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

const baseNavGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Daily",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/today", label: "Today", icon: ListChecks }
    ]
  },
  {
    label: "Plan",
    items: [
      { href: "/habits", label: "Habits", icon: Activity },
      { href: "/schedule", label: "Schedule", icon: CalendarDays },
      { href: "/weekly-menu", label: "Weekly menu", icon: UtensilsCrossed }
    ]
  },
  {
    label: "Review",
    items: [
      { href: "/health", label: "Health", icon: HeartPulse },
      { href: "/insights", label: "Insights", icon: ChartNoAxesColumnIncreasing },
      { href: "/settings", label: "Settings", icon: Settings }
    ]
  }
];

function navGroups(isOwner: boolean): Array<{ label: string; items: NavItem[] }> {
  if (!isOwner) return baseNavGroups;
  return [...baseNavGroups, { label: "Owner", items: [{ href: "/owner", label: "Owner hub", icon: ShieldCheck }] }];
}

export function DesktopNavigation({ isOwner = false }: { isOwner?: boolean }) {
  const pathname = usePathname();
  const groups = navGroups(isOwner);

  return (
    <nav className="grid gap-7" aria-label="Primary navigation">
      {groups.map((group) => (
        <div className="grid gap-1" key={group.label}>
          <p className="px-3 text-xs font-semibold text-muted-foreground">
            {group.label}
          </p>
          {group.items.map((item) => (
            <NavLink item={item} active={isActive(pathname, item.href)} key={item.href} />
          ))}
        </div>
      ))}
    </nav>
  );
}

export function MobileNavigation({ isOwner = false }: { isOwner?: boolean }) {
  const pathname = usePathname();
  const allItems = navGroups(isOwner).flatMap((group) => group.items);

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Mobile navigation">
      {allItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center gap-2 border-b-2 px-2 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
            href={item.href}
            key={item.href}
          >
            <Icon className={active ? "text-primary" : "text-muted-foreground"} size={16} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex min-h-11 items-center gap-3 rounded-sm border-l-2 px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        active
          ? "border-l-primary bg-muted text-foreground"
          : "border-l-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      )}
      href={item.href}
    >
      <Icon className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} size={18} />
      <span>
        {item.label}
      </span>
    </Link>
  );
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
