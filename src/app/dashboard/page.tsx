import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarCheck2,
  Dumbbell,
  GlassWater,
  ListChecks,
  NotebookPen,
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
  const [checkins, habits, habitLogs, scheduleEntries, weeklyMenuItems] = await Promise.all([
    listRecentCheckins(userId, 30),
    listHabits(userId),
    listHabitLogsForRange(userId, weekStart, today),
    listRecentScheduleEntries(userId, weekStart, today),
    listWeeklyMenuItems(userId, menuWeekStart, menuWeekEnd)
  ]);
  const metrics = aggregateDashboardMetrics(checkins);
  const trackedHabitCompletion = habitCompletionForWeek(habits, habitLogs);
  const scheduleAdherence = calculateScheduleAdherence(scheduleEntries);
  const calorieSummary = summarizeWeeklyCalories(weeklyMenuItems);
  const categoryScores = aggregateCategoryScores(checkins.slice(-7), scheduleAdherence);

  return (
    <AppShell>
      <div className="grid gap-6">
        <header className="border-l-4 border-l-rose-500 pl-5 sm:flex sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">Your last seven days</p>
            <h1 className="text-3xl font-bold tracking-normal">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-300">Your routine, recovery, movement, nutrition, and career signals in one calm view.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
            <Link className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800" href="/habits">Open habits</Link>
            <Link className="inline-flex min-h-10 items-center justify-center rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600" href="/today">Open today</Link>
          </div>
        </header>
        {checkins.length === 0 && habits.length === 0 ? (
          <Card><CardHeader><CardTitle>Start with today</CardTitle></CardHeader><CardContent><p className="text-zinc-600 dark:text-zinc-300">Complete a daily check-in or add a habit to begin building your rhythm.</p></CardContent></Card>
        ) : null}
        <CategorySpectrum scores={categoryScores} />
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Weekly metrics">
          <MetricCard title="Tracked habit completion" value={`${trackedHabitCompletion}%`} helper="Your custom weekly habit targets." tone="routine" icon={Repeat2} />
          <MetricCard title="Check-in habit completion" value={`${metrics.sevenDayHabitCompletion}%`} helper="Workout, yoga, meditation, walking, and study." tone="recovery" icon={ListChecks} />
          <MetricCard title="Schedule adherence" value={`${scheduleAdherence}%`} helper="Completed planned blocks from the last seven days." tone="routine" icon={CalendarCheck2} />
          <MetricCard title="Weekly workout count" value={`${metrics.weeklyWorkoutCount}`} helper="Movement tracked separately from weight." tone="movement" icon={Dumbbell} />
          <MetricCard title="Study sessions" value={`${metrics.studySessionCount}`} helper="Career progress through consistent sessions." tone="career" icon={NotebookPen} />
          <MetricCard title="Hydration consistency" value={`${metrics.hydrationConsistency}%`} helper="Days with at least eight cups logged." tone="recovery" icon={GlassWater} />
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
