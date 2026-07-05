import { describe, expect, it } from "vitest";
import { aggregateDashboardMetrics, calculateSleepHours } from "./checkins";
import type { DailyCheckin } from "@/types/database";

function checkin(overrides: Partial<DailyCheckin>): DailyCheckin {
  return {
    id: crypto.randomUUID(),
    user_id: "user-1",
    checkin_date: "2026-07-01",
    bedtime: "22:30",
    wake_time: "06:30",
    sleep_quality: 4,
    energy: 4,
    mood: 4,
    water_intake: 8,
    workout_completed: false,
    yoga_completed: false,
    meditation_completed: false,
    walking_completed: false,
    study_completed: false,
    study_duration_minutes: 0,
    nutrition_adherence: 4,
    weight: null,
    notes: null,
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
    ...overrides
  };
}

describe("calculateSleepHours", () => {
  it("handles overnight sleep windows", () => {
    expect(calculateSleepHours("22:30", "06:15")).toBe(7.8);
  });

  it("returns null when either time is missing", () => {
    expect(calculateSleepHours(null, "06:15")).toBeNull();
  });
});

describe("aggregateDashboardMetrics", () => {
  it("calculates weekly consistency without making weight the main success measure", () => {
    const metrics = aggregateDashboardMetrics([
      checkin({ checkin_date: "2026-07-01", workout_completed: true, walking_completed: true, study_completed: true, weight: 171.2 }),
      checkin({ checkin_date: "2026-07-02", yoga_completed: true, meditation_completed: true, water_intake: 5, weight: 171.0 })
    ]);

    expect(metrics.sevenDayHabitCompletion).toBe(50);
    expect(metrics.weeklyWorkoutCount).toBe(1);
    expect(metrics.studySessionCount).toBe(1);
    expect(metrics.hydrationConsistency).toBe(50);
    expect(metrics.weightTrend).toHaveLength(2);
  });
});
