import type { DailyCheckin } from "@/types/database";

type MovementCheckin = Pick<DailyCheckin, "workout_completed" | "yoga_completed" | "walking_completed">;

export function weeklyMovementActivityPoints(checkins: MovementCheckin[]): number {
  const gymDays = checkins.filter((item) => item.workout_completed).length;
  const yogaDays = checkins.filter((item) => item.yoga_completed).length;
  const requiredWalkDays = Math.max(6 - gymDays, 0);
  const coveredWalkDays = checkins.filter((item) => !item.workout_completed && item.walking_completed).length;

  const gymPoints = 7 * Math.min(gymDays / 3, 1);
  const yogaPoints = 2 * Math.min(yogaDays / 7, 1);
  const walkPoints = requiredWalkDays === 0 ? 1 : Math.min(coveredWalkDays / requiredWalkDays, 1);

  return Math.round(gymPoints + yogaPoints + walkPoints);
}
