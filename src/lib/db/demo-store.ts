import { existsSync, readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { DEMO_USER_ID } from "@/lib/demo-mode";
import type {
  DailyCheckin,
  DailyCheckinInsert,
  Goal,
  Habit,
  HabitCategory,
  HabitLog,
  ScheduleBlockInput,
  ScheduleEntry,
  ScheduleTemplate,
  UserProfile,
  WeeklyMenuItem,
  WeeklyMenuItemInsert,
  WeeklyReview
} from "@/types/database";

type DemoState = {
  profile: UserProfile;
  habits: Habit[];
  habitLogs: HabitLog[];
  checkins: DailyCheckin[];
  scheduleTemplates: ScheduleTemplate[];
  scheduleEntries: ScheduleEntry[];
  weeklyMenuItems: WeeklyMenuItem[];
  goals: Goal[];
  weeklyReviews: WeeklyReview[];
};

const STORE_PATH = process.env.RHYTHM_DEMO_DATA_PATH
  ? resolve(process.cwd(), process.env.RHYTHM_DEMO_DATA_PATH)
  : join(process.cwd(), ".demo-data.json");

export function readDemoState(): DemoState {
  if (!existsSync(STORE_PATH)) {
    const seeded = createSeedState();
    writeDemoState(seeded);
    return seeded;
  }
  const state = JSON.parse(readFileSync(STORE_PATH, "utf8")) as DemoState;
  return {
    ...state,
    scheduleTemplates: state.scheduleTemplates ?? [],
    weeklyMenuItems: state.weeklyMenuItems ?? []
  };
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

export function listDemoScheduleTemplates(): ScheduleTemplate[] {
  return readDemoState().scheduleTemplates.sort((a, b) => a.start_time.localeCompare(b.start_time));
}

export function createDemoScheduleTemplate(input: {
  name: string;
  weekday: number | null;
  startTime: string;
  endTime: string;
  category: HabitCategory;
}): void {
  const state = readDemoState();
  state.scheduleTemplates.push({
    id: newId(),
    user_id: DEMO_USER_ID,
    name: input.name,
    weekday: input.weekday,
    start_time: input.startTime,
    end_time: input.endTime,
    category: input.category,
    created_at: new Date().toISOString()
  });
  writeDemoState(state);
}

export function updateDemoScheduleTemplate(input: {
  templateId: string;
  name: string;
  weekday: number | null;
  startTime: string;
  endTime: string;
  category: HabitCategory;
}): void {
  const state = readDemoState();
  state.scheduleTemplates = state.scheduleTemplates.map((template) =>
    template.id === input.templateId
      ? {
          ...template,
          name: input.name,
          weekday: input.weekday,
          start_time: input.startTime,
          end_time: input.endTime,
          category: input.category
        }
      : template
  );
  writeDemoState(state);
}

export function deleteDemoScheduleTemplate(templateId: string): void {
  const state = readDemoState();
  state.scheduleTemplates = state.scheduleTemplates.filter((template) => template.id !== templateId);
  writeDemoState(state);
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

export function addDemoRoutineEntries(date: string, blocks: ReadonlyArray<ScheduleBlockInput>): void {
  const state = readDemoState();
  const existing = new Set(
    state.scheduleEntries
      .filter((entry) => entry.entry_date === date)
      .map((entry) => `${entry.planned_start}:${entry.title}`)
  );

  for (const block of blocks) {
    const key = `${block.plannedStart}:${block.title}`;
    if (existing.has(key)) continue;
    state.scheduleEntries.push({
      id: newId(),
      user_id: DEMO_USER_ID,
      entry_date: date,
      planned_start: block.plannedStart,
      planned_end: block.plannedEnd,
      actual_start: null,
      actual_end: null,
      title: block.title,
      category: block.category,
      completed: false,
      created_at: new Date().toISOString()
    });
  }
  writeDemoState(state);
}

export function listDemoWeeklyMenuItems(startDate: string, endDate: string): WeeklyMenuItem[] {
  return readDemoState()
    .weeklyMenuItems
    .filter((item) => item.meal_date >= startDate && item.meal_date <= endDate)
    .sort((a, b) => a.meal_date.localeCompare(b.meal_date) || a.meal_slot.localeCompare(b.meal_slot));
}

export function upsertDemoWeeklyMenuItems(items: WeeklyMenuItemInsert[]): void {
  const state = readDemoState();
  const now = new Date().toISOString();

  for (const input of items) {
    const index = state.weeklyMenuItems.findIndex(
      (item) => item.meal_date === input.meal_date && item.meal_slot === input.meal_slot
    );
    const existing = index >= 0 ? state.weeklyMenuItems[index] : null;
    const row: WeeklyMenuItem = {
      id: existing?.id ?? newId(),
      ...input,
      created_at: existing?.created_at ?? now,
      updated_at: now
    };
    if (index >= 0) state.weeklyMenuItems[index] = row;
    else state.weeklyMenuItems.push(row);
  }
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
  return {
    profile: { id: DEMO_USER_ID, display_name: null, timezone: "America/New_York", created_at: new Date().toISOString() },
    habits: [],
    habitLogs: [],
    checkins: [],
    scheduleTemplates: [],
    scheduleEntries: [],
    weeklyMenuItems: [],
    goals: [],
    weeklyReviews: []
  };
}

function byDate<T extends Record<K, string>, K extends keyof T>(key: K): (a: T, b: T) => number {
  return (a, b) => a[key].localeCompare(b[key]);
}

function newId(): string {
  return crypto.randomUUID();
}
