import type { ReactNode } from "react";
import Link from "next/link";
import { AudioWaveform, Compass, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { signOutAction } from "@/app/auth/sign-out";
import { DesktopNavigation, MobileNavigation } from "@/components/layout/app-navigation";
import { isDemoMode } from "@/lib/demo-mode";

export function AppShell({ children }: { children: ReactNode }) {
  const demoMode = isDemoMode();

  return (
    <div className="min-h-screen text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-border bg-card px-6 py-7 lg:block">
        <Link href="/dashboard" className="mb-11 flex items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          <span className="grid size-11 place-items-center rounded-sm border border-foreground bg-foreground text-background">
            <AudioWaveform size={22} strokeWidth={1.7} />
          </span>
          <span>
            <span className="font-display block text-xl font-bold leading-none">Rhythm</span>
            <span className="mt-1 block text-xs text-muted-foreground">Personal ledger</span>
          </span>
        </Link>
        <DesktopNavigation />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="grid gap-2 border-t border-border pt-4">
            <ThemeToggle />
            <form action={signOutAction}>
              <button className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" type="submit">
                <LogOut size={18} />{demoMode ? "Exit demo" : "Sign out"}
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="font-display flex items-center gap-2 text-lg font-bold">
              <AudioWaveform className="text-primary" size={19} />
              Rhythm
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle compact />
              <form action={signOutAction}>
                <button aria-label={demoMode ? "Exit demo" : "Sign out"} className="grid size-10 place-items-center rounded-md border border-border bg-card text-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" title={demoMode ? "Exit demo" : "Sign out"} type="submit">
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
    <section className="mb-7 border-y border-border py-4" aria-label="Demo workspace guidance">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-accent" aria-hidden="true">
            <Compass size={17} />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Demo workspace</p>
            <p className="mt-1 text-sm text-muted-foreground">A clean local ledger for trying your check-in, routine, habits, and meals.</p>
          </div>
        </div>
        <Link className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" href="/today">Add today&apos;s entry</Link>
      </div>
    </section>
  );
}
