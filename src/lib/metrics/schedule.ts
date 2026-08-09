import type { ScheduleEntry, ScheduleTemplate } from "@/types/database";

const ON_TIME_GRACE_MINUTES = 15;

export function applicableScheduleTemplatesForDate(templates: ScheduleTemplate[], date: string): ScheduleTemplate[] {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  if (weekday === 6) return [];
  return templates.filter((template) => template.weekday === null || template.weekday === weekday);
}

export function isScheduleEntryOnTime(entry: ScheduleEntry): boolean {
  if (!entry.completed || !entry.actual_start || !entry.actual_end) return false;
  const plannedStart = timeToMinutes(entry.planned_start);
  const plannedEnd = normalizeEnd(timeToMinutes(entry.planned_end), plannedStart);
  const actualStart = timeToMinutes(entry.actual_start);
  const actualEnd = normalizeEnd(timeToMinutes(entry.actual_end), actualStart);
  return actualStart <= plannedStart + ON_TIME_GRACE_MINUTES && actualEnd <= plannedEnd + ON_TIME_GRACE_MINUTES;
}

export function isIdealScheduleDayComplete(entries: ScheduleEntry[]): boolean {
  return entries.length > 0 && entries.every(isScheduleEntryOnTime);
}

export function calculateScheduleAdherence(entries: ScheduleEntry[]): number {
  if (entries.length === 0) return 0;
  const completed = entries.filter((entry) => entry.completed).length;
  return Math.round((completed / entries.length) * 100);
}

export function plannedMinutes(entry: Pick<ScheduleEntry, "planned_start" | "planned_end">): number {
  return minutesBetween(entry.planned_start, entry.planned_end);
}

function minutesBetween(start: string, end: string): number {
  const startTotal = timeToMinutes(start);
  return normalizeEnd(timeToMinutes(end), startTotal) - startTotal;
}

function timeToMinutes(value: string): number {
  const [hour, minute] = value.slice(0, 5).split(":").map(Number);
  return hour * 60 + minute;
}

function normalizeEnd(end: number, start: number): number {
  return end <= start ? end + 24 * 60 : end;
}
