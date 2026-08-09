import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Award, CalendarCheck2, Crown, LockKeyhole, Medal, Target, Trophy, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserId } from "@/lib/db/auth";
import { LeaderboardSetupRequiredError, listWeeklyLeaderboard } from "@/lib/db/leaderboard";
import type { LeaderboardEntry } from "@/types/database";
import { getProfile } from "@/lib/db/profile";

export default async function LeaderboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const profile = await getProfile(userId);
  let entries: LeaderboardEntry[] = [];
  let setupRequired = false;
  try {
    entries = await listWeeklyLeaderboard();
  } catch (error) {
    if (!(error instanceof LeaderboardSetupRequiredError)) throw error;
    setupRequired = true;
  }
  const joined = profile?.leaderboard_opt_in ?? false;
  const currentEntry = entries.find((entry) => entry.user_id === userId);

  return (
    <AppShell>
      <div className="grid gap-6">
        <header className="border-b border-border pb-6 sm:flex sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground"><Trophy size={16} />Community challenge</p>
            <h1 className="font-display text-4xl font-semibold">Weekly leaderboard</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">A friendly ranking based on consistency. Scores reset every Monday.</p>
          </div>
          <Link className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:mt-0" href="/settings#leaderboard">
            {joined ? "Leaderboard settings" : "Join the leaderboard"}
          </Link>
        </header>

        {setupRequired ? (
          <Card className="border-l-2 border-l-[hsl(var(--nutrition))]">
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle size={19} />One database step remains</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-6 text-muted-foreground">The leaderboard interface is ready, but migration <span className="font-semibold text-foreground">007_opt_in_leaderboard.sql</span> must be run in the Supabase SQL Editor before members can join or rankings can load.</p></CardContent>
          </Card>
        ) : null}

        {!joined ? (
          <Card className="border-l-2 border-l-primary">
            <CardHeader><CardTitle className="flex items-center gap-2"><Users size={19} />Join when you&apos;re ready</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Participation is optional. Other members see only the public name you choose, your weekly score, check-in count, and habit completion totals—never habit names, notes, health data, or schedule details.</p>
              <Link className="w-fit text-sm font-semibold text-primary hover:underline" href="/settings#leaderboard">Choose a public name and opt in →</Link>
            </CardContent>
          </Card>
        ) : null}

        {currentEntry ? (
          <section className="grid gap-4 sm:grid-cols-3" aria-label="Your leaderboard progress">
            <Stat label="Your rank" value={`#${currentEntry.rank}`} icon={Award} />
            <Stat label="Weekly score" value={`${currentEntry.weekly_score}%`} icon={Target} />
            <Stat label="Check-in days" value={`${currentEntry.checkin_days}/7`} icon={CalendarCheck2} />
          </section>
        ) : null}

        {!setupRequired ? <Card>
          <CardHeader>
            <CardTitle>This week</CardTitle>
            <p className="text-sm text-muted-foreground">70% habit target progress and 30% daily check-in consistency. If no habits are active, the score uses check-ins only.</p>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div className="grid place-items-center gap-3 border-y border-border py-12 text-center">
                <LockKeyhole className="text-muted-foreground" size={28} />
                <div><p className="font-semibold">No participants yet</p><p className="mt-1 text-sm text-muted-foreground">Be the first to join this week&apos;s board.</p></div>
              </div>
            ) : (
              <ol className="divide-y divide-border">
                {entries.map((entry) => {
                  const isCurrentUser = entry.user_id === userId;
                  return (
                    <li className={`grid grid-cols-[3rem_1fr_auto] items-center gap-3 py-4 ${isCurrentUser ? "text-primary" : ""}`} key={entry.user_id}>
                      <span className="grid size-9 place-items-center rounded-full bg-muted font-display font-bold" aria-label={`Rank ${entry.rank}`}>
                        {entry.rank === 1 ? <Crown size={18} /> : entry.rank <= 3 ? <Medal size={18} /> : entry.rank}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{entry.public_name}{isCurrentUser ? " (you)" : ""}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{entry.habit_completions}/{entry.habit_target || 0} habit targets · {entry.checkin_days}/7 check-in days</p>
                      </div>
                      <span className="font-display text-2xl font-semibold tabular-nums">{entry.weekly_score}%</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card> : null}
      </div>
    </AppShell>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Award }) {
  return <Card><CardContent className="flex items-center gap-4 pt-5"><span className="grid size-11 place-items-center rounded-full bg-muted text-primary"><Icon size={20} /></span><div><p className="text-sm text-muted-foreground">{label}</p><p className="font-display text-2xl font-semibold">{value}</p></div></CardContent></Card>;
}
