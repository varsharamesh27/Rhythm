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

export function formatShortDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
