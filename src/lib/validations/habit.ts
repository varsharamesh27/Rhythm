import { z } from "zod";

export const habitCategorySchema = z.enum(["routine", "recovery", "movement", "nutrition", "career"]);

export const habitSchema = z.object({
  name: z.string().trim().min(2, "Habit name is required").max(80),
  category: habitCategorySchema,
  targetPerWeek: z.coerce.number().int().min(1).max(7)
});

export const habitToggleSchema = z.object({
  habitId: z.string().uuid(),
  logDate: z.string().min(1),
  completed: z.boolean()
});

export type HabitInput = z.infer<typeof habitSchema>;
