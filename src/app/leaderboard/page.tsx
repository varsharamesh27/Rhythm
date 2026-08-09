import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ChevronDown, Crown, Flame, LockKeyhole, Medal, Trophy, Users } from "lucide-react";
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
            <p className="mt-2 max-w-2xl text-muted-foreground">Earn up to 100 points through consistent action. Each Monday begins a new leaderboard.</p>
          </div>
          <Link className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:mt-0" href="/settings#leaderboard">
            {joined ? "Leaderboard settings" : "Join the leaderboard"}
          </Link>
        </header>

        {setupRequired ? (
          <Card className="border-l-2 border-l-[hsl(var(--nutrition))]">
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle size={19} />One database step remains</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-6 text-muted-foreground">The points leaderboard is ready, but migration <span className="font-semibold text-foreground">008_weekly_points_leaderboard.sql</span> must be run in the Supabase SQL Editor before rankings can load.</p></CardContent>
          </Card>
        ) : null}

        {!joined ? (
          <Card className="border-l-2 border-l-primary">
            <CardHeader><CardTitle className="flex items-center gap-2"><Users size={19} />Join when you&apos;re ready</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Participation is optional. Other members see only the public name you choose, total points, category points, and check-in count—never habit names, notes, health data, or schedule details.</p>
              <Link className="w-fit text-sm font-semibold text-primary hover:underline" href="/settings#leaderboard">Choose a public name and opt in →</Link>
            </CardContent>
          </Card>
        ) : null}

        {currentEntry ? <CurrentProgress entry={currentEntry} /> : null}

        {!setupRequired ? <section className="grid gap-3 sm:grid-cols-5" aria-label="Weekly point weights">
          <PointWeight label="Routine" points={40} detail="Check-ins, schedule, habits" />
          <PointWeight label="Recovery" points={20} detail="Sleep, energy, habits" />
          <PointWeight label="Movement" points={15} detail="6 active days: 3+ gym, walks on the rest" />
          <PointWeight label="Nutrition" points={15} detail="Nutrition, habits, hydration" />
          <PointWeight label="Career" points={10} detail="Habits and study" />
        </section> : null}

        {!setupRequired && entries.length > 0 ? <Podium entries={entries.slice(0, 3)} userId={userId} /> : null}

        {!setupRequired ? <Card>
          <CardHeader>
            <CardTitle>This week</CardTitle>
            <p className="text-sm text-muted-foreground">Monday through Sunday. Rankings use total points, then routine points, then check-in days to break ties.</p>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div className="grid place-items-center gap-3 border-y border-border py-12 text-center">
                <LockKeyhole className="text-muted-foreground" size={28} />
                <div><p className="font-semibold">No participants yet</p><p className="mt-1 text-sm text-muted-foreground">Be the first to join this week&apos;s board.</p></div>
              </div>
            ) : (
              <ol className="grid gap-3">
                {entries.map((entry) => <LeaderboardRow entry={entry} isCurrentUser={entry.user_id === userId} key={entry.user_id} />)}
              </ol>
            )}
          </CardContent>
        </Card> : null}
      </div>
    </AppShell>
  );
}

const categories = [
  { key: "routine_points", label: "Routine", maximum: 40, color: "hsl(var(--routine))" },
  { key: "recovery_points", label: "Recovery", maximum: 20, color: "hsl(var(--recovery))" },
  { key: "movement_points", label: "Movement", maximum: 15, color: "hsl(var(--movement))" },
  { key: "nutrition_points", label: "Nutrition", maximum: 15, color: "hsl(var(--nutrition))" },
  { key: "career_points", label: "Career", maximum: 10, color: "hsl(var(--career))" }
] as const;

function CurrentProgress({ entry }: { entry: LeaderboardEntry }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[18rem_1fr]" aria-label="Your leaderboard progress">
      <Card className="overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card">
        <CardContent className="grid place-items-center gap-4 pt-6 text-center">
          <ScoreRing score={entry.weekly_score} />
          <div><p className="flex items-center justify-center gap-2 font-semibold"><Flame size={17} className="text-primary" />Your weekly momentum</p><p className="mt-1 text-sm text-muted-foreground">Rank #{entry.rank} · {entry.checkin_days}/7 check-in days</p></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center justify-between gap-4"><span>Your point mix</span><span className="text-sm font-medium text-muted-foreground">Click a participant below for details</span></CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          {categories.map((category) => <CategoryBar category={category} entry={entry} key={category.key} />)}
        </CardContent>
      </Card>
    </section>
  );
}

