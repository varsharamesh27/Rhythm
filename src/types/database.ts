export type HabitCategory = "routine" | "recovery" | "movement" | "nutrition" | "career";
export type GoalStatus = "active" | "paused" | "completed";
export type MealSlot = "breakfast" | "forenoon" | "lunch" | "evening" | "dinner";
export type WorkspaceRole = "member" | "owner";

export type ScheduleBlockInput = {
  title: string;
  plannedStart: string;
  plannedEnd: string;
  category: HabitCategory;
};

type DbRecord = object;

type Table<Row extends DbRecord, Insert extends DbRecord, Update extends DbRecord> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type UserProfile = DbRecord & {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  timezone: string;
  workspace_role: WorkspaceRole;
  leaderboard_opt_in: boolean;
  leaderboard_name: string | null;
  created_at: string;
};

export type LeaderboardEntry = {
  rank: number;
  user_id: string;
  public_name: string;
  weekly_score: number;
  habit_completions: number;
  habit_target: number;
  checkin_days: number;
};

export type Habit = DbRecord & {
  id: string;
  user_id: string;
  name: string;
  category: HabitCategory;
  target_per_week: number;
  is_active: boolean;
  created_at: string;
};

export type HabitLog = DbRecord & {
  id: string;
  user_id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
  created_at: string;
};

export type DailyCheckin = DbRecord & {
  id: string;
  user_id: string;
  checkin_date: string;
  bedtime: string | null;
  wake_time: string | null;
  sleep_quality: number;
  energy: number;
  mood: number;
  water_intake: number;
  workout_completed: boolean;
  yoga_completed: boolean;
  meditation_completed: boolean;
  walking_completed: boolean;
  study_completed: boolean;
  study_duration_minutes: number;
  nutrition_adherence: number;
  weight: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ScheduleEntry = DbRecord & {
  id: string;
  user_id: string;
  entry_date: string;
  planned_start: string;
  planned_end: string;
  actual_start: string | null;
  actual_end: string | null;
  title: string;
  category: HabitCategory;
  completed: boolean;
  created_at: string;
};

export type ScheduleTemplate = DbRecord & {
  id: string;
  user_id: string;
  name: string;
  weekday: number | null;
  start_time: string;
  end_time: string;
  category: HabitCategory;
  created_at: string;
};

export type Goal = DbRecord & {
  id: string;
  user_id: string;
  title: string;
  category: HabitCategory;
  target_date: string | null;
  status: GoalStatus;
  created_at: string;
};

export type WeeklyReview = DbRecord & {
  id: string;
  user_id: string;
  week_start: string;
  routine_summary: string | null;
  recovery_summary: string | null;
  movement_summary: string | null;
  nutrition_summary: string | null;
  career_summary: string | null;
  next_week_focus: string | null;
  created_at: string;
};

export type WeeklyMenuItem = DbRecord & {
  id: string;
  user_id: string;
  meal_date: string;
  meal_slot: MealSlot;
  meal_name: string;
  planned_quantity: number;
  actual_quantity: number | null;
  unit: string;
  calories_per_unit: number;
  planned_calories: number;
  actual_calories: number | null;
  created_at: string;
  updated_at: string;
};

export type DailyCheckinInsert = Omit<DailyCheckin, "id" | "created_at" | "updated_at">;
export type HabitInsert = Omit<Habit, "id" | "created_at">;
export type HabitLogInsert = Omit<HabitLog, "id" | "created_at">;
export type ScheduleEntryInsert = Omit<ScheduleEntry, "id" | "created_at" | "actual_start" | "actual_end" | "completed"> & Partial<Pick<ScheduleEntry, "actual_start" | "actual_end" | "completed">>;
export type ScheduleTemplateInsert = Omit<ScheduleTemplate, "id" | "created_at">;
export type GoalInsert = Omit<Goal, "id" | "created_at" | "status"> & Partial<Pick<Goal, "status">>;
export type WeeklyReviewInsert = Omit<WeeklyReview, "id" | "created_at">;
export type WeeklyMenuItemInsert = Omit<WeeklyMenuItem, "id" | "created_at" | "updated_at">;
export type WeeklyMenuItemUpsert = Omit<WeeklyMenuItem, "created_at" | "updated_at">;

export type Database = {
  public: {
    Tables: {
      users: Table<UserProfile, Partial<UserProfile> & Pick<UserProfile, "id">, Partial<UserProfile>>;
      habits: Table<Habit, HabitInsert, Partial<Habit>>;
      habit_logs: Table<HabitLog, HabitLogInsert, Partial<HabitLog>>;
      daily_checkins: Table<DailyCheckin, DailyCheckinInsert, Partial<DailyCheckin>>;
      schedule_templates: Table<ScheduleTemplate, ScheduleTemplateInsert, Partial<ScheduleTemplate>>;
      schedule_entries: Table<ScheduleEntry, ScheduleEntryInsert, Partial<ScheduleEntry>>;
      goals: Table<Goal, GoalInsert, Partial<Goal>>;
      weekly_reviews: Table<WeeklyReview, WeeklyReviewInsert, Partial<WeeklyReview>>;
      weekly_menu_items: Table<WeeklyMenuItem, WeeklyMenuItemInsert, Partial<WeeklyMenuItem>>;
    };
    Views: { [_ in never]: never };
    Functions: {
      get_weekly_leaderboard: {
        Args: Record<PropertyKey, never>;
        Returns: LeaderboardEntry[];
      };
    };
    Enums: {
      habit_category: HabitCategory;
      meal_slot: MealSlot;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
