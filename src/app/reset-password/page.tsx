import { redirect } from "next/navigation";
import { AudioWaveform, KeyRound } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUserId } from "@/lib/db/auth";
import { updatePasswordAction } from "./actions";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect(`/login?mode=forgot&message=${encodeURIComponent("Request a new password reset link.")}`);
  const { message } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-16 text-foreground">
      <div className="absolute right-4 top-4"><ThemeToggle compact /></div>
      <section className="w-full max-w-lg rounded-md border border-border bg-card p-7 shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:shadow-none sm:p-10">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-sm bg-foreground text-background"><AudioWaveform size={22} /></span>
          <span className="font-display text-2xl font-bold">Rhythm</span>
        </div>
        <KeyRound className="mt-9 text-accent" size={26} />
        <h1 className="font-display mt-4 text-3xl font-semibold">Choose a new password</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Use at least 8 characters. Saving returns you to your private workspace.</p>
        <form action={updatePasswordAction} className="mt-7 grid gap-4">
          <Label>New password<Input name="password" type="password" autoComplete="new-password" minLength={8} required /></Label>
          <Label>Confirm new password<Input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required /></Label>
          <Button className="gap-2" type="submit"><KeyRound size={17} />Save new password</Button>
        </form>
        {message ? <p className="mt-5 border-l-2 border-accent bg-muted p-3 text-sm text-foreground" role="status">{message}</p> : null}
      </section>
    </main>
  );
}
