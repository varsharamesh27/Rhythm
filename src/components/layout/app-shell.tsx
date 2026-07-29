import type { ReactNode } from "react";
import Link from "next/link";
import { AudioWaveform, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { signOutAction } from "@/app/auth/sign-out";
import { DesktopNavigation, MobileNavigation } from "@/components/layout/app-navigation";
import { isDemoMode } from "@/lib/demo-mode";

export function AppShell({ children }: { children: ReactNode }) {
  const demoMode = isDemoMode();

  return (
    <div className="min-h-screen text-zinc-950 dark:text-zinc-50">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-zinc-200 bg-white px-5 py-6 dark:border-zinc-800 dark:bg-zinc-950 lg:block">
        <Link href="/dashboard" className="mb-10 flex items-center gap-3 rounded-md px-2 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 dark:focus-visible:outline-teal-400">
          <span className="grid size-10 place-items-center rounded-md bg-zinc-950 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-950">
            <AudioWaveform size={21} />
          </span>
          <span>
            <span className="block text-lg font-black leading-none">rhythm</span>
            <span className="mt-1 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">Your day, in motion</span>
          </span>
        </Link>
        <DesktopNavigation />
        <div className="absolute bottom-5 left-4 right-4">
          <div className="grid gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <ThemeToggle />
            <form action={signOutAction}>
              <button className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white dark:focus-visible:outline-teal-400" type="submit">
                <LogOut size={18} />{demoMode ? "Exit demo" : "Sign out"}
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 font-black">
              <AudioWaveform className="text-rose-500" size={20} />
              rhythm
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle compact />
              <form action={signOutAction}>
                <button aria-label={demoMode ? "Exit demo" : "Sign out"} className="grid size-10 place-items-center rounded-md border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:outline-teal-400" title={demoMode ? "Exit demo" : "Sign out"} type="submit">
                  <LogOut size={18} />
                </button>
              </form>
            </div>
          </div>
          <div className="mt-3"><MobileNavigation /></div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-10 lg:py-8">
          {demoMode ? <DemoBanner /> : null}
          {children}
        </main>
      </div>
    </div>
  );
}

function DemoBanner() {
  return (
    <section className="mb-6 border-l-4 border-teal-500 bg-teal-50 p-4 dark:bg-teal-950/40" aria-label="Demo workspace guidance">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">Demo workspace</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">This local workspace starts clean. Add today&apos;s check-in, your routine, habits, and meals as you go.</p>
        </div>
        <Link className="inline-flex min-h-10 items-center justify-center rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400 dark:focus-visible:outline-teal-400" href="/today">Add today&apos;s info</Link>
      </div>
    </section>
  );
}
