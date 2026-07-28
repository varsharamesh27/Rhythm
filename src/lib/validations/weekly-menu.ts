import { z } from "zod";

export const mealSlotSchema = z.enum(["breakfast", "forenoon", "lunch", "evening", "dinner"]);

const caloriesSchema = z.coerce.number().int("Calories must be a whole number").min(0).max(10000);
const optionalCaloriesSchema = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  caloriesSchema.nullable()
);

export const weeklyMenuItemSchema = z.object({
  mealDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Meal date is invalid"),
  mealSlot: mealSlotSchema,
  mealName: z.string().trim().max(120, "Meal name must be 120 characters or fewer"),
  plannedCalories: caloriesSchema,
  actualCalories: optionalCaloriesSchema
});

export const weeklyMenuSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Week start is invalid"),
  items: z.array(weeklyMenuItemSchema).length(35, "A weekly menu must include all 35 meal slots")
});
