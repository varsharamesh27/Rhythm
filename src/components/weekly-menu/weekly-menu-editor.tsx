"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle, Plus, Save, Trash2 } from "lucide-react";
import { saveWeeklyMenuAction } from "@/app/weekly-menu/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatShortDate } from "@/lib/dates";
import { calculateItemCalories } from "@/lib/metrics/calories";
import { MEAL_SLOTS } from "@/lib/weekly-menu";
import type { MealSlot, WeeklyMenuItem } from "@/types/database";

type EditableMenuItem = {
  id: string;
  mealDate: string;
  mealSlot: MealSlot;
  mealName: string;
  plannedQuantity: string;
  actualQuantity: string;
  unit: string;
  caloriesPerUnit: string;
};

type EditableField = keyof Pick<
  EditableMenuItem,
  "mealName" | "plannedQuantity" | "actualQuantity" | "unit" | "caloriesPerUnit"
>;

type WeeklyMenuEditorProps = {
  weekStart: string;
  dates: string[];
  initialItems: WeeklyMenuItem[];
};

export function WeeklyMenuEditor({ weekStart, dates, initialItems }: WeeklyMenuEditorProps) {
  const [items, setItems] = useState<EditableMenuItem[]>(() =>
    initialItems.map((item) => ({
      id: item.id,
      mealDate: item.meal_date,
      mealSlot: item.meal_slot,
      mealName: item.meal_name,
      plannedQuantity: String(item.planned_quantity),
      actualQuantity: item.actual_quantity === null ? "" : String(item.actual_quantity),
      unit: item.unit,
      caloriesPerUnit: String(item.calories_per_unit)
    }))
  );

  const summary = useMemo(() => summarizeEditableItems(items), [items]);
  const serializedItems = JSON.stringify(
    items
      .filter((item) => item.mealName.trim().length > 0)
      .map((item) => ({
        ...item,
        plannedQuantity: numberValue(item.plannedQuantity),
        actualQuantity: item.actualQuantity.trim() === "" ? null : numberValue(item.actualQuantity),
        caloriesPerUnit: numberValue(item.caloriesPerUnit)
      }))
  );

  function addItem(mealDate: string, mealSlot: MealSlot) {
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        mealDate,
        mealSlot,
        mealName: "",
        plannedQuantity: "1",
        actualQuantity: "",
        unit: "serving",
        caloriesPerUnit: ""
      }
    ]);
  }

  function updateItem(id: string, field: EditableField, value: string) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <form action={saveWeeklyMenuAction} className="grid gap-7">
      <input name="weekStart" type="hidden" value={weekStart} />
      <input name="items" type="hidden" value={serializedItems} />

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Weekly calorie summary">
        <Card>
          <CardHeader><CardTitle className="text-base">Planned</CardTitle></CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-semibold">{summary.plannedCalories.toLocaleString()} kcal</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {summary.plannedItems} {summary.plannedItems === 1 ? "item" : "items"} across {summary.plannedMeals} {summary.plannedMeals === 1 ? "meal" : "meals"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Eaten</CardTitle></CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-semibold">{summary.actualCalories.toLocaleString()} kcal</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Quantities recorded for {summary.recordedItems} {summary.recordedItems === 1 ? "item" : "items"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Calculation</CardTitle></CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-semibold">Qty x kcal</p>
            <p className="mt-1 text-sm text-muted-foreground">Per-unit values remain editable for your serving.</p>
          </CardContent>
        </Card>
      </section>

      <div className="flex justify-end">
        <SaveWeekButton />
      </div>

      {dates.map((date) => {
        const dayName = formatDayName(date);
        return (
          <section className="border-t border-border pt-5" key={date}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold">{dayName}</h2>
              <p className="text-sm text-muted-foreground">{formatShortDate(date)}</p>
            </div>

            <div className="divide-y divide-border">
              {MEAL_SLOTS.map((slot) => {
                const mealItems = items.filter(
                  (item) => item.mealDate === date && item.mealSlot === slot.value
                );
                const mealPlannedCalories = mealItems.reduce(
                  (total, item) => total + plannedCalories(item),
                  0
                );
                const mealActualCalories = mealItems.reduce(
                  (total, item) => total + (actualCalories(item) ?? 0),
                  0
                );
                const hasActualQuantity = mealItems.some(
                  (item) => item.actualQuantity.trim() !== ""
                );

                return (
                  <section className="py-5" key={slot.value}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[hsl(var(--nutrition))]">{slot.label}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {mealItems.length === 0
                            ? "No food items"
                            : `${mealPlannedCalories} kcal planned${hasActualQuantity ? ` - ${mealActualCalories} kcal eaten` : ""}`}
                        </p>
                      </div>
                      <Button
                        aria-label={`${dayName} ${slot.label} add item`}
                        onClick={() => addItem(date, slot.value)}
                        type="button"
                        variant="secondary"
                      >
                        <Plus className="mr-2" size={16} />Add item
                      </Button>
                    </div>

                    {mealItems.length > 0 ? (
                      <div className="mt-4 grid gap-4">
                        {mealItems.map((item, itemIndex) => {
                          const plannedTotal = plannedCalories(item);
                          const actualTotal = actualCalories(item);
                          const itemLabel = `${dayName} ${slot.label} item ${itemIndex + 1}`;

                          return (
                            <div className="border-l-2 border-[hsl(var(--nutrition))] bg-muted/40 p-4" key={item.id}>
                              <div className="flex items-end gap-3">
                                <Label className="min-w-0 flex-1">
                                  Food item
                                  <Input
                                    aria-label={`${itemLabel} food item`}
                                    autoComplete="off"
                                    onChange={(event) => updateItem(item.id, "mealName", event.target.value)}
                                    placeholder="e.g. idli"
                                    required
                                    value={item.mealName}
                                  />
                                </Label>
                                <Button
                                  aria-label={`${itemLabel} remove`}
                                  className="size-10 shrink-0 p-0"
                                  onClick={() => removeItem(item.id)}
                                  title="Remove food item"
                                  type="button"
                                  variant="ghost"
                                >
                                  <Trash2 size={17} />
                                </Button>
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
                                <Label>
                                  Planned qty
                                  <Input
                                    aria-label={`${itemLabel} planned quantity`}
                                    min="0"
                                    onChange={(event) => updateItem(item.id, "plannedQuantity", event.target.value)}
                                    required
                                    step="0.01"
                                    type="number"
                                    value={item.plannedQuantity}
                                  />
                                </Label>
                                <Label>
                                  Eaten qty
                                  <Input
                                    aria-label={`${itemLabel} eaten quantity`}
                                    min="0"
                                    onChange={(event) => updateItem(item.id, "actualQuantity", event.target.value)}
                                    placeholder="Optional"
                                    step="0.01"
                                    type="number"
                                    value={item.actualQuantity}
                                  />
                                </Label>
                                <Label>
                                  Unit
                                  <Input
                                    aria-label={`${itemLabel} unit`}
                                    onChange={(event) => updateItem(item.id, "unit", event.target.value)}
                                    placeholder="piece, cup, g"
                                    required
                                    value={item.unit}
                                  />
                                </Label>
                                <Label>
                                  kcal per unit
                                  <Input
                                    aria-label={`${itemLabel} calories per unit`}
                                    min="0"
                                    onChange={(event) => updateItem(item.id, "caloriesPerUnit", event.target.value)}
                                    required
                                    step="0.01"
                                    type="number"
                                    value={item.caloriesPerUnit}
                                  />
                                </Label>
                                <OutputValue label="Planned total" value={`${plannedTotal} kcal`} />
                                <OutputValue
                                  label="Eaten total"
                                  value={actualTotal === null ? "Not logged" : `${actualTotal} kcal`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="flex justify-end">
        <SaveWeekButton />
      </div>
    </form>
  );
}

function SaveWeekButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? (
        <LoaderCircle aria-hidden="true" className="mr-2 animate-spin" size={17} />
      ) : (
        <Save aria-hidden="true" className="mr-2" size={17} />
      )}
      {pending ? "Saving" : "Save week"}
    </Button>
  );
}

function OutputValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium leading-none">{label}</p>
      <p className="mt-2 flex min-h-10 items-center border-l border-border pl-3 text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}

function formatDayName(date: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    new Date(`${date}T12:00:00`)
  );
}

function numberValue(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function plannedCalories(item: EditableMenuItem): number {
  return calculateItemCalories(
    numberValue(item.plannedQuantity),
    numberValue(item.caloriesPerUnit)
  );
}

function actualCalories(item: EditableMenuItem): number | null {
  if (item.actualQuantity.trim() === "") return null;
  return calculateItemCalories(
    numberValue(item.actualQuantity),
    numberValue(item.caloriesPerUnit)
  );
}

function summarizeEditableItems(items: EditableMenuItem[]) {
  const namedItems = items.filter((item) => item.mealName.trim().length > 0);
  const plannedMeals = new Set(
    namedItems.map((item) => `${item.mealDate}:${item.mealSlot}`)
  );
  const recordedItems = namedItems.filter((item) => actualCalories(item) !== null);

  return {
    plannedCalories: namedItems.reduce((total, item) => total + plannedCalories(item), 0),
    actualCalories: recordedItems.reduce(
      (total, item) => total + (actualCalories(item) ?? 0),
      0
    ),
    plannedItems: namedItems.length,
    plannedMeals: plannedMeals.size,
    recordedItems: recordedItems.length
  };
}
