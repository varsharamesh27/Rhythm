import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmail } from "./sign-in";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const params = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-stone-100 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Private tracker</p>
          <CardTitle className="text-2xl">Sign in to rhythm</CardTitle>
          <p className="text-sm text-stone-600">Use Supabase magic-link auth to keep your check-ins tied only to your account.</p>
        </CardHeader>
        <CardContent>
          <form action={signInWithEmail} className="grid gap-4">
            <Label>Email<Input name="email" type="email" required placeholder="you@example.com" /></Label>
            <Button type="submit">Send magic link</Button>
            {params.message ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">{params.message}</p> : null}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
