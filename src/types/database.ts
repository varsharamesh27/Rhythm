export type HabitCategory = "routine" | "recovery" | "movement" | "nutrition" | "career";
export type GoalStatus = "active" | "paused" | "completed";

export type UserProfile = {
  id: string;
  display_name: string | null;
  timezone: string;
  created_at: string;
};

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  category: HabitCategory;
  target_per_week: number;
  is_active: boolean;
  created_at: string;
};

export type HabitLog = {
  id: string;
  user_id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
  created_at: string;
};

export type DailyCheckin = {
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

export type ScheduleEntry = {
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

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  category: HabitCategory;
  target_date: string | null;
  status: GoalStatus;
  created_at: string;
};

export type WeeklyReview = {
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

export type DailyCheckinInsert = Omit<DailyCheckin, "id" | "created_at" | "updated_at">;
export type HabitInsert = Omit<Habit, "id" | "created_at">;
export type HabitLogInsert = Omit<HabitLog, "id" | "created_at">;
export type ScheduleEntryInsert = Omit<ScheduleEntry, "id" | "created_at">;
export type GoalInsert = Omit<Goal, "id" | "created_at">;
export type WeeklyReviewInsert = Omit<WeeklyReview, "id" | "created_at">;

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: Partial<UserProfile> & Pick<UserProfile, "id">;
        Update: Partial<UserProfile>;
      };
      habits: {
        Row: Habit;
        Insert: Partial<Habit> & Pick<Habit, "user_id" | "name" | "category" | "target_per_week">;
        Update: Partial<Habit>;
      };
      habit_logs: {
        Row: HabitLog;
        Insert: Partial<HabitLog> & Pick<HabitLog, "user_id" | "habit_id" | "log_date">;
        Update: Partial<HabitLog>;
      };
      daily_checkins: {
        Row: DailyCheckin;
        Insert: Partial<DailyCheckin> & Pick<DailyCheckin, "user_id" | "checkin_date">;
        Update: Partial<DailyCheckin>;
      };
      schedule_entries: {
        Row: ScheduleEntry;
        Insert: Partial<ScheduleEntry> & Pick<ScheduleEntry, "user_id" | "entry_date" | "planned_start" | "planned_end" | "title" | "category">;
        Update: Partial<ScheduleEntry>;
      };
      goals: {
        Row: Goal;
        Insert: Partial<Goal> & Pick<Goal, "user_id" | "title" | "category">;
        Update: Partial<Goal>;
      };
      weekly_reviews: {
        Row: WeeklyReview;
        Insert: Partial<WeeklyReview> & Pick<WeeklyReview, "user_id" | "week_start">;
        Update: Partial<WeeklyReview>;
      };
    };
  };
};
