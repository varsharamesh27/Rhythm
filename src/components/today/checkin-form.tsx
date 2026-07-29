"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DailyCheckin } from "@/types/database";
import { saveDailyCheckin, type CheckinActionState } from "@/app/today/actions";

const initialState: CheckinActionState = { ok: false, message: "" };

export function CheckinForm({ today, existing }: { today: string; existing: DailyCheckin | null }) {
  const [state, action, pending] = useActionState(saveDailyCheckin, initialState);

  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-medium text-muted-foreground">Today&apos;s page</p>
        <CardTitle>Daily check-in</CardTitle>
        <p className="text-sm text-muted-foreground">A calm two-minute pass through routine, recovery, movement, nutrition, and career progress.</p>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-5" data-testid="daily-checkin-form">
          <div className="grid gap-4 md:grid-cols-3">
            <Label>Date<Input name="checkinDate" type="date" defaultValue={existing?.checkin_date ?? today} required /></Label>
            <Label>Bedtime<Input name="bedtime" type="time" defaultValue={existing?.bedtime ?? "22:30"} /></Label>
            <Label>Wake time<Input name="wakeTime" type="time" defaultValue={existing?.wake_time ?? "06:30"} /></Label>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Rating name="sleepQuality" label="Sleep quality" value={existing?.sleep_quality ?? 3} />
            <Rating name="energy" label="Energy" value={existing?.energy ?? 3} />
            <Rating name="mood" label="Mood" value={existing?.mood ?? 3} />
            <Rating name="nutritionAdherence" label="Nutrition consistency" value={existing?.nutrition_adherence ?? 3} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Label>Water intake<Input name="waterIntake" type="number" min="0" max="30" defaultValue={existing?.water_intake ?? 8} /></Label>
            <Label>Study duration minutes<Input name="studyDurationMinutes" type="number" min="0" max="1440" defaultValue={existing?.study_duration_minutes ?? 45} /></Label>
            <Label>Optional weight<Input name="weight" type="number" step="0.1" min="1" defaultValue={existing?.weight ?? ""} /></Label>
          </div>
          <fieldset className="grid gap-3 rounded-md border border-border p-4">
            <legend className="px-1 text-sm font-semibold text-foreground">Completed today</legend>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Check name="workoutCompleted" label="Workout" checked={existing?.workout_completed ?? false} />
              <Check name="yogaCompleted" label="Yoga" checked={existing?.yoga_completed ?? false} />
              <Check name="meditationCompleted" label="Meditation" checked={existing?.meditation_completed ?? false} />
              <Check name="walkingCompleted" label="Walking" checked={existing?.walking_completed ?? false} />
              <Check name="studyCompleted" label="Study session" checked={existing?.study_completed ?? false} />
            </div>
          </fieldset>
          <Label>Notes<Textarea name="notes" defaultValue={existing?.notes ?? ""} placeholder="What helped today? What needs gentler planning tomorrow?" /></Label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save check-in"}</Button>
            {state.message ? <p className={state.ok ? "text-sm text-accent" : "text-sm text-destructive"}>{state.message}</p> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Rating({ name, label, value }: { name: string; label: string; value: number }) {
  return <Label>{label}<Input name={name} type="number" min="1" max="5" defaultValue={value} required /></Label>;
}

function Check({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-md bg-muted px-3 py-2 text-sm font-medium text-foreground">
      <input name={name} type="checkbox" defaultChecked={checked} className="size-4 accent-[hsl(var(--primary))]" />
      {label}
    </label>
  );
}
