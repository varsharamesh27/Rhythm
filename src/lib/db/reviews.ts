import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Goal, HabitCategory, WeeklyReview } from "@/types/database";

export async function listGoals(userId: string): Promise<Goal[]> {
  noStore();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createGoal(input: { userId: string; title: string; category: HabitCategory; targetDate: string | null }): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("goals").insert({
    user_id: input.userId,
    title: input.title,
    category: input.category,
    target_date: input.targetDate,
    status: "active"
  });
  if (error) throw new Error(error.message);
}

export async function listWeeklyReviews(userId: string, limit = 8): Promise<WeeklyReview[]> {
  noStore();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("weekly_reviews")
    .select("*")
    .eq("user_id", userId)
    .order("week_start", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function upsertWeeklyReview(input: {
  userId: string;
  weekStart: string;
  routineSummary: string | null;
  recoverySummary: string | null;
  movementSummary: string | null;
  nutritionSummary: string | null;
  careerSummary: string | null;
  nextWeekFocus: string | null;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("weekly_reviews").upsert(
    {
      user_id: input.userId,
      week_start: input.weekStart,
      routine_summary: input.routineSummary,
      recovery_summary: input.recoverySummary,
      movement_summary: input.movementSummary,
      nutrition_summary: input.nutritionSummary,
      career_summary: input.careerSummary,
      next_week_focus: input.nextWeekFocus
    },
    { onConflict: "user_id,week_start" }
  );
  if (error) throw new Error(error.message);
}
