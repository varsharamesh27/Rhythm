import type { MealSlot } from "@/types/database";

export const MEAL_SLOTS: ReadonlyArray<{ value: MealSlot; label: string }> = [
  { value: "breakfast", label: "Breakfast" },
  { value: "forenoon", label: "Forenoon" },
  { value: "lunch", label: "Lunch" },
  { value: "evening", label: "Evening" },
  { value: "dinner", label: "Dinner" }
];
