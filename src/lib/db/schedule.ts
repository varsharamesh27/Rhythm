import { unstable_noStore as noStore } from "next/cache";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { HabitCategory, ScheduleEntry, ScheduleTemplate } from "@/types/database";
import {
  addDemoRoutineEntries,
  createDemoScheduleEntry,
  createDemoScheduleTemplate,
  deleteDemoScheduleTemplate,
  listDemoScheduleEntries,
  listDemoScheduleTemplates,
  listRecentDemoScheduleEntries,
  updateDemoScheduleActual,
  updateDemoScheduleTemplate
} from "./demo-store";

type ScheduleTemplateInput = {
  name: string;
  weekday: number | null;
  startTime: string;
  endTime: string;
  category: HabitCategory;
};

export async function listScheduleEntries(userId: string, date: string): Promise<ScheduleEntry[]> {
  noStore();
  if (isDemoMode()) return listDemoScheduleEntries(date);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("schedule_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_date", date)
    .order("planned_start", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listRecentScheduleEntries(userId: string, startDate: string, endDate: string): Promise<ScheduleEntry[]> {
  noStore();
  if (isDemoMode()) return listRecentDemoScheduleEntries(startDate, endDate);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("schedule_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("entry_date", startDate)
    .lte("entry_date", endDate)
    .order("entry_date", { ascending: true })
    .order("planned_start", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listScheduleTemplates(userId: string): Promise<ScheduleTemplate[]> {
  noStore();
  if (isDemoMode()) return listDemoScheduleTemplates();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("schedule_templates")
    .select("*")
    .eq("user_id", userId)
    .order("start_time", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createScheduleTemplate(userId: string, input: ScheduleTemplateInput): Promise<void> {
  if (isDemoMode()) {
    createDemoScheduleTemplate(input);
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("schedule_templates").insert({
    user_id: userId,
    name: input.name,
    weekday: input.weekday,
    start_time: input.startTime,
    end_time: input.endTime,
    category: input.category
  });
  if (error) throw new Error(error.message);
}

export async function updateScheduleTemplate(
  userId: string,
  input: ScheduleTemplateInput & { templateId: string }
): Promise<void> {
  if (isDemoMode()) {
    updateDemoScheduleTemplate(input);
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("schedule_templates")
    .update({
      name: input.name,
      weekday: input.weekday,
      start_time: input.startTime,
      end_time: input.endTime,
      category: input.category
    })
    .eq("user_id", userId)
    .eq("id", input.templateId);
  if (error) throw new Error(error.message);
}

export async function deleteScheduleTemplate(userId: string, templateId: string): Promise<void> {
  if (isDemoMode()) {
    deleteDemoScheduleTemplate(templateId);
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("schedule_templates")
    .delete()
    .eq("user_id", userId)
    .eq("id", templateId);
  if (error) throw new Error(error.message);
}

export async function createScheduleEntry(input: {
  userId: string;
  entryDate: string;
  plannedStart: string;
  plannedEnd: string;
  title: string;
  category: HabitCategory;
}): Promise<void> {
  if (isDemoMode()) {
    createDemoScheduleEntry(input);
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("schedule_entries").insert({
    user_id: input.userId,
    entry_date: input.entryDate,
    planned_start: input.plannedStart,
    planned_end: input.plannedEnd,
    title: input.title,
    category: input.category
  });
  if (error) throw new Error(error.message);
}

export async function updateScheduleActual(input: {
  userId: string;
  entryId: string;
  actualStart: string | null;
  actualEnd: string | null;
  completed: boolean;
}): Promise<void> {
  if (isDemoMode()) {
    updateDemoScheduleActual(input);
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("schedule_entries")
    .update({ actual_start: input.actualStart, actual_end: input.actualEnd, completed: input.completed })
    .eq("user_id", input.userId)
    .eq("id", input.entryId);
  if (error) throw new Error(error.message);
}

export async function addIdealScheduleToDay(userId: string, date: string): Promise<void> {
  const templates = await listScheduleTemplates(userId);
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  const applicable = templates.filter(
    (template) => template.weekday === null || template.weekday === weekday
  );
  const blocks = applicable.map((template) => ({
    title: template.name,
    plannedStart: template.start_time.slice(0, 5),
    plannedEnd: template.end_time.slice(0, 5),
    category: template.category
  }));

  if (isDemoMode()) {
    addDemoRoutineEntries(date, blocks);
    return;
  }

  const existingEntries = await listScheduleEntries(userId, date);
  const existing = new Set(
    existingEntries.map((entry) => `${entry.planned_start.slice(0, 5)}:${entry.title}`)
  );
  const missing = blocks.filter(
    (block) => !existing.has(`${block.plannedStart}:${block.title}`)
  ).map((block) => ({
    user_id: userId,
    entry_date: date,
    planned_start: block.plannedStart,
    planned_end: block.plannedEnd,
    title: block.title,
    category: block.category
  }));

  if (missing.length === 0) return;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("schedule_entries").insert(missing);
  if (error) throw new Error(error.message);
}

export async function importLocalIdealSchedule(userId: string): Promise<number> {
  if (process.env.NODE_ENV === "production" || isDemoMode()) return 0;

  const localTemplates = listDemoScheduleTemplates();
  const accountTemplates = await listScheduleTemplates(userId);
  const existing = new Set(
    accountTemplates.map(
      (template) => `${template.weekday ?? "daily"}:${template.start_time.slice(0, 5)}:${template.name}`
    )
  );
  const missing = localTemplates.filter(
    (template) =>
      !existing.has(`${template.weekday ?? "daily"}:${template.start_time.slice(0, 5)}:${template.name}`)
  ).map((template) => ({
    user_id: userId,
    name: template.name,
    weekday: template.weekday,
    start_time: template.start_time.slice(0, 5),
    end_time: template.end_time.slice(0, 5),
    category: template.category
  }));

  if (missing.length === 0) return 0;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("schedule_templates").insert(missing);
  if (error) throw new Error(error.message);
  return missing.length;
}
