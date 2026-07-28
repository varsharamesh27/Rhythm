import { unstable_noStore as noStore } from "next/cache";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WeeklyMenuItem, WeeklyMenuItemInsert } from "@/types/database";
import { listDemoWeeklyMenuItems, upsertDemoWeeklyMenuItems } from "./demo-store";

export async function listWeeklyMenuItems(
  userId: string,
  startDate: string,
  endDate: string
): Promise<WeeklyMenuItem[]> {
  noStore();
  if (isDemoMode()) return listDemoWeeklyMenuItems(startDate, endDate);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("weekly_menu_items")
    .select("*")
    .eq("user_id", userId)
    .gte("meal_date", startDate)
    .lte("meal_date", endDate)
    .order("meal_date", { ascending: true })
    .order("meal_slot", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function upsertWeeklyMenuItems(items: WeeklyMenuItemInsert[]): Promise<void> {
  if (isDemoMode()) {
    upsertDemoWeeklyMenuItems(items);
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("weekly_menu_items")
    .upsert(items, { onConflict: "user_id,meal_date,meal_slot" });
  if (error) throw new Error(error.message);
}
