import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { MetricCard } from "@/components/dashboard/metric-card";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserId, listRecentCheckins } from "@/lib/db/checkins";
import { aggregateDashboardMetrics } from "@/lib/metrics/checkins";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const checkins = await listRecentCheckins(userId, 30);
  const metrics = aggregateDashboardMetrics(checkins);

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-stone-600">Your routine, recovery, movement, nutrition, and career signals in one calm view.</p>
          </div>
          <Link className="inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" href="/today">Open today</Link>
        </div>
        {checkins.length === 0 ? (
          <Card><CardHeader><CardTitle>No check-ins yet</CardTitle></CardHeader><CardContent><p className="text-stone-600">Complete today&apos;s check-in to start building your rhythm.</p></CardContent></Card>
        ) : null}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Weekly metrics">
          <MetricCard title="Seven-day habit completion" value={`${metrics.sevenDayHabitCompletion}%`} helper="Workout, yoga, meditation, walking, and study." />
          <MetricCard title="Weekly workout count" value={`${metrics.weeklyWorkoutCount}`} helper="Movement tracked separately from weight." />
          <MetricCard title="Study sessions" value={`${metrics.studySessionCount}`} helper="Career progress through consistent sessions." />
          <MetricCard title="Hydration consistency" value={`${metrics.hydrationConsistency}%`} helper="Days with at least eight cups logged." />
          <MetricCard title="Routine consistency" value={`${metrics.routineConsistency}%`} helper="Sleep quality, energy, mood, and nutrition consistency." />
        </section>
        <DashboardCharts metrics={metrics} />
      </div>
    </AppShell>
  );
}
