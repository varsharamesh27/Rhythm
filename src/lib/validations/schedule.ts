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

const scheduleTimeSchema = z.string().regex(/^\d{2}:\d{2}$/, "Use a valid time");

const scheduleTemplateFields = z.object({
  name: z.string().trim().min(2, "Title is required").max(100),
  startTime: scheduleTimeSchema,
  endTime: scheduleTimeSchema,
  category: habitCategorySchema,
  weekday: z.preprocess(
    (value) => value === "" || value === null ? null : Number(value),
    z.number().int().min(0).max(6).nullable()
  )
}).refine((value) => value.endTime > value.startTime, {
  message: "End time must be after start time",
  path: ["endTime"]
});

export const scheduleTemplateSchema = scheduleTemplateFields;

export const scheduleTemplateUpdateSchema = scheduleTemplateFields.and(
  z.object({ templateId: z.string().uuid() })
);

export const scheduleTemplateIdSchema = z.string().uuid();

export const scheduleDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Schedule date is invalid");
