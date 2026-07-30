import type { WeeklyMenuItem } from "@/types/database";

export type WeeklyCalorieSummary = {
  plannedCalories: number;
  actualCalories: number;
  plannedMeals: number;
  recordedMeals: number;
  plannedDays: number;
  plannedItems: number;
  recordedItems: number;
};

export function calculateItemCalories(quantity: number, caloriesPerUnit: number): number {
  return Math.round(quantity * caloriesPerUnit);
}

export function summarizeWeeklyCalories(items: WeeklyMenuItem[]): WeeklyCalorieSummary {
  const plannedDays = new Set<string>();
  const plannedMeals = new Set<string>();
  const recordedMeals = new Set<string>();
  let plannedCalories = 0;
  let actualCalories = 0;
  let plannedItems = 0;
  let recordedItems = 0;

  for (const item of items) {
    if (item.meal_name || item.planned_calories > 0) {
      plannedMeals.add(`${item.meal_date}:${item.meal_slot}`);
      plannedDays.add(item.meal_date);
      plannedItems += 1;
    }
    plannedCalories += item.planned_calories;
    if (item.actual_calories !== null) {
      actualCalories += item.actual_calories;
      recordedMeals.add(`${item.meal_date}:${item.meal_slot}`);
      recordedItems += 1;
    }
  }

  return {
    plannedCalories,
    actualCalories,
    plannedMeals: plannedMeals.size,
    recordedMeals: recordedMeals.size,
    plannedDays: plannedDays.size,
    plannedItems,
    recordedItems
  };
}
