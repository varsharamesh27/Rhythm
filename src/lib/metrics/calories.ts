import type { WeeklyMenuItem } from "@/types/database";

export type WeeklyCalorieSummary = {
  plannedCalories: number;
  actualCalories: number;
  plannedMeals: number;
  recordedMeals: number;
  plannedDays: number;
};

export function summarizeWeeklyCalories(items: WeeklyMenuItem[]): WeeklyCalorieSummary {
  const plannedDays = new Set<string>();
  let plannedCalories = 0;
  let actualCalories = 0;
  let plannedMeals = 0;
  let recordedMeals = 0;

  for (const item of items) {
    if (item.meal_name || item.planned_calories > 0) {
      plannedMeals += 1;
      plannedDays.add(item.meal_date);
    }
    plannedCalories += item.planned_calories;
    if (item.actual_calories !== null) {
      actualCalories += item.actual_calories;
      recordedMeals += 1;
    }
  }

  return { plannedCalories, actualCalories, plannedMeals, recordedMeals, plannedDays: plannedDays.size };
}
