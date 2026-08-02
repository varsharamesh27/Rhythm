import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  AudioWaveform,
  KeyRound,
  LogIn,
  UserPlus
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  hasSupabaseConfiguration,
  isDatabaseSetupRequired,
  isDemoMode
} from "@/lib/demo-mode";
import {
  enterDemoWorkspace,
  requestPasswordReset,
  signInWithPassword,
  signUpWithPassword
} from "./sign-in";

type LoginMode = "login" | "signup" | "forgot";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const mode = parseMode(params.mode);
  const demoMode = isDemoMode();
  const supabaseConfigured = hasSupabaseConfiguration();
  const databaseSetupRequired = isDatabaseSetupRequired();

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-16 text-foreground">
      <div className="absolute right-4 top-4"><ThemeToggle compact /></div>
      <section className="grid w-full max-w-4xl overflow-hidden rounded-md border border-border bg-card shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:shadow-none md:grid-cols-[0.8fr_1.2fr]">
        <aside className="hidden min-h-[590px] flex-col justify-between bg-foreground p-10 text-background md:flex">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-sm border border-background/30"><AudioWaveform size={22} /></span>
            <span className="font-display text-2xl font-bold">Rhythm</span>
          </div>
          <div className="max-w-xs border-t border-background/25 pt-7">
            <p className="font-display text-3xl leading-tight">Build a life with a rhythm that feels like yours.</p>
            <p className="mt-4 text-sm text-background/65">A private place for your routines, recovery, movement, meals, and growth.</p>
          </div>
        </aside>

        <div className="p-6 sm:p-10">
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <span className="grid size-10 place-items-center rounded-sm bg-foreground text-background"><AudioWaveform size={20} /></span>
            <span className="font-display text-xl font-bold">Rhythm</span>
          </div>

          <p className="mb-2 text-sm font-medium text-muted-foreground">Your private rhythm</p>
          <h1 className="font-display text-3xl font-semibold">
            {databaseSetupRequired
              ? "Finish database setup"
              : mode === "signup"
                ? "Create your account"
                : mode === "forgot"
                  ? "Reset your password"
                  : "Log in to Rhythm"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {databaseSetupRequired
              ? "Tracking stays paused until durable private storage is connected."
              : mode === "signup"
                ? "Choose the credentials that will protect and preserve your workspace."
                : mode === "forgot"
                  ? "Supabase will send a secure reset link to the account email."
                : "Continue with the email and password that keep your Rhythm personal to you."}
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
                Connect Supabase and apply the migrations before opening account registration.
              </div>
            ) : null}

            {supabaseConfigured && mode !== "forgot" ? (
              <nav className="grid grid-cols-2 border-b border-border" aria-label="Account access">
                <Link
                  aria-current={mode === "login" ? "page" : undefined}
                  className={`border-b-2 px-3 py-3 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${mode === "login" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  href="/login"
                >
                  Log in
                </Link>
                <Link
                  aria-current={mode === "signup" ? "page" : undefined}
                  className={`border-b-2 px-3 py-3 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${mode === "signup" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  href="/login?mode=signup"
                >
                  Create account
                </Link>
              </nav>
            ) : null}

            {supabaseConfigured && mode === "login" ? (
              <form action={signInWithPassword} className="grid gap-4">
                <Label>Email address<Input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></Label>
                <Label>Password<Input name="password" type="password" autoComplete="current-password" minLength={8} required /></Label>
                <div className="flex justify-end">
                  <Link className="text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" href="/login?mode=forgot">Forgot password?</Link>
                </div>
                <Button className="gap-2" type="submit"><LogIn size={17} />Log in</Button>
              </form>
            ) : null}

            {supabaseConfigured && mode === "signup" ? (
              <form action={signUpWithPassword} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Label>First name<Input name="firstName" autoComplete="given-name" required placeholder="First name" /></Label>
                  <Label>Last name<Input name="lastName" autoComplete="family-name" required placeholder="Last name" /></Label>
                </div>
                <Label>Email address<Input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></Label>
                <Label>Choose password<Input name="password" type="password" autoComplete="new-password" minLength={8} required /></Label>
                <Label>Confirm password<Input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required /></Label>
                <p className="text-sm text-muted-foreground">Use at least 8 characters. Your password is handled by Supabase and is never stored in Rhythm.</p>
                <Button className="gap-2" type="submit"><UserPlus size={17} />Create account</Button>
                <p className="text-sm text-muted-foreground">Already used this email in Rhythm? <Link className="font-semibold text-foreground hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" href="/login?mode=forgot">Set a password</Link>.</p>
              </form>
            ) : null}

            {supabaseConfigured && mode === "forgot" ? (
              <form action={requestPasswordReset} className="grid gap-4">
                <Label>Account email<Input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></Label>
                <Button className="gap-2" type="submit"><KeyRound size={17} />Send reset link</Button>
                <Link className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" href="/login">
                  <ArrowLeft size={16} />Back to login
                </Link>
              </form>
            ) : null}

            {params.message ? <p className="border-l-2 border-accent bg-muted p-3 text-sm text-foreground" role="status">{params.message}</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function parseMode(mode: string | undefined): LoginMode {
  if (mode === "signup" || mode === "forgot") return mode;
  return "login";
}
