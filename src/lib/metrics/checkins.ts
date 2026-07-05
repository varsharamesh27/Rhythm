import type { DailyCheckin } from "@/types/database";

export type DashboardMetrics = {
  sevenDayHabitCompletion: number;
  weeklyWorkoutCount: number;
  studySessionCount: number;
  hydrationConsistency: number;
  routineConsistency: number;
  sleepTrend: Array<{ date: string; hours: number }>;
  weightTrend: Array<{ date: string; weight: number }>;
};

const habitKeys = [
  "workout_completed",
  "yoga_completed",
  "meditation_completed",
  "walking_completed",
  "study_completed"
] as const;

export function calculateSleepHours(bedtime: string | null, wakeTime: string | null): number | null {
  if (!bedtime || !wakeTime) return null;
  const [bedHour, bedMinute] = bedtime.split(":").map(Number);
  const [wakeHour, wakeMinute] = wakeTime.split(":").map(Number);
  const bedMinutes = bedHour * 60 + bedMinute;
  let wakeMinutes = wakeHour * 60 + wakeMinute;
  if (wakeMinutes <= bedMinutes) wakeMinutes += 24 * 60;
  return Math.round(((wakeMinutes - bedMinutes) / 60) * 10) / 10;
}

export function aggregateDashboardMetrics(checkins: DailyCheckin[]): DashboardMetrics {
  const recent = [...checkins].sort((a, b) => a.checkin_date.localeCompare(b.checkin_date)).slice(-7);
  const possibleHabits = recent.length * habitKeys.length;
  const completedHabits = recent.reduce(
    (total, checkin) => total + habitKeys.filter((key) => checkin[key]).length,
    0
  );
  const hydrationDays = recent.filter((checkin) => checkin.water_intake >= 8).length;
  const qualityScores = recent.reduce(
    (total, checkin) => total + checkin.sleep_quality + checkin.energy + checkin.mood + checkin.nutrition_adherence,
    0
  );
  const possibleQualityScore = recent.length * 20;

  return {
    sevenDayHabitCompletion: possibleHabits === 0 ? 0 : Math.round((completedHabits / possibleHabits) * 100),
    weeklyWorkoutCount: recent.filter((checkin) => checkin.workout_completed).length,
    studySessionCount: recent.filter((checkin) => checkin.study_completed).length,
    hydrationConsistency: recent.length === 0 ? 0 : Math.round((hydrationDays / recent.length) * 100),
    routineConsistency: possibleQualityScore === 0 ? 0 : Math.round((qualityScores / possibleQualityScore) * 100),
    sleepTrend: recent
      .map((checkin) => ({ date: checkin.checkin_date, hours: calculateSleepHours(checkin.bedtime, checkin.wake_time) }))
      .filter((point): point is { date: string; hours: number } => point.hours !== null),
    weightTrend: recent
      .filter((checkin) => checkin.weight !== null)
      .map((checkin) => ({ date: checkin.checkin_date, weight: Number(checkin.weight) }))
  };
}
