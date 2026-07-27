import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isDemoMode } from "@/lib/demo-mode";
import { enterDemoWorkspace, signInWithEmail } from "./sign-in";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const params = await searchParams;
  const demoMode = isDemoMode();

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md border-t-4 border-t-rose-500">
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Private tracker</p>
          <CardTitle className="text-2xl">Sign in to rhythm</CardTitle>
          <p className="text-sm text-zinc-600">Use Supabase magic-link auth, or try the local demo workspace while you set up your database.</p>
        </CardHeader>
        <CardContent className="grid gap-5">
          {demoMode ? (
            <form action={enterDemoWorkspace} className="grid gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div>
                <p className="font-semibold text-zinc-950">New here? Try the demo.</p>
                <p className="mt-1 text-sm text-zinc-600">Open a seeded workspace, add today&apos;s information, and watch the dashboard update locally.</p>
              </div>
              <Button type="submit">Try demo workspace</Button>
            </form>
          ) : null}
          <form action={signInWithEmail} className="grid gap-4">
            <Label>Email<Input name="email" type="email" required placeholder="you@example.com" /></Label>
            <Button type="submit" variant={demoMode ? "secondary" : "default"}>Send magic link</Button>
            {params.message ? <p className="rounded-md bg-teal-50 p-3 text-sm text-teal-800">{params.message}</p> : null}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
