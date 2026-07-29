import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Save, UtensilsCrossed } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDaysIso, formatShortDate, isIsoDate, mondayWeekStartIso, todayIso } from "@/lib/dates";
import { getCurrentUserId } from "@/lib/db/auth";
import { listWeeklyMenuItems } from "@/lib/db/weekly-menu";
import { summarizeWeeklyCalories } from "@/lib/metrics/calories";
import { MEAL_SLOTS, weeklyMenuFieldName } from "@/lib/weekly-menu";
import { saveWeeklyMenuAction } from "./actions";

export default async function WeeklyMenuPage({
  searchParams
}: {
  searchParams: Promise<{ week?: string; saved?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const params = await searchParams;
  const requestedDate = isIsoDate(params.week) ? params.week : todayIso();
  const weekStart = mondayWeekStartIso(requestedDate);
  const weekEnd = addDaysIso(weekStart, 6);
  const dates = Array.from({ length: 7 }, (_, index) => addDaysIso(weekStart, index));
  const items = await listWeeklyMenuItems(userId, weekStart, weekEnd);
  const itemByKey = new Map(items.map((item) => [`${item.meal_date}:${item.meal_slot}`, item]));
  const summary = summarizeWeeklyCalories(items);

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full border border-border text-[hsl(var(--nutrition))]">
                <UtensilsCrossed size={20} />
              </span>
              <h1 className="font-display text-4xl font-semibold">Weekly menu</h1>
            </div>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Plan each meal, then record actual calories when you know them. The weekly totals are context, not a grade.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              aria-label="Previous week"
              className="grid size-10 place-items-center rounded-md border border-border bg-card hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              href={`/weekly-menu?week=${addDaysIso(weekStart, -7)}`}
              title="Previous week"
            >
              <ArrowLeft size={18} />
            </Link>
            <span className="min-w-40 text-center text-sm font-semibold">
              {formatShortDate(weekStart)} - {formatShortDate(weekEnd)}
            </span>
            <Link
              aria-label="Next week"
              className="grid size-10 place-items-center rounded-md border border-border bg-card hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              href={`/weekly-menu?week=${addDaysIso(weekStart, 7)}`}
              title="Next week"
            >
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {params.saved === "1" ? (
          <p className="border-l-2 border-accent bg-muted p-3 text-sm font-medium text-foreground" role="status">
            Weekly menu saved.
          </p>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Weekly calorie summary">
          <Card>
            <CardHeader><CardTitle className="text-base">Planned</CardTitle></CardHeader>
            <CardContent><p className="font-display text-2xl font-semibold">{summary.plannedCalories.toLocaleString()} kcal</p><p className="mt-1 text-sm text-muted-foreground">{summary.plannedMeals} meals across {summary.plannedDays} days</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Recorded</CardTitle></CardHeader>
            <CardContent><p className="font-display text-2xl font-semibold">{summary.actualCalories.toLocaleString()} kcal</p><p className="mt-1 text-sm text-muted-foreground">{summary.recordedMeals} meals have actual calories</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Week</CardTitle></CardHeader>
            <CardContent><p className="font-display text-2xl font-semibold">{formatShortDate(weekStart)}</p><p className="mt-1 text-sm text-muted-foreground">Monday through Sunday</p></CardContent>
          </Card>
        </section>

        <form action={saveWeeklyMenuAction} className="grid gap-6">
          <input type="hidden" name="weekStart" value={weekStart} />
          <div className="flex justify-end">
            <Button type="submit"><Save size={17} className="mr-2" />Save week</Button>
          </div>

          {dates.map((date) => {
            const dayName = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "long" });
            return (
              <section className="border-t border-border pt-5" key={date}>
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold">{dayName}</h2>
                  <p className="text-sm text-muted-foreground">{formatShortDate(date)}</p>
                </div>
                <div className="hidden grid-cols-[110px_minmax(220px,1fr)_120px_120px] gap-3 border-b border-border pb-2 text-xs font-semibold text-muted-foreground sm:grid">
                  <span>Meal</span><span>Plan</span><span>Planned kcal</span><span>Actual kcal</span>
                </div>
                <div className="grid">
                  {MEAL_SLOTS.map((slot) => {
                    const item = itemByKey.get(`${date}:${slot.value}`);
                    return (
                      <div className="grid grid-cols-2 gap-3 border-b border-border py-4 last:border-b-0 sm:grid-cols-[110px_minmax(220px,1fr)_120px_120px] sm:items-end" key={slot.value}>
                        <p className="col-span-2 font-semibold text-[hsl(var(--nutrition))] sm:col-span-1">{slot.label}</p>
                        <Label className="col-span-2 sm:col-span-1">
                          <span className="sm:hidden">Meal plan</span>
                          <Input
                            aria-label={`${dayName} ${slot.label} meal plan`}
                            defaultValue={item?.meal_name ?? ""}
                            name={weeklyMenuFieldName(date, slot.value, "mealName")}
                            placeholder="Add meal"
                          />
                        </Label>
                        <Label>
                          <span className="sm:hidden">Planned calories</span>
                          <Input
                            aria-label={`${dayName} ${slot.label} planned calories`}
                            defaultValue={item?.planned_calories ?? 0}
                            min="0"
                            name={weeklyMenuFieldName(date, slot.value, "plannedCalories")}
                            type="number"
                          />
                        </Label>
                        <Label>
                          <span className="sm:hidden">Actual calories</span>
                          <Input
                            aria-label={`${dayName} ${slot.label} actual calories`}
                            defaultValue={item?.actual_calories ?? ""}
                            min="0"
                            name={weeklyMenuFieldName(date, slot.value, "actualCalories")}
                            placeholder="Optional"
                            type="number"
                          />
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <div className="flex justify-end">
            <Button type="submit"><Save size={17} className="mr-2" />Save week</Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
