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

export type CategoryScores = {
  routine: number;
  recovery: number;
  movement: number;
  nutrition: number;
  career: number;
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

export function aggregateCategoryScores(
  checkins: DailyCheckin[],
  scheduleAdherence: number
): CategoryScores {
  const recent = [...checkins].sort((a, b) => a.checkin_date.localeCompare(b.checkin_date)).slice(-7);
  if (recent.length === 0) {
    return {
      routine: clampPercentage(scheduleAdherence),
      recovery: 0,
      movement: 0,
      nutrition: 0,
      career: 0
    };
  }

  const recoveryPoints = recent.reduce(
    (total, checkin) => total + checkin.sleep_quality + checkin.energy,
    0
  );
  const movementPoints = recent.reduce(
    (total, checkin) =>
      total +
      Number(checkin.workout_completed) +
      Number(checkin.yoga_completed) +
      Number(checkin.walking_completed),
    0
  );
  const nutritionPoints = recent.reduce(
    (total, checkin) =>
      total +
      checkin.nutrition_adherence / 5 +
      Math.min(checkin.water_intake / 8, 1),
    0
  );

  return {
    routine: clampPercentage(scheduleAdherence),
    recovery: Math.round((recoveryPoints / (recent.length * 10)) * 100),
    movement: Math.round((movementPoints / (recent.length * 3)) * 100),
    nutrition: Math.round((nutritionPoints / (recent.length * 2)) * 100),
    career: Math.round(
      (recent.filter((checkin) => checkin.study_completed).length / recent.length) * 100
    )
  };
}

function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}
