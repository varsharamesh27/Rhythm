"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addDaysIso, isIsoDate, mondayWeekStartIso } from "@/lib/dates";
import { getCurrentUserId } from "@/lib/db/auth";
import { upsertWeeklyMenuItems } from "@/lib/db/weekly-menu";
import { weeklyMenuSchema } from "@/lib/validations/weekly-menu";
import { MEAL_SLOTS, weeklyMenuFieldName } from "@/lib/weekly-menu";

export async function saveWeeklyMenuAction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const requestedWeekStart = String(formData.get("weekStart") ?? "");
  if (!isIsoDate(requestedWeekStart)) {
    throw new Error("Week start is invalid");
  }
  const weekStart = mondayWeekStartIso(requestedWeekStart);
  const items = Array.from({ length: 7 }, (_, dayOffset) => addDaysIso(weekStart, dayOffset)).flatMap(
    (mealDate) =>
      MEAL_SLOTS.map(({ value: mealSlot }) => ({
        mealDate,
        mealSlot,
        mealName: formData.get(weeklyMenuFieldName(mealDate, mealSlot, "mealName")) ?? "",
        plannedCalories:
          formData.get(weeklyMenuFieldName(mealDate, mealSlot, "plannedCalories")) ?? "0",
        actualCalories:
          formData.get(weeklyMenuFieldName(mealDate, mealSlot, "actualCalories")) ?? ""
      }))
  );

  const parsed = weeklyMenuSchema.safeParse({ weekStart, items });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Weekly menu is invalid");
  }

  await upsertWeeklyMenuItems(
    parsed.data.items.map((item) => ({
      user_id: userId,
      meal_date: item.mealDate,
      meal_slot: item.mealSlot,
      meal_name: item.mealName,
      planned_calories: item.plannedCalories,
      actual_calories: item.actualCalories
    }))
  );
  revalidatePath("/weekly-menu");
  revalidatePath("/dashboard");
  redirect(`/weekly-menu?week=${weekStart}&saved=1`);
}
