import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { Activity, CalendarDays, ChartNoAxesColumnIncreasing, HeartPulse, Home, ListChecks, LogOut, Settings, Sparkles, UtensilsCrossed } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { signOutAction } from "@/app/auth/sign-out";
import { isDemoMode } from "@/lib/demo-mode";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/today", label: "Today", icon: ListChecks },
  { href: "/habits", label: "Habits", icon: Activity },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/weekly-menu", label: "Weekly menu", icon: UtensilsCrossed },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/insights", label: "Insights", icon: ChartNoAxesColumnIncreasing },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: ReactNode }) {
  const demoMode = isDemoMode();

  return (
    <div className="min-h-screen text-zinc-950 dark:text-zinc-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-rose-200/80 bg-white/90 px-4 py-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 lg:block">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3 rounded-md px-2 py-2 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 dark:focus-visible:outline-teal-400">
          <span className="grid size-9 place-items-center rounded-md bg-gradient-to-br from-rose-600 via-orange-500 to-amber-400 text-white shadow-sm"><Sparkles size={18} /></span>
          <span>rhythm</span>
        </Link>
        <nav className="grid gap-1" aria-label="Primary navigation">
          {navItems.map((item) => <NavLink key={item.href} {...item} />)}
        </nav>
        <div className="absolute bottom-5 left-4 right-4">
          <div className="grid gap-3">
            <ThemeToggle />
            <form action={signOutAction}>
              <button className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-teal-200 dark:focus-visible:outline-teal-400" type="submit">
                <LogOut size={18} />{demoMode ? "Exit demo" : "Sign out"}
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-rose-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="font-bold">rhythm</Link>
            <div className="flex items-center gap-2">
              <ThemeToggle compact />
              <form action={signOutAction}>
                <button aria-label={demoMode ? "Exit demo" : "Sign out"} className="grid size-10 place-items-center rounded-md bg-white text-zinc-800 shadow-sm ring-1 ring-rose-100 hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-800 dark:focus-visible:outline-teal-400" title={demoMode ? "Exit demo" : "Sign out"} type="submit">
                  <LogOut size={18} />
                </button>
              </form>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Mobile navigation">
            {navItems.map((item) => <Link className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm ring-1 ring-rose-100 hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-800 dark:focus-visible:outline-teal-400" href={item.href} key={item.href}>{item.label}</Link>)}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
          {demoMode ? <DemoBanner /> : null}
          {children}
        </main>
      </div>
    </div>
  );
}

function DemoBanner() {
  return (
    <section className="mb-6 rounded-lg border border-teal-200 bg-white/85 p-4 shadow-sm dark:border-teal-800 dark:bg-zinc-900/90" aria-label="Demo workspace guidance">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">Demo workspace</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">This local workspace starts clean. Add today&apos;s check-in, your routine, habits, and meals as you go.</p>
        </div>
        <Link className="inline-flex min-h-10 items-center justify-center rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400 dark:focus-visible:outline-teal-400" href="/today">Add today&apos;s info</Link>
      </div>
    </section>
  );
}

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: ComponentType<{ size?: number; className?: string }> }) {
  return (
    <Link href={href} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-teal-200 dark:focus-visible:outline-teal-400")}>
      <Icon size={18} className="text-teal-600 dark:text-teal-300" />
      {label}
    </Link>
  );
}
