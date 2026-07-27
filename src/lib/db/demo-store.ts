import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { addDaysIso, todayIso } from "@/lib/dates";
import { DEMO_USER_ID } from "@/lib/demo-mode";
import type { DailyCheckin, DailyCheckinInsert, Goal, Habit, HabitCategory, HabitLog, ScheduleEntry, UserProfile, WeeklyReview } from "@/types/database";

type DemoState = {
  profile: UserProfile;
  habits: Habit[];
  habitLogs: HabitLog[];
  checkins: DailyCheckin[];
  scheduleEntries: ScheduleEntry[];
  goals: Goal[];
  weeklyReviews: WeeklyReview[];
};

const STORE_PATH = join(process.cwd(), ".demo-data.json");

export function readDemoState(): DemoState {
  if (!existsSync(STORE_PATH)) {
    const seeded = createSeedState();
    writeDemoState(seeded);
    return seeded;
  }
  return JSON.parse(readFileSync(STORE_PATH, "utf8")) as DemoState;
}

export function writeDemoState(state: DemoState): void {
  writeFileSync(STORE_PATH, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export function listDemoCheckins(limit = 30): DailyCheckin[] {
  return readDemoState().checkins.sort(byDate("checkin_date")).slice(-limit);
}

export function getDemoCheckinForDate(date: string): DailyCheckin | null {
  return readDemoState().checkins.find((checkin) => checkin.checkin_date === date) ?? null;
}

export function upsertDemoCheckin(input: DailyCheckinInsert): void {
  const state = readDemoState();
  const index = state.checkins.findIndex((checkin) => checkin.checkin_date === input.checkin_date);
  const now = new Date().toISOString();
  const row: DailyCheckin = {
    id: index >= 0 ? state.checkins[index].id : newId(),
    user_id: input.user_id,
    checkin_date: input.checkin_date,
    bedtime: input.bedtime,
    wake_time: input.wake_time,
    sleep_quality: input.sleep_quality,
    energy: input.energy,
    mood: input.mood,
    water_intake: input.water_intake,
    workout_completed: input.workout_completed,
    yoga_completed: input.yoga_completed,
    meditation_completed: input.meditation_completed,
    walking_completed: input.walking_completed,
    study_completed: input.study_completed,
    study_duration_minutes: input.study_duration_minutes,
    nutrition_adherence: input.nutrition_adherence,
    weight: input.weight,
    notes: input.notes,
    created_at: index >= 0 ? state.checkins[index].created_at : now,
    updated_at: now
  };
  if (index >= 0) state.checkins[index] = row;
  else state.checkins.push(row);
  writeDemoState(state);
}

export function listDemoHabits(): Habit[] {
  return readDemoState().habits.sort((a, b) => Number(b.is_active) - Number(a.is_active) || a.created_at.localeCompare(b.created_at));
}

export function listDemoHabitLogs(startDate: string, endDate: string): HabitLog[] {
  return readDemoState().habitLogs.filter((log) => log.log_date >= startDate && log.log_date <= endDate);
}

export function createDemoHabit(input: { name: string; category: HabitCategory; targetPerWeek: number }): void {
  const state = readDemoState();
  state.habits.push({
    id: newId(),
    user_id: DEMO_USER_ID,
    name: input.name,
    category: input.category,
    target_per_week: input.targetPerWeek,
    is_active: true,
    created_at: new Date().toISOString()
  });
  writeDemoState(state);
}

export function setDemoHabitActive(habitId: string, isActive: boolean): void {
  const state = readDemoState();
  state.habits = state.habits.map((habit) => (habit.id === habitId ? { ...habit, is_active: isActive } : habit));
  writeDemoState(state);
}

export function setDemoHabitLog(input: { habitId: string; logDate: string; completed: boolean }): void {
  const state = readDemoState();
  state.habitLogs = state.habitLogs.filter((log) => !(log.habit_id === input.habitId && log.log_date === input.logDate));
  if (input.completed) {
    state.habitLogs.push({
      id: newId(),
      user_id: DEMO_USER_ID,
      habit_id: input.habitId,
      log_date: input.logDate,
      completed: true,
      created_at: new Date().toISOString()
    });
  }
  writeDemoState(state);
}

export function listDemoScheduleEntries(date: string): ScheduleEntry[] {
  return readDemoState().scheduleEntries.filter((entry) => entry.entry_date === date).sort((a, b) => a.planned_start.localeCompare(b.planned_start));
}

export function listRecentDemoScheduleEntries(startDate: string, endDate: string): ScheduleEntry[] {
  return readDemoState().scheduleEntries.filter((entry) => entry.entry_date >= startDate && entry.entry_date <= endDate).sort(byDate("entry_date"));
}

export function createDemoScheduleEntry(input: { entryDate: string; plannedStart: string; plannedEnd: string; title: string; category: HabitCategory }): void {
  const state = readDemoState();
  state.scheduleEntries.push({
    id: newId(),
    user_id: DEMO_USER_ID,
    entry_date: input.entryDate,
    planned_start: input.plannedStart,
    planned_end: input.plannedEnd,
    actual_start: null,
    actual_end: null,
    title: input.title,
    category: input.category,
    completed: false,
    created_at: new Date().toISOString()
  });
  writeDemoState(state);
}

export function updateDemoScheduleActual(input: { entryId: string; actualStart: string | null; actualEnd: string | null; completed: boolean }): void {
  const state = readDemoState();
  state.scheduleEntries = state.scheduleEntries.map((entry) =>
    entry.id === input.entryId ? { ...entry, actual_start: input.actualStart, actual_end: input.actualEnd, completed: input.completed } : entry
  );
  writeDemoState(state);
}

export function getDemoProfile(): UserProfile {
  return readDemoState().profile;
}

export function upsertDemoProfile(input: { displayName: string; timezone: string }): void {
  const state = readDemoState();
  state.profile = { ...state.profile, display_name: input.displayName, timezone: input.timezone };
  writeDemoState(state);
}

export function listDemoGoals(): Goal[] {
  return readDemoState().goals.sort((a, b) => a.status.localeCompare(b.status) || b.created_at.localeCompare(a.created_at));
}

export function createDemoGoal(input: { title: string; category: HabitCategory; targetDate: string | null }): void {
  const state = readDemoState();
  state.goals.push({
    id: newId(),
    user_id: DEMO_USER_ID,
    title: input.title,
    category: input.category,
    target_date: input.targetDate,
    status: "active",
    created_at: new Date().toISOString()
  });
  writeDemoState(state);
}

export function listDemoWeeklyReviews(limit = 8): WeeklyReview[] {
  return readDemoState().weeklyReviews.sort((a, b) => b.week_start.localeCompare(a.week_start)).slice(0, limit);
}

export function upsertDemoWeeklyReview(input: Omit<WeeklyReview, "id" | "created_at" | "user_id">): void {
  const state = readDemoState();
  const index = state.weeklyReviews.findIndex((review) => review.week_start === input.week_start);
  const row: WeeklyReview = {
    id: index >= 0 ? state.weeklyReviews[index].id : newId(),
    user_id: DEMO_USER_ID,
    week_start: input.week_start,
    routine_summary: input.routine_summary,
    recovery_summary: input.recovery_summary,
    movement_summary: input.movement_summary,
    nutrition_summary: input.nutrition_summary,
    career_summary: input.career_summary,
    next_week_focus: input.next_week_focus,
    created_at: index >= 0 ? state.weeklyReviews[index].created_at : new Date().toISOString()
  };
  if (index >= 0) state.weeklyReviews[index] = row;
  else state.weeklyReviews.push(row);
  writeDemoState(state);
}

function createSeedState(): DemoState {
  const today = todayIso();
  const habits: Habit[] = [
    habit("habit-routine", "Morning planning", "routine", 5, -28),
    habit("habit-recovery", "Sleep wind-down", "recovery", 5, -27),
    habit("habit-movement", "Walk or workout", "movement", 4, -26),
    habit("habit-nutrition", "Hydration target", "nutrition", 7, -25),
    habit("habit-career", "Study session", "career", 5, -24)
  ];
  const checkins = Array.from({ length: 30 }, (_, index) => checkin(addDaysIso(today, index - 29), index));
  const habitLogs = habits.flatMap((habitItem, habitIndex) =>
    checkins
      .filter((_, index) => (index + habitIndex) % 3 !== 0)
      .map((checkinItem) => ({
        id: newId(),
        user_id: DEMO_USER_ID,
        habit_id: habitItem.id,
        log_date: checkinItem.checkin_date,
        completed: true,
        created_at: checkinItem.created_at
      }))
  );
  return {
    profile: { id: DEMO_USER_ID, display_name: "Varsh", timezone: "America/New_York", created_at: new Date().toISOString() },
    habits,
    habitLogs,
    checkins,
    scheduleEntries: [
      schedule("Plan the day", "routine", today, "08:30", "09:00", true),
      schedule("Deep work", "career", today, "09:30", "11:00", false),
      schedule("Walk", "movement", today, "18:00", "18:30", false)
    ],
    goals: [{ id: newId(), user_id: DEMO_USER_ID, title: "Build a steady weekday rhythm", category: "routine", target_date: addDaysIso(today, 21), status: "active", created_at: new Date().toISOString() }],
    weeklyReviews: []
  };
}

function habit(id: string, name: string, category: HabitCategory, target: number, offset: number): Habit {
  return { id, user_id: DEMO_USER_ID, name, category, target_per_week: target, is_active: true, created_at: new Date(Date.now() + offset * 86400000).toISOString() };
}

function checkin(date: string, index: number): DailyCheckin {
  const now = `${date}T12:00:00.000Z`;
  return {
    id: newId(),
    user_id: DEMO_USER_ID,
    checkin_date: date,
    bedtime: index % 4 === 0 ? "23:15" : "22:30",
    wake_time: index % 5 === 0 ? "07:10" : "06:30",
    sleep_quality: 3 + (index % 3),
    energy: 3 + ((index + 1) % 3),
    mood: 3 + ((index + 2) % 3),
    water_intake: 6 + (index % 5),
    workout_completed: index % 2 === 0,
    yoga_completed: index % 3 !== 0,
    meditation_completed: index % 4 !== 0,
    walking_completed: index % 5 !== 0,
    study_completed: index % 6 !== 0,
    study_duration_minutes: index % 6 !== 0 ? 45 + (index % 3) * 15 : 0,
    nutrition_adherence: 3 + (index % 3),
    weight: 172 - index * 0.04,
    notes: "Demo check-in for local testing.",
    created_at: now,
    updated_at: now
  };
}

function schedule(title: string, category: HabitCategory, date: string, start: string, end: string, completed: boolean): ScheduleEntry {
  return {
    id: newId(),
    user_id: DEMO_USER_ID,
    entry_date: date,
    planned_start: start,
    planned_end: end,
    actual_start: completed ? start : null,
    actual_end: completed ? end : null,
    title,
    category,
    completed,
    created_at: new Date().toISOString()
  };
}

function byDate<T extends Record<K, string>, K extends keyof T>(key: K): (a: T, b: T) => number {
  return (a, b) => a[key].localeCompare(b[key]);
}

function newId(): string {
  return crypto.randomUUID();
}
