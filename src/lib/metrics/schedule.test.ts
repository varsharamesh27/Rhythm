import { describe, expect, it } from "vitest";
import { applicableScheduleTemplatesForDate, calculateScheduleAdherence, isIdealScheduleDayComplete, isScheduleEntryOnTime, plannedMinutes } from "./schedule";
import type { ScheduleEntry, ScheduleTemplate } from "@/types/database";

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

  it("requires every completed block to finish within the 15-minute grace window", () => {
    const onTime = { ...entry(true), actual_start: "09:10", actual_end: "10:45" };
    const late = { ...entry(true), actual_start: "09:20", actual_end: "10:50" };
    expect(isScheduleEntryOnTime(onTime)).toBe(true);
    expect(isScheduleEntryOnTime(late)).toBe(false);
    expect(isIdealScheduleDayComplete([onTime, { ...onTime, id: "second" }])).toBe(true);
    expect(isIdealScheduleDayComplete([onTime, late])).toBe(false);
  });

  it("keeps Saturday free and applies reusable blocks on Sunday", () => {
    const reusable: ScheduleTemplate = {
      id: "template-1", user_id: "user-1", name: "Morning routine", weekday: null,
      start_time: "08:00", end_time: "09:00", category: "routine", created_at: "2026-08-01T00:00:00Z"
    };
    const sunday = { ...reusable, id: "template-2", weekday: 0 };
    expect(applicableScheduleTemplatesForDate([reusable, sunday], "2026-08-15")).toEqual([]);
    expect(applicableScheduleTemplatesForDate([reusable, sunday], "2026-08-16")).toHaveLength(2);
  });
});
