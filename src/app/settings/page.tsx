import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUserContext } from "@/lib/db/auth";
import { getProfile } from "@/lib/db/profile";
import { saveSettingsAction } from "./actions";

export default async function SettingsPage() {
  const user = await getCurrentUserContext();
  if (!user) redirect("/login");
  const profile = await getProfile(user.id);

  return (
    <AppShell>
      <div className="grid gap-6">
        <div>
          <h1 className="font-display text-4xl font-semibold">Settings</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Set the name and timezone used across your personal workspace.</p>
        </div>
        <Card className="max-w-xl">
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent>
            <form action={saveSettingsAction} className="grid gap-4">
              <Label>Display name<Input name="displayName" defaultValue={profile?.display_name ?? ""} placeholder="Your name" required /></Label>
              <Label>Timezone<Input name="timezone" defaultValue={profile?.timezone ?? "America/New_York"} required /></Label>
              <Button type="submit">Save settings</Button>
            </form>
          </CardContent>
        </Card>
        {user.isAnonymous ? (
          <Card className="max-w-xl">
            <CardHeader><CardTitle>Browser workspace</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm leading-6 text-muted-foreground">
              <p>Rhythm opens this private workspace automatically. There is no email, password, or login screen.</p>
              <p>This workspace belongs to this browser. Clearing this site&apos;s cookies or opening Rhythm in another browser or device creates a different empty workspace.</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
