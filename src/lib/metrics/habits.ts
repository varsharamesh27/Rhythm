import type { Habit, HabitLog } from "@/types/database";

export function habitCompletionForWeek(habits: Habit[], logs: HabitLog[]): number {
  const activeHabits = habits.filter((habit) => habit.is_active);
  const possible = activeHabits.reduce((total, habit) => total + habit.target_per_week, 0);
  if (possible === 0) return 0;

  const completedByHabit = new Map<string, number>();
  logs.forEach((log) => {
    if (!log.completed) return;
    completedByHabit.set(log.habit_id, (completedByHabit.get(log.habit_id) ?? 0) + 1);
  });

  const completed = activeHabits.reduce((total, habit) => total + Math.min(completedByHabit.get(habit.id) ?? 0, habit.target_per_week), 0);
  return Math.round((completed / possible) * 100);
}
