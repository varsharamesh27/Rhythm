import { ArrowLeft, ArrowRight, AudioWaveform, KeyRound, Mail, RotateCcw } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PENDING_EMAIL_COOKIE } from "@/lib/auth-cookies";
import {
  hasSupabaseConfiguration,
  isDatabaseSetupRequired,
  isDemoMode
} from "@/lib/demo-mode";
import {
  enterDemoWorkspace,
  resendEmailCode,
  signInWithEmail,
  verifyEmailCode
} from "./sign-in";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string; step?: string }> }) {
  const params = await searchParams;
  const demoMode = isDemoMode();
  const supabaseConfigured = hasSupabaseConfiguration();
  const databaseSetupRequired = isDatabaseSetupRequired();
  const pendingEmail = (await cookies()).get(PENDING_EMAIL_COOKIE)?.value;
  const isVerificationStep = params.step === "verify" && Boolean(pendingEmail);

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
                : isVerificationStep
                  ? "Enter the temporary code from your newest email."
                  : "Receive a temporary email code to open your private workspace."}
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
          {supabaseConfigured && !isVerificationStep ? (
            <form action={signInWithEmail} className="grid gap-4">
              <Label>Email address<Input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></Label>
              <Button className="gap-2" type="submit"><Mail size={17} />Send sign-in code</Button>
              <p className="text-sm leading-6 text-muted-foreground">
                New email addresses create their own private workspace. Codes are temporary and can be used only once.
              </p>
            </form>
          ) : null}
          {supabaseConfigured && isVerificationStep ? (
            <div className="grid gap-5">
              <form action={verifyEmailCode} className="grid gap-4">
                <Label>
                  Email code
                  <Input
                    autoComplete="one-time-code"
                    autoFocus
                    inputMode="numeric"
                    maxLength={10}
                    name="token"
                    pattern="[0-9]{6,10}"
                    placeholder="123456"
                    required
                  />
                </Label>
                <Button className="gap-2" type="submit"><KeyRound size={17} />Verify and sign in</Button>
              </form>
              <div className="grid gap-2 border-t border-border pt-5 sm:grid-cols-2">
                <form action={resendEmailCode}>
                  <Button className="w-full gap-2" type="submit" variant="secondary">
                    <RotateCcw size={16} />Send a new code
                  </Button>
                </form>
                <Link
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  href="/login"
                >
                  <ArrowLeft size={16} />Use another email
                </Link>
              </div>
            </div>
          ) : null}
          {params.message ? <p className="border-l-2 border-accent bg-muted p-3 text-sm text-foreground">{params.message}</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
