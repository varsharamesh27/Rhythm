export type HabitCategory = "routine" | "recovery" | "movement" | "nutrition" | "career";

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

export type DailyCheckinInsert = Omit<DailyCheckin, "id" | "created_at" | "updated_at">;

export type Database = {
  public: {
    Tables: {
      daily_checkins: {
        Row: DailyCheckin;
        Insert: Partial<DailyCheckin> & Pick<DailyCheckin, "user_id" | "checkin_date">;
        Update: Partial<DailyCheckin>;
      };
    };
  };
};
