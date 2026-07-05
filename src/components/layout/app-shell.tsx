import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { Activity, CalendarDays, ChartNoAxesColumnIncreasing, HeartPulse, Home, ListChecks, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/today", label: "Today", icon: ListChecks },
  { href: "/habits", label: "Habits", icon: Activity },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/insights", label: "Insights", icon: ChartNoAxesColumnIncreasing },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-stone-200 bg-white px-4 py-5 lg:block">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3 rounded-md px-2 py-2 font-bold">
          <span className="grid size-9 place-items-center rounded-md bg-emerald-700 text-white"><Sparkles size={18} /></span>
          <span>rhythm</span>
        </Link>
        <nav className="grid gap-1" aria-label="Primary navigation">
          {navItems.map((item) => <NavLink key={item.href} {...item} />)}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="font-bold">rhythm</Link>
            <span className="text-sm text-stone-600">steady progress</span>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Mobile navigation">
            {navItems.map((item) => <Link className="rounded-md bg-stone-100 px-3 py-2 text-sm font-medium" href={item.href} key={item.href}>{item.label}</Link>)}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: ComponentType<{ size?: number; className?: string }> }) {
  return (
    <Link href={href} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700")}>
      <Icon size={18} />
      {label}
    </Link>
  );
}
