import { z } from "zod";

const rating = z.coerce.number().int().min(1).max(5);

export const dailyCheckinSchema = z.object({
  checkinDate: z.string().min(1, "Date is required"),
  bedtime: z.string().optional(),
  wakeTime: z.string().optional(),
  sleepQuality: rating,
  energy: rating,
  mood: rating,
  waterIntake: z.coerce.number().int().min(0).max(30),
  workoutCompleted: z.coerce.boolean().default(false),
  yogaCompleted: z.coerce.boolean().default(false),
  meditationCompleted: z.coerce.boolean().default(false),
  walkingCompleted: z.coerce.boolean().default(false),
  studyCompleted: z.coerce.boolean().default(false),
  studyDurationMinutes: z.coerce.number().int().min(0).max(1440),
  nutritionAdherence: rating,
  weight: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().positive().max(1000).optional()
  ),
  notes: z.string().max(1200).optional()
});

export type DailyCheckinInput = z.infer<typeof dailyCheckinSchema>;
