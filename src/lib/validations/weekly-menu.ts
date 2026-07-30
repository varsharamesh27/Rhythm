import { z } from "zod";

export const mealSlotSchema = z.enum(["breakfast", "forenoon", "lunch", "evening", "dinner"]);

const quantitySchema = z.coerce
  .number()
  .finite()
  .min(0, "Quantity cannot be negative")
  .max(10000, "Quantity is too large");
const optionalQuantitySchema = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  quantitySchema.nullable()
);

export const weeklyMenuItemSchema = z.object({
  id: z.string().uuid("Food item ID is invalid"),
  mealDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Meal date is invalid"),
  mealSlot: mealSlotSchema,
  mealName: z.string().trim().min(1, "Food item is required").max(120, "Food item must be 120 characters or fewer"),
  plannedQuantity: quantitySchema,
  actualQuantity: optionalQuantitySchema,
  unit: z.string().trim().min(1, "Unit is required").max(30, "Unit must be 30 characters or fewer"),
  caloriesPerUnit: z.coerce
    .number()
    .finite()
    .min(0, "Calories per unit cannot be negative")
    .max(10000, "Calories per unit is too large")
});

export const weeklyMenuSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Week start is invalid"),
  items: z.array(weeklyMenuItemSchema).max(280, "A weekly menu can contain at most 280 food items")
});
