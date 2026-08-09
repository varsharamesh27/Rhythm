import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUserId } from "@/lib/db/auth";
import { getProfile } from "@/lib/db/profile";
import { saveSettingsAction } from "./actions";
import { SettingsSubmitButton } from "./submit-button";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const params = await searchParams;
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const profile = await getProfile(userId);

  return (
    <AppShell>
      <div className="grid gap-6">
        <div>
          <h1 className="font-display text-4xl font-semibold">Your Rhythm</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Set the identity and timezone used across your personal workspace.</p>
        </div>
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,36rem)_minmax(16rem,1fr)]">
        <Card>
          <CardHeader><CardTitle>Workspace identity</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-5 text-sm text-muted-foreground">Your first name personalizes the dashboard and navigation. Your email is never used as your name.</p>
            {params.saved === "1" ? <p className="mb-5 rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-medium text-accent" role="status">Settings saved.</p> : null}
            <form action={saveSettingsAction} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Label>First name<Input name="firstName" defaultValue={profile?.first_name ?? ""} autoComplete="given-name" required /></Label>
                <Label>Last name<Input name="lastName" defaultValue={profile?.last_name ?? ""} autoComplete="family-name" required /></Label>
              </div>
              <Label>Timezone<Input name="timezone" defaultValue={profile?.timezone ?? "America/New_York"} required /></Label>
              <section className="grid gap-4 border-t border-border pt-5" id="leaderboard">
                <div>
                  <h2 className="font-display text-lg font-semibold">Community leaderboard</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">Opt in to share only your public name and aggregate weekly progress. Your private entries and health details stay private.</p>
                </div>
                <Label>Public leaderboard name<Input name="leaderboardName" defaultValue={profile?.leaderboard_name ?? profile?.first_name ?? ""} minLength={2} maxLength={40} placeholder="How others will know you" /></Label>
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-muted/50 p-4 text-sm">
                  <input className="mt-1 size-4 accent-[hsl(var(--primary))]" name="leaderboardOptIn" type="checkbox" defaultChecked={profile?.leaderboard_opt_in ?? false} />
                  <span><span className="block font-semibold text-foreground">Show me on the weekly leaderboard</span><span className="mt-1 block leading-5 text-muted-foreground">You can leave at any time. Opting out removes your row from the shared ranking.</span></span>
                </label>
              </section>
              <SettingsSubmitButton />
            </form>
          </CardContent>
        </Card>
        <Card className="lg:sticky lg:top-6">
          <CardHeader><CardTitle>What your community sees</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 p-4">
              <span className="grid size-11 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">{(profile?.leaderboard_name ?? profile?.first_name ?? "Y").slice(0, 1).toUpperCase()}</span>
              <div><p className="font-semibold">{profile?.leaderboard_name ?? profile?.first_name ?? "Your public name"}</p><p className="text-sm text-muted-foreground">Weekly points and rank only</p></div>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{profile?.leaderboard_opt_in ? "You are currently visible on the weekly leaderboard." : "You are currently private. Turn on the leaderboard option and save to join."}</p>
          </CardContent>
        </Card>
        </div>
        {profile?.workspace_role === "owner" ? <p className="text-sm font-medium text-accent">Owner workspace active</p> : null}
      </div>
    </AppShell>
  );
}
