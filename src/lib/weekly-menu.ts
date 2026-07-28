import type { MealSlot } from "@/types/database";

export const MEAL_SLOTS: ReadonlyArray<{ value: MealSlot; label: string }> = [
  { value: "breakfast", label: "Breakfast" },
  { value: "forenoon", label: "Forenoon" },
  { value: "lunch", label: "Lunch" },
  { value: "evening", label: "Evening" },
  { value: "dinner", label: "Dinner" }
];

export type WeeklyMenuField = "mealName" | "plannedCalories" | "actualCalories";

export function weeklyMenuFieldName(date: string, slot: MealSlot, field: WeeklyMenuField): string {
  return `${field}:${date}:${slot}`;
}
