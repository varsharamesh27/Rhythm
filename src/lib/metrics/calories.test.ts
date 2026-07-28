import { describe, expect, it } from "vitest";
import { summarizeWeeklyCalories } from "./calories";
import type { WeeklyMenuItem } from "@/types/database";

function item(overrides: Partial<WeeklyMenuItem>): WeeklyMenuItem {
  return {
    id: crypto.randomUUID(),
    user_id: crypto.randomUUID(),
    meal_date: "2026-07-27",
    meal_slot: "breakfast",
    meal_name: "Oats",
    planned_calories: 350,
    actual_calories: null,
    created_at: "2026-07-27T12:00:00.000Z",
    updated_at: "2026-07-27T12:00:00.000Z",
    ...overrides
  };
}

describe("summarizeWeeklyCalories", () => {
  it("keeps planned and actual calories separate", () => {
    const summary = summarizeWeeklyCalories([
      item({ actual_calories: 370 }),
      item({ meal_date: "2026-07-28", meal_slot: "lunch", planned_calories: 600, actual_calories: 640 })
    ]);

    expect(summary).toEqual({
      plannedCalories: 950,
      actualCalories: 1010,
      plannedMeals: 2,
      recordedMeals: 2,
      plannedDays: 2
    });
  });

  it("does not count untouched placeholders as planned meals", () => {
    const summary = summarizeWeeklyCalories([
      item({ meal_name: "", planned_calories: 0 }),
      item({ meal_slot: "dinner", meal_name: "Soup", planned_calories: 0 })
    ]);

    expect(summary.plannedMeals).toBe(1);
    expect(summary.recordedMeals).toBe(0);
    expect(summary.plannedDays).toBe(1);
  });
});
