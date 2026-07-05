import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DailyCheckin, DailyCheckinInsert } from "@/types/database";

export { getCurrentUserId } from "./auth";

export async function listRecentCheckins(userId: string, limit = 30): Promise<DailyCheckin[]> {
  noStore();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", userId)
    .order("checkin_date", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).reverse();
}

export async function getCheckinForDate(userId: string, date: string): Promise<DailyCheckin | null> {
  noStore();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", userId)
    .eq("checkin_date", date)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function upsertDailyCheckin(input: DailyCheckinInsert): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("daily_checkins").upsert(input, { onConflict: "user_id,checkin_date" });
  if (error) throw new Error(error.message);
}
