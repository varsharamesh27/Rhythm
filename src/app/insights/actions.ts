"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/db/auth";
import { createGoal, upsertWeeklyReview } from "@/lib/db/reviews";
import { goalSchema, weeklyReviewSchema } from "@/lib/validations/review";

export async function createGoalAction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const parsed = goalSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    targetDate: formData.get("targetDate")
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Goal is invalid");
  await createGoal({ userId, title: parsed.data.title, category: parsed.data.category, targetDate: parsed.data.targetDate || null });
  revalidatePath("/insights");
}

export async function saveWeeklyReviewAction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const parsed = weeklyReviewSchema.safeParse({
    weekStart: formData.get("weekStart"),
    routineSummary: formData.get("routineSummary"),
    recoverySummary: formData.get("recoverySummary"),
    movementSummary: formData.get("movementSummary"),
    nutritionSummary: formData.get("nutritionSummary"),
    careerSummary: formData.get("careerSummary"),
    nextWeekFocus: formData.get("nextWeekFocus")
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Weekly review is invalid");
  await upsertWeeklyReview({
    userId,
    weekStart: parsed.data.weekStart,
    routineSummary: parsed.data.routineSummary || null,
    recoverySummary: parsed.data.recoverySummary || null,
    movementSummary: parsed.data.movementSummary || null,
    nutritionSummary: parsed.data.nutritionSummary || null,
    careerSummary: parsed.data.careerSummary || null,
    nextWeekFocus: parsed.data.nextWeekFocus || null
  });
  revalidatePath("/insights");
}
