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
  Settings,
  UtensilsCrossed
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  tone: "routine" | "recovery" | "movement" | "nutrition" | "career";
};

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Daily",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home, tone: "routine" },
      { href: "/today", label: "Today", icon: ListChecks, tone: "recovery" }
    ]
  },
  {
    label: "Plan",
    items: [
      { href: "/habits", label: "Habits", icon: Activity, tone: "movement" },
      { href: "/schedule", label: "Schedule", icon: CalendarDays, tone: "routine" },
      { href: "/weekly-menu", label: "Weekly menu", icon: UtensilsCrossed, tone: "nutrition" }
    ]
  },
  {
    label: "Review",
    items: [
      { href: "/health", label: "Health", icon: HeartPulse, tone: "recovery" },
      { href: "/insights", label: "Insights", icon: ChartNoAxesColumnIncreasing, tone: "career" },
      { href: "/settings", label: "Settings", icon: Settings, tone: "routine" }
    ]
  }
];

const allItems = navGroups.flatMap((group) => group.items);

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-6" aria-label="Primary navigation">
      {navGroups.map((group) => (
        <div className="grid gap-1" key={group.label}>
          <p className="px-3 text-xs font-bold uppercase text-zinc-400 dark:text-zinc-500">
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

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Mobile navigation">
      {allItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 dark:focus-visible:outline-teal-400",
              active
                ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            )}
            href={item.href}
            key={item.href}
          >
            <Icon className={toneClass(item.tone)} size={16} />
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
        "group flex min-h-11 items-center gap-3 rounded-md border-l-4 px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 dark:focus-visible:outline-teal-400",
        active
          ? cn("bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950", toneBorderClass(item.tone))
          : "border-l-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
      )}
      href={item.href}
    >
      <Icon className={cn("shrink-0", active ? "text-current" : toneClass(item.tone))} size={18} />
      <span className={active ? "text-white dark:text-zinc-950" : "text-zinc-700 group-hover:text-zinc-950 dark:text-zinc-200 dark:group-hover:text-white"}>
        {item.label}
      </span>
    </Link>
  );
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function toneClass(tone: NavItem["tone"]): string {
  return {
    routine: "text-rose-500",
    recovery: "text-cyan-600 dark:text-cyan-400",
    movement: "text-lime-600 dark:text-lime-400",
    nutrition: "text-amber-600 dark:text-amber-400",
    career: "text-violet-600 dark:text-violet-400"
  }[tone];
}

function toneBorderClass(tone: NavItem["tone"]): string {
  return {
    routine: "border-l-rose-500",
    recovery: "border-l-cyan-500",
    movement: "border-l-lime-500",
    nutrition: "border-l-amber-400",
    career: "border-l-violet-500"
  }[tone];
}