function ScoreRing({ score }: { score: number }) {
  const degrees = Math.min(100, Math.max(0, score)) * 3.6;
  return <div className="grid size-36 place-items-center rounded-full p-3 shadow-inner" style={{ background: `conic-gradient(hsl(var(--primary)) ${degrees}deg, hsl(var(--muted)) 0deg)` }}><div className="grid size-full place-items-center rounded-full bg-card"><div><p className="font-display text-4xl font-semibold tabular-nums">{score}</p><p className="text-xs font-medium text-muted-foreground">of 100 points</p></div></div></div>;
}

function CategoryBar({ category, entry }: { category: typeof categories[number]; entry: LeaderboardEntry }) {
  const value = entry[category.key];
  return <div><div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><span className="font-medium">{category.label}</span><span className="tabular-nums text-muted-foreground">{value}/{category.maximum}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full transition-[width] duration-500" style={{ backgroundColor: category.color, width: `${Math.min(100, value / category.maximum * 100)}%` }} /></div></div>;
}

function Podium({ entries, userId }: { entries: LeaderboardEntry[]; userId: string }) {
  return <section aria-labelledby="podium-title"><div className="mb-4 flex items-center gap-2"><Crown size={19} className="text-[hsl(var(--nutrition))]" /><h2 className="font-display text-xl font-semibold" id="podium-title">This week&apos;s leaders</h2></div><div className="grid gap-3 sm:grid-cols-3">{entries.map((entry) => <Card className={entry.rank === 1 ? "border-primary/50 bg-primary/5 sm:-translate-y-2" : ""} key={entry.user_id}><CardContent className="grid place-items-center gap-2 pt-5 text-center"><span className="grid size-11 place-items-center rounded-full bg-muted text-primary">{entry.rank === 1 ? <Crown size={21} /> : <Medal size={21} />}</span><p className="font-semibold">{entry.public_name}{entry.user_id === userId ? " (you)" : ""}</p><p className="font-display text-3xl font-semibold tabular-nums">{entry.weekly_score}</p><p className="text-xs text-muted-foreground">points · rank #{entry.rank}</p></CardContent></Card>)}</div></section>;
}

function LeaderboardRow({ entry, isCurrentUser }: { entry: LeaderboardEntry; isCurrentUser: boolean }) {
  return <li><details className={`group rounded-lg border transition-colors open:bg-muted/20 ${isCurrentUser ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30"}`}><summary className="grid cursor-pointer list-none grid-cols-[3rem_1fr_auto_auto] items-center gap-3 p-4"><span className="grid size-9 place-items-center rounded-full bg-muted font-display font-bold" aria-label={`Rank ${entry.rank}`}>{entry.rank === 1 ? <Crown size={18} /> : entry.rank <= 3 ? <Medal size={18} /> : entry.rank}</span><div><p className="font-semibold text-foreground">{entry.public_name}{isCurrentUser ? " (you)" : ""}</p><p className="mt-1 text-xs text-muted-foreground">{entry.checkin_days}/7 check-in days</p></div><span className="font-display text-2xl font-semibold tabular-nums">{entry.weekly_score}<span className="ml-1 text-xs font-sans text-muted-foreground">pts</span></span><ChevronDown className="text-muted-foreground transition-transform group-open:rotate-180" size={18} /></summary><div className="grid gap-3 border-t border-border px-4 py-4 sm:grid-cols-5">{categories.map((category) => <CategoryBar category={category} entry={entry} key={category.key} />)}</div></details></li>;
}

function PointWeight({ label, points, detail }: { label: string; points: number; detail: string }) {
  return <Card><CardContent className="pt-4"><p className="text-sm font-semibold">{label}</p><p className="mt-1 font-display text-2xl font-semibold text-primary">{points} pts</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p></CardContent></Card>;
}
