import { describe, expect, it } from "vitest";
import { habitCompletionForWeek } from "./habits";
import type { Habit, HabitLog } from "@/types/database";

const habit: Habit = {
  id: "habit-1",
  user_id: "user-1",
  name: "Walk",
  category: "movement",
  target_per_week: 4,
  is_active: true,
  created_at: "2026-07-01T00:00:00Z"
};

function log(id: string): HabitLog {
  return {
    id,
    user_id: "user-1",
    habit_id: "habit-1",
    log_date: "2026-07-01",
    completed: true,
    created_at: "2026-07-01T00:00:00Z"
  };
}

describe("habitCompletionForWeek", () => {
  it("caps completed logs at the habit weekly target", () => {
    expect(habitCompletionForWeek([habit], [log("1"), log("2"), log("3"), log("4"), log("5")])).toBe(100);
  });

  it("ignores paused habits", () => {
    expect(habitCompletionForWeek([{ ...habit, is_active: false }], [log("1")])).toBe(0);
  });
});
