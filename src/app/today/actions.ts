"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserId, upsertDailyCheckin } from "@/lib/db/checkins";
import { dailyCheckinSchema } from "@/lib/validations/checkin";

export type CheckinActionState = { ok: boolean; message: string };

export async function saveDailyCheckin(_state: CheckinActionState, formData: FormData): Promise<CheckinActionState> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const parsed = dailyCheckinSchema.safeParse({
    checkinDate: formData.get("checkinDate"),
    bedtime: formData.get("bedtime"),
    wakeTime: formData.get("wakeTime"),
    sleepQuality: formData.get("sleepQuality"),
    energy: formData.get("energy"),
    mood: formData.get("mood"),
    waterIntake: formData.get("waterIntake"),
    workoutCompleted: formData.get("workoutCompleted") === "on",
    yogaCompleted: formData.get("yogaCompleted") === "on",
    meditationCompleted: formData.get("meditationCompleted") === "on",
    walkingCompleted: formData.get("walkingCompleted") === "on",
    studyCompleted: formData.get("studyCompleted") === "on",
    studyDurationMinutes: formData.get("studyDurationMinutes"),
    nutritionAdherence: formData.get("nutritionAdherence"),
    weight: formData.get("weight"),
    notes: formData.get("notes")
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const value = parsed.data;
  await upsertDailyCheckin({
    user_id: userId,
    checkin_date: value.checkinDate,
    bedtime: value.bedtime || null,
    wake_time: value.wakeTime || null,
    sleep_quality: value.sleepQuality,
    energy: value.energy,
    mood: value.mood,
    water_intake: value.waterIntake,
    workout_completed: value.workoutCompleted,
    yoga_completed: value.yogaCompleted,
    meditation_completed: value.meditationCompleted,
    walking_completed: value.walkingCompleted,
    study_completed: value.studyCompleted,
    study_duration_minutes: value.studyDurationMinutes,
    nutrition_adherence: value.nutritionAdherence,
    weight: value.weight ?? null,
    notes: value.notes || null
  });

  revalidatePath("/today");
  revalidatePath("/dashboard");
  return { ok: true, message: "Saved. Your day is logged without judgment." };
}
