import { ArrowRight, AudioWaveform, LockKeyhole } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  hasSupabaseConfiguration,
  isDatabaseSetupRequired,
  isDemoMode
} from "@/lib/demo-mode";
import { enterDemoWorkspace, signInWithEmail } from "./sign-in";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const params = await searchParams;
  const demoMode = isDemoMode();
  const supabaseConfigured = hasSupabaseConfiguration();
  const databaseSetupRequired = isDatabaseSetupRequired();

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-16 text-foreground">
      <div className="absolute right-4 top-4">
        <ThemeToggle compact />
      </div>
      <section className="grid w-full max-w-4xl overflow-hidden rounded-md border border-border bg-card shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:shadow-none md:grid-cols-[0.8fr_1.2fr]">
        <aside className="hidden min-h-[570px] flex-col justify-between bg-foreground p-10 text-background md:flex">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-sm border border-background/30">
              <AudioWaveform size={22} />
            </span>
            <span className="font-display text-2xl font-bold">Rhythm</span>
          </div>
          <div className="max-w-xs border-t border-background/25 pt-7">
            <p className="font-display text-3xl leading-tight">Small steps, kept faithfully.</p>
            <p className="mt-4 text-sm text-background/65">Your personal ledger begins with today.</p>
          </div>
        </aside>
        <div className="p-6 sm:p-10">
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <span className="grid size-10 place-items-center rounded-sm bg-foreground text-background">
              <AudioWaveform size={20} />
            </span>
            <span className="font-display text-xl font-bold">Rhythm</span>
          </div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Private personal ledger</p>
          <h1 className="font-display text-3xl font-semibold">
            {databaseSetupRequired ? "Finish database setup" : "Sign in to rhythm"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {databaseSetupRequired
              ? "Tracking stays paused until durable private storage is connected."
              : demoMode
                ? "Use a clean local ledger while you connect your database."
                : "A secure magic link opens your private workspace."}
          </p>
          <div className="mt-8 grid gap-6">
          {demoMode ? (
            <form action={enterDemoWorkspace} className="grid gap-4 border-y border-border py-5">
              <div>
                <p className="font-semibold">Start with the local demo</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Nothing is uploaded. Your trial entries stay on this computer.</p>
              </div>
              <Button className="justify-between" type="submit">Try demo workspace<ArrowRight size={17} /></Button>
            </form>
          ) : null}
          {databaseSetupRequired ? (
            <div className="border-l-2 border-[hsl(var(--nutrition))] bg-muted p-4 text-sm text-foreground" role="status">
              No tracking data can be submitted from this deployment yet. Connect Supabase and apply the migrations before opening account registration.
            </div>
          ) : null}
          {supabaseConfigured ? (
            <form action={signInWithEmail} className="grid gap-4">
              <Label>Email address<Input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></Label>
              <Button className="gap-2" type="submit"><LockKeyhole size={17} />Send magic link</Button>
              <p className="text-sm leading-6 text-muted-foreground">
                Request one link, then open the newest email in this same browser. New emails create a private workspace.
              </p>
            </form>
          ) : null}
          {params.message ? <p className="border-l-2 border-accent bg-muted p-3 text-sm text-foreground">{params.message}</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
