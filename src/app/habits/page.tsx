import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { addDaysIso, todayIso } from "@/lib/dates";
import { getCurrentUserId } from "@/lib/db/auth";
import { listHabitLogsForRange, listHabits } from "@/lib/db/habits";
import { habitCompletionForWeek } from "@/lib/metrics/habits";
import type { HabitCategory } from "@/types/database";
import { archiveHabitAction, createHabitAction, toggleHabitAction } from "./actions";

const categories: Array<{ value: HabitCategory; label: string }> = [
  { value: "routine", label: "Routine" },
  { value: "recovery", label: "Recovery" },
  { value: "movement", label: "Movement" },
  { value: "nutrition", label: "Nutrition" },
  { value: "career", label: "Career" }
];

export default async function HabitsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const today = todayIso();
  const weekStart = addDaysIso(today, -6);
  const [habits, logs] = await Promise.all([listHabits(userId), listHabitLogsForRange(userId, weekStart, today)]);
  const completedToday = new Set(logs.filter((log) => log.log_date === today && log.completed).map((log) => log.habit_id));
  const weeklyCompletion = habitCompletionForWeek(habits, logs);

  return (
    <AppShell>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Habits</h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-300">Track routine, recovery, movement, nutrition, and career habits without turning one missed day into a verdict.</p>
        </div>
        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader><CardTitle>Today&apos;s habit list</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              <p className="rounded-md bg-teal-50 dark:bg-teal-950 p-3 text-sm font-medium text-teal-800 dark:text-teal-200">Seven-day target progress: {weeklyCompletion}%</p>
              {habits.length === 0 ? <p className="text-sm text-zinc-600 dark:text-zinc-300">Add your first habit to begin tracking.</p> : null}
              {habits.map((habit) => {
                const done = completedToday.has(habit.id);
                return (
                  <article key={habit.id} className="grid gap-3 rounded-lg border border-rose-200 dark:border-zinc-700 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <h2 className="font-semibold text-zinc-950 dark:text-zinc-50">{habit.name}</h2>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">{habit.category} - target {habit.target_per_week}x/week - {habit.is_active ? "active" : "paused"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {habit.is_active ? (
                        <form action={toggleHabitAction}>
                          <input type="hidden" name="habitId" value={habit.id} />
                          <input type="hidden" name="logDate" value={today} />
                          <input type="hidden" name="completed" value={String(done)} />
                          <Button type="submit" variant={done ? "secondary" : "default"}>{done ? "Done today" : "Mark done"}</Button>
                        </form>
                      ) : null}
                      {habit.is_active ? (
                        <form action={archiveHabitAction}>
                          <input type="hidden" name="habitId" value={habit.id} />
                          <Button type="submit" variant="ghost">Pause</Button>
                        </form>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Add habit</CardTitle></CardHeader>
            <CardContent>
              <form action={createHabitAction} className="grid gap-4">
                <Label>Name<Input name="name" required placeholder="Evening walk" /></Label>
                <Label>Category<Select name="category" defaultValue="routine">{categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</Select></Label>
                <Label>Weekly target<Input name="targetPerWeek" type="number" min="1" max="7" defaultValue="5" /></Label>
                <Button type="submit">Add habit</Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
