import { unstable_noStore as noStore } from "next/cache";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WeeklyMenuItem, WeeklyMenuItemUpsert } from "@/types/database";
import { listDemoWeeklyMenuItems, replaceDemoWeeklyMenuItems } from "./demo-store";

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
    .order("meal_slot", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function replaceWeeklyMenuItems(
  userId: string,
  weekStart: string,
  weekEnd: string,
  items: WeeklyMenuItemUpsert[]
): Promise<void> {
  if (isDemoMode()) {
    replaceDemoWeeklyMenuItems(weekStart, weekEnd, items);
    return;
  }

  const supabase = await createSupabaseServerClient();
  if (items.length > 0) {
    const { error: upsertError } = await supabase
      .from("weekly_menu_items")
      .upsert(items, { onConflict: "id" });
    if (upsertError) throw new Error(upsertError.message);
  }

  let deleteQuery = supabase
    .from("weekly_menu_items")
    .delete()
    .eq("user_id", userId)
    .gte("meal_date", weekStart)
    .lte("meal_date", weekEnd);

  if (items.length > 0) {
    deleteQuery = deleteQuery.not("id", "in", `(${items.map((item) => item.id).join(",")})`);
  }

  const { error: deleteError } = await deleteQuery;
  if (deleteError) throw new Error(deleteError.message);
}
