import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarCheck2,
  Dumbbell,
  GlassWater,
  ListChecks,
  ListTodo,
  NotebookPen,
  PenLine,
  Repeat2,
  UtensilsCrossed
} from "lucide-react";
import { CategorySpectrum } from "@/components/dashboard/category-spectrum";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { MetricCard } from "@/components/dashboard/metric-card";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addDaysIso, mondayWeekStartIso, todayIso } from "@/lib/dates";
import { getCurrentUserId } from "@/lib/db/auth";
import { getProfile } from "@/lib/db/profile";
import { listRecentCheckins } from "@/lib/db/checkins";
import { listHabitLogsForRange, listHabits } from "@/lib/db/habits";
import { listRecentScheduleEntries } from "@/lib/db/schedule";
import { listWeeklyMenuItems } from "@/lib/db/weekly-menu";
import { summarizeWeeklyCalories } from "@/lib/metrics/calories";
import { aggregateCategoryScores, aggregateDashboardMetrics } from "@/lib/metrics/checkins";
import { habitCompletionForWeek } from "@/lib/metrics/habits";
import { calculateScheduleAdherence } from "@/lib/metrics/schedule";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const today = todayIso();
  const weekStart = addDaysIso(today, -6);
  const menuWeekStart = mondayWeekStartIso(today);
  const menuWeekEnd = addDaysIso(menuWeekStart, 6);
  const [checkins, habits, habitLogs, scheduleEntries, weeklyMenuItems, profile] = await Promise.all([
    listRecentCheckins(userId, 30),
    listHabits(userId),
    listHabitLogsForRange(userId, weekStart, today),
    listRecentScheduleEntries(userId, weekStart, today),
    listWeeklyMenuItems(userId, menuWeekStart, menuWeekEnd),
    getProfile(userId)
  ]);
  const metrics = aggregateDashboardMetrics(checkins);
  const trackedHabitCompletion = habitCompletionForWeek(habits, habitLogs);
  const scheduleAdherence = calculateScheduleAdherence(scheduleEntries);
  const calorieSummary = summarizeWeeklyCalories(weeklyMenuItems);
  const categoryScores = aggregateCategoryScores(checkins.slice(-7), scheduleAdherence);

  return (
    <AppShell>
      <div className="grid gap-6">
        <header className="border-b border-border pb-6 sm:flex sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Overview · {formatDashboardDate(today)}</p>
            <h1 className="font-display text-4xl font-semibold">{profile?.first_name?.trim() ? `Welcome back, ${profile.first_name.trim()}` : "Your dashboard"}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">A measured view of routine, recovery, movement, nutrition, and career.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
            <Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" href="/habits"><ListTodo size={17} />Review habits</Link>
            <Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" href="/today"><PenLine size={17} />Log today</Link>
          </div>
        </header>
        {checkins.length === 0 && habits.length === 0 ? (
          <Card className="border-l-2 border-l-primary"><CardHeader><CardTitle>Begin today&apos;s page</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Complete a daily check-in or add a habit to begin building your rhythm.</p></CardContent></Card>
        ) : null}
        <CategorySpectrum scores={categoryScores} />
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Weekly metrics">
          <MetricCard title="Tracked habit completion" value={`${trackedHabitCompletion}%`} helper="Your custom weekly habit targets." tone="routine" icon={Repeat2} />
          <MetricCard title="Check-in habit completion" value={`${metrics.sevenDayHabitCompletion}%`} helper="Workout, yoga, meditation, walking, and study." tone="recovery" icon={ListChecks} />
          <MetricCard title="Schedule adherence" value={`${scheduleAdherence}%`} helper="Completed planned blocks from the last seven days." tone="routine" icon={CalendarCheck2} />
          <MetricCard title="Weekly workout count" value={`${metrics.weeklyWorkoutCount}`} helper="Movement tracked separately from weight." tone="movement" icon={Dumbbell} />
          <MetricCard title="Study sessions" value={`${metrics.studySessionCount}`} helper="Career progress through consistent sessions." tone="career" icon={NotebookPen} />
          <MetricCard title="Hydration consistency" value={`${metrics.hydrationConsistency}%`} helper="Days with at least eight 250 mL glasses logged." tone="recovery" icon={GlassWater} />
          <MetricCard
            title="Calories recorded"
            value={calorieSummary.recordedMeals > 0 ? `${calorieSummary.actualCalories.toLocaleString()} kcal` : "Not logged"}
            helper={`${calorieSummary.plannedCalories.toLocaleString()} kcal planned this week.`}
            tone="nutrition"
            icon={UtensilsCrossed}
          />
        </section>
        <DashboardCharts metrics={metrics} />
      </div>
    </AppShell>
  );
}

function formatDashboardDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(new Date(`${date}T12:00:00`));
}
