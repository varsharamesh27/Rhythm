export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

export function weekStartIso(date = todayIso()): string {
  const value = new Date(`${date}T12:00:00`);
  const day = value.getDay();
  value.setDate(value.getDate() - day);
  return value.toISOString().slice(0, 10);
}

export function mondayWeekStartIso(date = todayIso()): string {
  const value = new Date(`${date}T12:00:00`);
  const day = value.getDay();
  value.setDate(value.getDate() - (day === 0 ? 6 : day - 1));
  return value.toISOString().slice(0, 10);
}

export function isIsoDate(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(new Date(`${value}T12:00:00`).getTime());
}

export function formatShortDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
