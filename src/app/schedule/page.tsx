import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { todayIso } from "@/lib/dates";
import { getCurrentUserId } from "@/lib/db/auth";
import { listScheduleEntries } from "@/lib/db/schedule";
import { calculateScheduleAdherence, plannedMinutes } from "@/lib/metrics/schedule";
import { PERSONAL_ROUTINE } from "@/lib/routine-preset";
import type { HabitCategory } from "@/types/database";
import { applyRoutinePresetAction, createScheduleEntryAction, updateScheduleActualAction } from "./actions";

const categories: Array<{ value: HabitCategory; label: string }> = [
  { value: "routine", label: "Routine" },
  { value: "recovery", label: "Recovery" },
  { value: "movement", label: "Movement" },
  { value: "nutrition", label: "Nutrition" },
  { value: "career", label: "Career" }
];

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const params = await searchParams;
  const date = params.date ?? todayIso();
  const entries = await listScheduleEntries(userId, date);
  const adherence = calculateScheduleAdherence(entries);
  const plannedTotal = entries.reduce((total, entry) => total + plannedMinutes(entry), 0);

  return (
    <AppShell>
      <div className="grid gap-6">
        <div>
          <h1 className="font-display text-4xl font-semibold">Schedule</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Plan the day, then record what actually happened. The goal is feedback, not perfection.</p>
        </div>
        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Planned versus actual</CardTitle>
              <p className="text-sm text-muted-foreground">{entries.length} blocks - {plannedTotal} planned minutes - {adherence}% completed</p>
            </CardHeader>
            <CardContent className="grid gap-4">
              <form className="flex max-w-xs items-end gap-2">
                <Label>Date<Input name="date" type="date" defaultValue={date} /></Label>
                <Button type="submit" variant="secondary">View</Button>
              </form>
              {entries.length === 0 ? <p className="border-l-2 border-border bg-muted p-4 text-sm text-muted-foreground">No schedule blocks for this date yet.</p> : null}
              {entries.map((entry) => (
                <article key={entry.id} className="grid gap-4 rounded-md border border-border p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-semibold text-foreground">{entry.title}</h2>
                      <p className="text-sm text-muted-foreground">{entry.planned_start}-{entry.planned_end} - {entry.category} - {plannedMinutes(entry)} minutes</p>
                    </div>
                    <span className={entry.completed ? "border-l-2 border-accent bg-muted px-3 py-1 text-sm font-semibold text-accent" : "border-l-2 border-border bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground"}>{entry.completed ? "Completed" : "Open"}</span>
                  </div>
                  <form action={updateScheduleActualAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
                    <input type="hidden" name="entryId" value={entry.id} />
                    <Label>Actual start<Input name="actualStart" type="time" defaultValue={entry.actual_start ?? ""} /></Label>
                    <Label>Actual end<Input name="actualEnd" type="time" defaultValue={entry.actual_end ?? ""} /></Label>
                    <label className="flex min-h-10 items-center gap-2 rounded-md bg-muted px-3 text-sm font-medium text-foreground"><input name="completed" type="checkbox" defaultChecked={entry.completed} className="size-4 accent-[hsl(var(--primary))]" /> Done</label>
                    <Button type="submit" variant="secondary">Save actual</Button>
                  </form>
                </article>
              ))}
            </CardContent>
          </Card>
          <aside className="grid content-start gap-4">
            <Card className="border-l-2 border-l-accent">
              <CardHeader>
                <CardTitle>My routine</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {PERSONAL_ROUTINE.length} blocks from 5:45 AM through lights out. Existing plans stay in place.
                </p>
              </CardHeader>
              <CardContent>
                <form action={applyRoutinePresetAction}>
                  <input type="hidden" name="entryDate" value={date} />
                  <Button className="w-full" type="submit">Add routine to this day</Button>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Add block</CardTitle></CardHeader>
              <CardContent>
                <form action={createScheduleEntryAction} className="grid gap-4">
                  <Label>Date<Input name="entryDate" type="date" defaultValue={date} required /></Label>
                  <Label>Title<Input name="title" required placeholder="Deep work" /></Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Label>Start<Input name="plannedStart" type="time" defaultValue="09:00" required /></Label>
                    <Label>End<Input name="plannedEnd" type="time" defaultValue="10:30" required /></Label>
                  </div>
                  <Label>Category<Select name="category" defaultValue="career">{categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</Select></Label>
                  <Button type="submit">Add block</Button>
                </form>
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
