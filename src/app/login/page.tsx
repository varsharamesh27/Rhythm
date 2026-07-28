import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <main className="grid min-h-screen place-items-center px-4 py-10 text-zinc-950 dark:text-zinc-50">
      <div className="absolute right-4 top-4">
        <ThemeToggle compact />
      </div>
      <Card className="w-full max-w-md border-t-4 border-t-rose-500 dark:border-t-teal-400">
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">Private tracker</p>
          <CardTitle className="text-2xl">
            {databaseSetupRequired ? "Finish private database setup" : "Sign in to rhythm"}
          </CardTitle>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {databaseSetupRequired
              ? "Production tracking is paused until durable private storage is connected."
              : demoMode
                ? "Use the clean local demo workspace while you set up your database."
                : "Use the secure magic link sent to your owner email."}
          </p>
        </CardHeader>
        <CardContent className="grid gap-5">
          {demoMode ? (
            <form action={enterDemoWorkspace} className="grid gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-zinc-800">
              <div>
                <p className="font-semibold text-zinc-950 dark:text-zinc-50">New here? Try the demo.</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Open an empty workspace, add today&apos;s information, and watch the dashboard update locally.</p>
              </div>
              <Button type="submit">Try demo workspace</Button>
            </form>
          ) : null}
          {databaseSetupRequired ? (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-zinc-800 dark:border-amber-700 dark:bg-zinc-800 dark:text-zinc-100" role="status">
              No tracking data can be submitted from this deployment yet. Connect the Supabase project, apply the migrations, and then sign in with your owner email.
            </div>
          ) : null}
          {supabaseConfigured ? (
            <form action={signInWithEmail} className="grid gap-4">
              <Label>Email<Input name="email" type="email" required placeholder="you@example.com" /></Label>
              <Button type="submit">Send magic link</Button>
            </form>
          ) : null}
          {params.message ? <p className="rounded-md bg-teal-50 p-3 text-sm text-teal-800 dark:bg-teal-950 dark:text-teal-200">{params.message}</p> : null}
        </CardContent>
      </Card>
    </main>
  );
}
