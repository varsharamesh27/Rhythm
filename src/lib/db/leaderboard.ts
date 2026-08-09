import { unstable_noStore as noStore } from "next/cache";
import { addDaysIso, mondayWeekStartIso, todayIso } from "@/lib/dates";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LeaderboardEntry } from "@/types/database";
import { readDemoState } from "./demo-store";

export class LeaderboardSetupRequiredError extends Error {
  constructor() {
    super("The leaderboard database migration has not been applied.");
    this.name = "LeaderboardSetupRequiredError";
  }
}

export async function listWeeklyLeaderboard(): Promise<LeaderboardEntry[]> {
  noStore();
  if (isDemoMode()) return getDemoLeaderboard();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_weekly_leaderboard");
  if (error?.code === "PGRST202" || error?.message.includes("get_weekly_leaderboard")) {
    throw new LeaderboardSetupRequiredError();
  }
  if (error) throw new Error(error.message);
  return data ?? [];
}

function getDemoLeaderboard(): LeaderboardEntry[] {
  const state = readDemoState();
  const profile = state.profile;
  if (!profile.leaderboard_opt_in) return [];

  const weekStart = mondayWeekStartIso(todayIso());
  const weekEnd = addDaysIso(weekStart, 6);
  const activeHabits = state.habits.filter((habit) => habit.is_active);
  const habitTarget = activeHabits.reduce((total, habit) => total + habit.target_per_week, 0);
  const activeIds = new Set(activeHabits.map((habit) => habit.id));
  const habitCompletions = state.habitLogs.filter(
    (log) => log.completed && activeIds.has(log.habit_id) && log.log_date >= weekStart && log.log_date <= weekEnd
  ).length;
  const checkinDays = new Set(
    state.checkins.filter((checkin) => checkin.checkin_date >= weekStart && checkin.checkin_date <= weekEnd).map((checkin) => checkin.checkin_date)
  ).size;
  const habitScore = habitTarget > 0 ? Math.min(habitCompletions / habitTarget, 1) : null;
  const checkinScore = Math.min(checkinDays / 7, 1);
  const weeklyScore = Math.round(habitScore === null ? checkinScore * 100 : habitScore * 70 + checkinScore * 30);

  return [{
    rank: 1,
    user_id: profile.id,
    public_name: profile.leaderboard_name?.trim() || "Rhythm member",
    weekly_score: weeklyScore,
    habit_completions: habitCompletions,
    habit_target: habitTarget,
    checkin_days: checkinDays
  }];
}
