"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/db/auth";
import {
  addIdealScheduleToDay,
  createScheduleEntry,
  createScheduleTemplate,
  deleteScheduleTemplate,
  importLocalIdealSchedule,
  updateScheduleActual,
  updateScheduleTemplate
} from "@/lib/db/schedule";
import {
  scheduleActualSchema,
  scheduleDateSchema,
  scheduleEntrySchema,
  scheduleTemplateIdSchema,
  scheduleTemplateSchema,
  scheduleTemplateUpdateSchema
} from "@/lib/validations/schedule";

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

export async function applyIdealScheduleAction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const parsedDate = scheduleDateSchema.safeParse(formData.get("entryDate"));
  if (!parsedDate.success) throw new Error(parsedDate.error.issues[0]?.message ?? "Schedule date is invalid");

  await addIdealScheduleToDay(userId, parsedDate.data);
  revalidatePath("/schedule");
  revalidatePath("/dashboard");
}

export async function importLocalIdealScheduleAction(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  await importLocalIdealSchedule(userId);
  revalidatePath("/schedule");
}

export async function createScheduleTemplateAction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const parsed = scheduleTemplateSchema.safeParse(templateFormValues(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Ideal schedule block is invalid");
  await createScheduleTemplate(userId, parsed.data);
  revalidatePath("/schedule");
}

export async function updateScheduleTemplateAction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const parsed = scheduleTemplateUpdateSchema.safeParse({
    ...templateFormValues(formData),
    templateId: formData.get("templateId")
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Ideal schedule block is invalid");
  await updateScheduleTemplate(userId, parsed.data);
  revalidatePath("/schedule");
}

export async function deleteScheduleTemplateAction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const parsedId = scheduleTemplateIdSchema.safeParse(formData.get("templateId"));
  if (!parsedId.success) throw new Error("Ideal schedule block is invalid");
  await deleteScheduleTemplate(userId, parsedId.data);
  revalidatePath("/schedule");
}

function templateFormValues(formData: FormData) {
  return {
    name: formData.get("name"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    category: formData.get("category"),
    weekday: formData.get("weekday")
  };
}
