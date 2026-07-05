"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/db/auth";
import { createScheduleEntry, updateScheduleActual } from "@/lib/db/schedule";
import { scheduleActualSchema, scheduleEntrySchema } from "@/lib/validations/schedule";

export async function createScheduleEntryAction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const parsed = scheduleEntrySchema.safeParse({
    entryDate: formData.get("entryDate"),
    plannedStart: formData.get("plannedStart"),
    plannedEnd: formData.get("plannedEnd"),
    title: formData.get("title"),
    category: formData.get("category")
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Schedule entry is invalid");
  await createScheduleEntry({ userId, ...parsed.data });
  revalidatePath("/schedule");
  revalidatePath("/dashboard");
}

export async function updateScheduleActualAction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const parsed = scheduleActualSchema.safeParse({
    entryId: formData.get("entryId"),
    actualStart: formData.get("actualStart"),
    actualEnd: formData.get("actualEnd"),
    completed: formData.get("completed") === "on"
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Actual schedule entry is invalid");
  await updateScheduleActual({
    userId,
    entryId: parsed.data.entryId,
    actualStart: parsed.data.actualStart || null,
    actualEnd: parsed.data.actualEnd || null,
    completed: parsed.data.completed
  });
  revalidatePath("/schedule");
  revalidatePath("/dashboard");
}
