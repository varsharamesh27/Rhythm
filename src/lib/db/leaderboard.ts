import { unstable_noStore as noStore } from "next/cache";
import { addDaysIso, mondayWeekStartIso, todayIso } from "@/lib/dates";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { weeklyMovementActivityPoints } from "@/lib/metrics/leaderboard";
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
  const { data, error } = await supabase.rpc("get_weekly_points_leaderboard");
  if (error?.code === "PGRST202" || error?.message.includes("get_weekly_points_leaderboard")) {
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
  const weeklyCheckins = state.checkins.filter((checkin) => checkin.checkin_date >= weekStart && checkin.checkin_date <= weekEnd);
  const habitPoints = (category: "routine" | "recovery" | "movement" | "nutrition" | "career", maximum: number) => {
    const habits = activeHabits.filter((habit) => habit.category === category);
    const target = habits.reduce((total, habit) => total + habit.target_per_week, 0);
    if (target === 0) return 0;
    const completed = habits.reduce((total, habit) => total + Math.min(
      state.habitLogs.filter((log) => log.habit_id === habit.id && log.completed && log.log_date >= weekStart && log.log_date <= weekEnd).length,
      habit.target_per_week
    ), 0);
    return Math.round(maximum * Math.min(completed / target, 1));
  };
  const weeklySchedule = state.scheduleEntries.filter((entry) => entry.entry_date >= weekStart && entry.entry_date <= weekEnd);
  const schedulePoints = weeklySchedule.length === 0 ? 0 : Math.round(10 * weeklySchedule.filter((entry) => entry.completed).length / weeklySchedule.length);
  const checkinDays = weeklyCheckins.length;
  const routinePoints = habitPoints("routine", 10) + schedulePoints + Math.round(20 * checkinDays / 7);
  const recoveryPoints = habitPoints("recovery", 5) + Math.round(15 * weeklyCheckins.reduce((sum, item) => sum + item.sleep_quality + item.energy, 0) / 70);
  const movementPoints = habitPoints("movement", 5) + weeklyMovementActivityPoints(weeklyCheckins);
  const nutritionPoints = habitPoints("nutrition", 5)
    + Math.round(7 * weeklyCheckins.reduce((sum, item) => sum + item.nutrition_adherence, 0) / 35)
    + Math.round(3 * weeklyCheckins.filter((item) => item.water_intake >= 8).length / 7);
  const careerPoints = habitPoints("career", 5) + Math.round(5 * weeklyCheckins.filter((item) => item.study_completed).length / 7);
  const weeklyScore = routinePoints + recoveryPoints + movementPoints + nutritionPoints + careerPoints;

  return [{
    rank: 1,
    user_id: profile.id,
    public_name: profile.leaderboard_name?.trim() || "Rhythm member",
    weekly_score: weeklyScore,
    routine_points: routinePoints,
    recovery_points: recoveryPoints,
    movement_points: movementPoints,
    nutrition_points: nutritionPoints,
    career_points: careerPoints,
    checkin_days: checkinDays,
    week_start: weekStart,
    week_end: weekEnd
  }];
}
