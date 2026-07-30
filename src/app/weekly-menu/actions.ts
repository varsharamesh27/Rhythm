"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addDaysIso, isIsoDate, mondayWeekStartIso } from "@/lib/dates";
import { getCurrentUserId } from "@/lib/db/auth";
import { replaceWeeklyMenuItems } from "@/lib/db/weekly-menu";
import { calculateItemCalories } from "@/lib/metrics/calories";
import { weeklyMenuSchema } from "@/lib/validations/weekly-menu";

export async function saveWeeklyMenuAction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const requestedWeekStart = String(formData.get("weekStart") ?? "");
  if (!isIsoDate(requestedWeekStart)) {
    throw new Error("Week start is invalid");
  }
  const weekStart = mondayWeekStartIso(requestedWeekStart);
  const weekEnd = addDaysIso(weekStart, 6);

  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    throw new Error("Weekly menu data is invalid");
  }

  const parsed = weeklyMenuSchema.safeParse({ weekStart, items });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Weekly menu is invalid");
  }

  const allowedDates = new Set(
    Array.from({ length: 7 }, (_, dayOffset) => addDaysIso(weekStart, dayOffset))
  );
  if (parsed.data.items.some((item) => !allowedDates.has(item.mealDate))) {
    throw new Error("Every food item must belong to the selected week");
  }
  if (new Set(parsed.data.items.map((item) => item.id)).size !== parsed.data.items.length) {
    throw new Error("Weekly menu contains duplicate food items");
  }

  await replaceWeeklyMenuItems(
    userId,
    weekStart,
    weekEnd,
    parsed.data.items.map((item) => ({
      id: item.id,
      user_id: userId,
      meal_date: item.mealDate,
      meal_slot: item.mealSlot,
      meal_name: item.mealName,
      planned_quantity: item.plannedQuantity,
      actual_quantity: item.actualQuantity,
      unit: item.unit,
      calories_per_unit: item.caloriesPerUnit,
      planned_calories: calculateItemCalories(item.plannedQuantity, item.caloriesPerUnit),
      actual_calories:
        item.actualQuantity === null
          ? null
          : calculateItemCalories(item.actualQuantity, item.caloriesPerUnit)
    }))
  );
  revalidatePath("/weekly-menu");
  revalidatePath("/dashboard");
  redirect(`/weekly-menu?week=${weekStart}&saved=1`);
}
