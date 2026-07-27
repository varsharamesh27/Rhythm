import { redirect } from "next/navigation";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { MetricCard } from "@/components/dashboard/metric-card";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserId } from "@/lib/db/auth";
import { listRecentCheckins } from "@/lib/db/checkins";
import { aggregateDashboardMetrics } from "@/lib/metrics/checkins";

export default async function HealthPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const checkins = await listRecentCheckins(userId, 30);
  const metrics = aggregateDashboardMetrics(checkins);
  const latest = checkins.at(-1);
  const averageEnergy = average(checkins.map((checkin) => checkin.energy));
  const averageNutrition = average(checkins.map((checkin) => checkin.nutrition_adherence));

  return (
    <AppShell>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Health</h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-300">Recovery, movement, hydration, nutrition, mood, energy, and optional weight trends. Weight is one signal, not the scoreboard.</p>
        </div>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Latest mood" value={latest ? `${latest.mood}/5` : "--"} helper="Logged from your daily check-in." />
          <MetricCard title="Average energy" value={averageEnergy ? `${averageEnergy.toFixed(1)}/5` : "--"} helper="Last 30 check-ins." />
          <MetricCard title="Nutrition consistency" value={averageNutrition ? `${averageNutrition.toFixed(1)}/5` : "--"} helper="Plan adherence without shame wording." />
          <MetricCard title="Hydration consistency" value={`${metrics.hydrationConsistency}%`} helper="Days at eight or more cups recently." />
        </section>
        <DashboardCharts metrics={metrics} />
        <Card>
          <CardHeader><CardTitle>Recent body signals</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {checkins.length === 0 ? <p className="text-sm text-zinc-600 dark:text-zinc-300">No health check-ins yet.</p> : (
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-zinc-600 dark:text-zinc-300"><tr><th className="py-2">Date</th><th>Mood</th><th>Energy</th><th>Water</th><th>Workout</th><th>Walking</th><th>Study</th><th>Weight</th></tr></thead>
                <tbody>{checkins.slice(-10).reverse().map((checkin) => <tr key={checkin.id} className="border-t border-rose-200 dark:border-zinc-700"><td className="py-3">{checkin.checkin_date}</td><td>{checkin.mood}/5</td><td>{checkin.energy}/5</td><td>{checkin.water_intake}</td><td>{checkin.workout_completed ? "Yes" : "No"}</td><td>{checkin.walking_completed ? "Yes" : "No"}</td><td>{checkin.study_completed ? "Yes" : "No"}</td><td>{checkin.weight ?? "--"}</td></tr>)}</tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}
