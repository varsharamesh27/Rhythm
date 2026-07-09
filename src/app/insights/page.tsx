import { redirect } from "next/navigation";
import { MetricCard } from "@/components/dashboard/metric-card";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addDaysIso, todayIso, weekStartIso } from "@/lib/dates";
import { getCurrentUserId } from "@/lib/db/auth";
import { listRecentCheckins } from "@/lib/db/checkins";
import { listRecentScheduleEntries } from "@/lib/db/schedule";
import { listGoals, listWeeklyReviews } from "@/lib/db/reviews";
import { aggregateDashboardMetrics } from "@/lib/metrics/checkins";
import { calculateScheduleAdherence } from "@/lib/metrics/schedule";
import type { HabitCategory } from "@/types/database";
import { createGoalAction, saveWeeklyReviewAction } from "./actions";

const categories: Array<{ value: HabitCategory; label: string }> = [
  { value: "routine", label: "Routine" },
  { value: "recovery", label: "Recovery" },
  { value: "movement", label: "Movement" },
  { value: "nutrition", label: "Nutrition" },
  { value: "career", label: "Career" }
];

export default async function InsightsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const today = todayIso();
  const weekStart = weekStartIso(today);
  const [checkins, scheduleEntries, goals, reviews] = await Promise.all([
    listRecentCheckins(userId, 30),
    listRecentScheduleEntries(userId, addDaysIso(today, -6), today),
    listGoals(userId),
    listWeeklyReviews(userId)
  ]);
  const metrics = aggregateDashboardMetrics(checkins);
  const scheduleAdherence = calculateScheduleAdherence(scheduleEntries);
  const activeGoals = goals.filter((goal) => goal.status === "active");

  return (
    <AppShell>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Insights</h1>
          <p className="mt-2 max-w-2xl text-zinc-600">Transparent summaries from your logs. No AI model is connected yet.</p>
        </div>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Routine consistency" value={`${metrics.routineConsistency}%`} helper="Sleep quality, mood, energy, and nutrition." />
          <MetricCard title="Movement follow-through" value={`${metrics.weeklyWorkoutCount}`} helper="Workouts in the recent seven-day window." />
          <MetricCard title="Career sessions" value={`${metrics.studySessionCount}`} helper="Study sessions completed recently." />
          <MetricCard title="Schedule adherence" value={`${scheduleAdherence}%`} helper="Completed planned blocks in the recent window." />
        </section>
        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader><CardTitle>Weekly review</CardTitle></CardHeader>
            <CardContent>
              <form action={saveWeeklyReviewAction} className="grid gap-4">
                <Label>Week start<Input name="weekStart" type="date" defaultValue={weekStart} required /></Label>
                <Label>Routine<Textarea name="routineSummary" placeholder="What routine patterns helped?" /></Label>
                <Label>Recovery<Textarea name="recoverySummary" placeholder="Sleep, rest, and energy notes." /></Label>
                <Label>Movement<Textarea name="movementSummary" placeholder="Workout, yoga, meditation, and walking notes." /></Label>
                <Label>Nutrition<Textarea name="nutritionSummary" placeholder="Hydration and nutrition consistency notes." /></Label>
                <Label>Career<Textarea name="careerSummary" placeholder="Study and deep-work notes." /></Label>
                <Label>Next focus<Textarea name="nextWeekFocus" placeholder="One kind next step for the upcoming week." /></Label>
                <Button type="submit">Save review</Button>
              </form>
            </CardContent>
          </Card>
          <div className="grid gap-4">
            <Card>
              <CardHeader><CardTitle>Add goal</CardTitle></CardHeader>
              <CardContent>
                <form action={createGoalAction} className="grid gap-4">
                  <Label>Goal<Input name="title" placeholder="Walk four days this week" required /></Label>
                  <Label>Category<Select name="category" defaultValue="routine">{categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</Select></Label>
                  <Label>Target date<Input name="targetDate" type="date" /></Label>
                  <Button type="submit">Add goal</Button>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Active goals</CardTitle></CardHeader>
              <CardContent className="grid gap-3">
                {activeGoals.length === 0 ? <p className="text-sm text-zinc-600">No active goals yet.</p> : null}
                {activeGoals.map((goal) => <div key={goal.id} className="rounded-md bg-orange-50 p-3"><p className="font-medium text-zinc-950">{goal.title}</p><p className="text-sm text-zinc-600">{goal.category}{goal.target_date ? ` Â· ${goal.target_date}` : ""}</p></div>)}
              </CardContent>
            </Card>
          </div>
        </section>
        <Card>
          <CardHeader><CardTitle>Past reviews</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {reviews.length === 0 ? <p className="text-sm text-zinc-600">Weekly reviews you save will appear here.</p> : null}
            {reviews.map((review) => <article key={review.id} className="rounded-lg border border-rose-200 p-4"><h2 className="font-semibold">Week of {review.week_start}</h2><p className="mt-2 text-sm text-zinc-600">{review.next_week_focus ?? review.routine_summary ?? "Review saved."}</p></article>)}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
