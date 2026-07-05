"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/db/auth";
import { createHabit, setHabitActive, setHabitLog } from "@/lib/db/habits";
import { habitSchema } from "@/lib/validations/habit";

export async function createHabitAction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const parsed = habitSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    targetPerWeek: formData.get("targetPerWeek")
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Habit is invalid");
  await createHabit({ userId, ...parsed.data });
  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

export async function toggleHabitAction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const habitId = String(formData.get("habitId"));
  const logDate = String(formData.get("logDate"));
  const completed = formData.get("completed") !== "true";
  await setHabitLog({ userId, habitId, logDate, completed });
  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

export async function archiveHabitAction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  await setHabitActive(userId, String(formData.get("habitId")), false);
  revalidatePath("/habits");
}
