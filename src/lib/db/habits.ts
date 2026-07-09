import { unstable_noStore as noStore } from "next/cache";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Habit, HabitCategory, HabitLog } from "@/types/database";
import { createDemoHabit, listDemoHabitLogs, listDemoHabits, setDemoHabitActive, setDemoHabitLog } from "./demo-store";

export async function listHabits(userId: string): Promise<Habit[]> {
  noStore();
  if (isDemoMode()) return listDemoHabits();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listHabitLogsForRange(userId: string, startDate: string, endDate: string): Promise<HabitLog[]> {
  noStore();
  if (isDemoMode()) return listDemoHabitLogs(startDate, endDate);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("log_date", startDate)
    .lte("log_date", endDate);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createHabit(input: { userId: string; name: string; category: HabitCategory; targetPerWeek: number }): Promise<void> {
  if (isDemoMode()) {
    createDemoHabit(input);
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("habits").insert({
    user_id: input.userId,
    name: input.name,
    category: input.category,
    target_per_week: input.targetPerWeek,
    is_active: true
  });
  if (error) throw new Error(error.message);
}

export async function setHabitActive(userId: string, habitId: string, isActive: boolean): Promise<void> {
  if (isDemoMode()) {
    setDemoHabitActive(habitId, isActive);
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("habits").update({ is_active: isActive }).eq("user_id", userId).eq("id", habitId);
  if (error) throw new Error(error.message);
}

export async function setHabitLog(input: { userId: string; habitId: string; logDate: string; completed: boolean }): Promise<void> {
  if (isDemoMode()) {
    setDemoHabitLog(input);
    return;
  }

  const supabase = await createSupabaseServerClient();
  if (!input.completed) {
    const { error } = await supabase
      .from("habit_logs")
      .delete()
      .eq("user_id", input.userId)
      .eq("habit_id", input.habitId)
      .eq("log_date", input.logDate);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("habit_logs").upsert(
    { user_id: input.userId, habit_id: input.habitId, log_date: input.logDate, completed: true },
    { onConflict: "habit_id,log_date" }
  );
  if (error) throw new Error(error.message);
}
