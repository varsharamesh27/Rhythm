import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  HeartPulse,
  ListChecks,
  ShieldCheck,
  UtensilsCrossed
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserId } from "@/lib/db/auth";
import { getProfile, isWorkspaceOwner } from "@/lib/db/profile";

const ownerLinks = [
  { href: "/today", label: "Today", detail: "Capture the day as it happened.", icon: ListChecks },
  { href: "/schedule", label: "Schedule", detail: "Shape the routine you want to follow.", icon: CalendarDays },
  { href: "/weekly-menu", label: "Weekly menu", detail: "Plan meals and record portions.", icon: UtensilsCrossed },
  { href: "/health", label: "Health", detail: "Review recovery and body signals.", icon: HeartPulse },
  { href: "/insights", label: "Insights", detail: "Turn your records into gentle patterns.", icon: ChartNoAxesColumnIncreasing }
];

export default async function OwnerPage() {
  const userId = await getCurrentUserId();
  if (!userId || !(await isWorkspaceOwner(userId))) redirect("/dashboard");
  const profile = await getProfile(userId);
  const name = profile?.display_name?.trim() || "Owner";

  return (
    <AppShell>
      <div className="grid gap-6">
        <header className="border-b border-border pb-6">
          <div className="flex items-center gap-3 text-accent"><ShieldCheck size={22} /><p className="text-sm font-semibold">Owner workspace</p></div>
          <h1 className="font-display mt-3 text-4xl font-semibold">{name}&apos;s Rhythm</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">A focused home for everything you&apos;re building, one day at a time.</p>
        </header>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Owner workspace features">
          {ownerLinks.map(({ href, label, detail, icon: Icon }) => (
            <Link className="rounded-md border border-border bg-card p-5 transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" href={href} key={href}>
              <Icon className="text-primary" size={21} />
              <h2 className="font-display mt-5 text-xl font-semibold text-foreground">{label}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
            </Link>
          ))}
        </section>
        <Card className="max-w-2xl border-l-2 border-l-accent">
          <CardHeader><CardTitle>Privacy stays personal</CardTitle></CardHeader>
          <CardContent><p className="text-sm leading-6 text-muted-foreground">Owner status personalizes and protects your workspace. It does not grant access to another person&apos;s health, habit, schedule, or meal records.</p></CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
