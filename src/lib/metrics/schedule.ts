import type { ScheduleEntry } from "@/types/database";

export function calculateScheduleAdherence(entries: ScheduleEntry[]): number {
  if (entries.length === 0) return 0;
  const completed = entries.filter((entry) => entry.completed).length;
  return Math.round((completed / entries.length) * 100);
}

export function plannedMinutes(entry: Pick<ScheduleEntry, "planned_start" | "planned_end">): number {
  return minutesBetween(entry.planned_start, entry.planned_end);
}

function minutesBetween(start: string, end: string): number {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const startTotal = startHour * 60 + startMinute;
  let endTotal = endHour * 60 + endMinute;
  if (endTotal <= startTotal) endTotal += 24 * 60;
  return endTotal - startTotal;
}
