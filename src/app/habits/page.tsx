import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ProgressMeter } from "@/components/ui/progress-meter";
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
          <h1 className="font-display text-4xl font-semibold">Habits</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Track routine, recovery, movement, nutrition, and career habits without turning one missed day into a verdict.</p>
        </div>
        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader><CardTitle>Today&apos;s habit list</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              <ProgressMeter className="rounded-md border border-border bg-muted/40 p-4" label="Seven-day target progress" value={weeklyCompletion} />
              {habits.length === 0 ? <p className="text-sm text-muted-foreground">Add your first habit to begin tracking.</p> : null}
              {habits.map((habit) => {
                const done = completedToday.has(habit.id);
                const completedThisWeek = logs.filter((log) => log.habit_id === habit.id && log.completed).length;
                const habitProgress = Math.min(100, (completedThisWeek / habit.target_per_week) * 100);
                return (
                  <article key={habit.id} className="grid gap-3 rounded-md border border-border p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <h2 className="font-semibold text-foreground">{habit.name}</h2>
                      <p className="text-sm text-muted-foreground">{habit.category} - target {habit.target_per_week}x/week - {habit.is_active ? "active" : "paused"}</p>
                      <div className="mt-3 flex items-center gap-1.5" aria-label={`${completedThisWeek} of ${habit.target_per_week} weekly completions`}>
                        {Array.from({ length: habit.target_per_week }, (_, index) => (
                          <span className={`h-2 flex-1 rounded-full transition-colors ${index < completedThisWeek ? "bg-accent" : "bg-muted"}`} key={index} />
                        ))}
                        <span className="ml-2 text-xs font-semibold tabular-nums text-muted-foreground">{Math.round(habitProgress)}%</span>
                      </div>
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
