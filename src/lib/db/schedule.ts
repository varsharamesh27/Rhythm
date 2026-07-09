import { unstable_noStore as noStore } from "next/cache";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { HabitCategory, ScheduleEntry } from "@/types/database";
import { createDemoScheduleEntry, listDemoScheduleEntries, listRecentDemoScheduleEntries, updateDemoScheduleActual } from "./demo-store";

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
