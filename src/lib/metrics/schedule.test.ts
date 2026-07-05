import { describe, expect, it } from "vitest";
import { calculateScheduleAdherence, plannedMinutes } from "./schedule";
import type { ScheduleEntry } from "@/types/database";

function entry(completed: boolean): ScheduleEntry {
  return {
    id: crypto.randomUUID(),
    user_id: "user-1",
    entry_date: "2026-07-01",
    planned_start: "09:00",
    planned_end: "10:30",
    actual_start: null,
    actual_end: null,
    title: "Study",
    category: "career",
    completed,
    created_at: "2026-07-01T00:00:00Z"
  };
}

describe("schedule metrics", () => {
  it("calculates adherence from completed blocks", () => {
    expect(calculateScheduleAdherence([entry(true), entry(false), entry(true)])).toBe(67);
  });

  it("calculates planned minutes", () => {
    expect(plannedMinutes(entry(false))).toBe(90);
  });
});
