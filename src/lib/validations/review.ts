import { z } from "zod";
import { habitCategorySchema } from "./habit";

export const goalSchema = z.object({
  title: z.string().trim().min(2, "Goal title is required").max(120),
  category: habitCategorySchema,
  targetDate: z.string().optional()
});

export const weeklyReviewSchema = z.object({
  weekStart: z.string().min(1),
  routineSummary: z.string().max(800).optional(),
  recoverySummary: z.string().max(800).optional(),
  movementSummary: z.string().max(800).optional(),
  nutritionSummary: z.string().max(800).optional(),
  careerSummary: z.string().max(800).optional(),
  nextWeekFocus: z.string().max(800).optional()
});
