import { z } from "zod";
import { habitCategorySchema } from "./habit";

export const scheduleEntrySchema = z.object({
  entryDate: z.string().min(1, "Date is required"),
  plannedStart: z.string().min(1, "Planned start is required"),
  plannedEnd: z.string().min(1, "Planned end is required"),
  title: z.string().trim().min(2, "Title is required").max(100),
  category: habitCategorySchema
});

export const scheduleActualSchema = z.object({
  entryId: z.string().uuid(),
  actualStart: z.string().optional(),
  actualEnd: z.string().optional(),
  completed: z.boolean()
});
