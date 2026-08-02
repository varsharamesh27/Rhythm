import Link from "next/link";
import { CalendarDays, ClipboardList, CopyPlus, Plus, Save, Trash2 } from "lucide-react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { todayIso } from "@/lib/dates";
import { isDemoMode } from "@/lib/demo-mode";
import { getCurrentUserId } from "@/lib/db/auth";
import { listScheduleEntries, listScheduleTemplates } from "@/lib/db/schedule";
import { calculateScheduleAdherence, plannedMinutes } from "@/lib/metrics/schedule";
import { cn } from "@/lib/utils";
import type { HabitCategory, ScheduleEntry, ScheduleTemplate } from "@/types/database";
import {
  applyIdealScheduleAction,
  createScheduleEntryAction,
  createScheduleTemplateAction,
  deleteScheduleTemplateAction,
  importLocalIdealScheduleAction,
  updateScheduleActualAction,
  updateScheduleTemplateAction
} from "./actions";

const categories: Array<{ value: HabitCategory; label: string }> = [
  { value: "routine", label: "Routine" },
  { value: "recovery", label: "Recovery" },
  { value: "movement", label: "Movement" },
  { value: "nutrition", label: "Nutrition" },
  { value: "career", label: "Career" }
];

const weekdays = [
  { value: "", label: "Every day" },
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" }
];

type ScheduleView = "day" | "ideal";

export default async function SchedulePage({
  searchParams
}: {
  searchParams: Promise<{ date?: string; view?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const params = await searchParams;
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : todayIso();
  const view: ScheduleView = params.view === "ideal" ? "ideal" : "day";
  const [entries, templates] = await Promise.all([
    listScheduleEntries(userId, date),
    listScheduleTemplates(userId)
  ]);
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  const applicableTemplates = templates.filter(
    (template) => template.weekday === null || template.weekday === weekday
  );
  const demoMode = isDemoMode();
  const ownerLabel = demoMode ? "this local demo workspace" : "the signed-in account";
  const showLocalImport = process.env.NODE_ENV !== "production" && !demoMode;

  return (
    <AppShell>
      <div className="grid gap-6">
        <header>
          <h1 className="font-display text-4xl font-semibold">Schedule</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Each person builds a private ideal schedule. Their dated plans and actual times stay attached to the same account.
          </p>
        </header>

        <nav aria-label="Schedule views" className="flex gap-6 border-b border-border">
          <ScheduleTab
            active={view === "day"}
            href={`/schedule?date=${date}&view=day`}
            icon={CalendarDays}
            label="Daily plan"
          />
          <ScheduleTab
            active={view === "ideal"}
            href={`/schedule?date=${date}&view=ideal`}
            icon={ClipboardList}
            label="Ideal schedule"
          />
        </nav>

        {view === "ideal" ? (
          <IdealSchedule
            ownerLabel={ownerLabel}
            templates={templates}
            showLocalImport={showLocalImport}
          />
        ) : (
          <DailySchedule
            date={date}
            entries={entries}
            idealBlockCount={templates.length}
            applicableBlockCount={applicableTemplates.length}
            ownerLabel={ownerLabel}
          />
        )}
      </div>
    </AppShell>
  );
}

function ScheduleTab({
  active,
  href,
  icon: Icon,
  label
}: {
  active: boolean;
  href: string;
  icon: typeof CalendarDays;
  label: string;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold transition-colors",
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
      href={href}
    >
      <Icon size={17} />
      {label}
    </Link>
  );
}

function DailySchedule({
  date,
  entries,
  idealBlockCount,
  applicableBlockCount,
  ownerLabel
}: {
  date: string;
  entries: ScheduleEntry[];
  idealBlockCount: number;
  applicableBlockCount: number;
  ownerLabel: string;
}) {
  const adherence = calculateScheduleAdherence(entries);
  const plannedTotal = entries.reduce((total, entry) => total + plannedMinutes(entry), 0);

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Planned versus actual</CardTitle>
          <p className="text-sm text-muted-foreground">
            {entries.length} blocks - {plannedTotal} planned minutes - {adherence}% completed
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form className="flex max-w-xs items-end gap-2">
            <input name="view" type="hidden" value="day" />
            <Label>
              Date
              <Input name="date" type="date" defaultValue={date} />
            </Label>
            <Button type="submit" variant="secondary">View</Button>
          </form>

          {entries.length === 0 ? (
            <p className="border-l-2 border-border bg-muted p-4 text-sm text-muted-foreground">
              Nothing is planned for this date yet. Copy your ideal schedule or add a one-off block.
            </p>
          ) : null}

          {entries.map((entry) => (
            <article key={entry.id} className="grid gap-4 rounded-md border border-border p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-semibold text-foreground">{entry.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(entry.planned_start)}-{formatTime(entry.planned_end)} - {categoryLabel(entry.category)} - {plannedMinutes(entry)} minutes
                  </p>
                </div>
                <span className={entry.completed ? "border-l-2 border-accent bg-muted px-3 py-1 text-sm font-semibold text-accent" : "border-l-2 border-border bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground"}>
                  {entry.completed ? "Completed" : "Open"}
                </span>
              </div>
              <form action={updateScheduleActualAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
                <input type="hidden" name="entryId" value={entry.id} />
                <Label>
                  Actual start
                  <Input name="actualStart" type="time" defaultValue={entry.actual_start?.slice(0, 5) ?? ""} />
                </Label>
                <Label>
                  Actual end
                  <Input name="actualEnd" type="time" defaultValue={entry.actual_end?.slice(0, 5) ?? ""} />
                </Label>
                <label className="flex min-h-10 items-center gap-2 rounded-md bg-muted px-3 text-sm font-medium text-foreground">
                  <input name="completed" type="checkbox" defaultChecked={entry.completed} className="size-4 accent-[hsl(var(--primary))]" />
                  Done
                </label>
                <Button type="submit" variant="secondary">
                  <Save size={16} />
                  Save actual
                </Button>
              </form>
            </article>
          ))}
        </CardContent>
      </Card>

      <aside className="grid content-start gap-4">
        <Card className="border-l-2 border-l-accent">
          <CardHeader>
            <CardTitle>Ideal schedule</CardTitle>
            <p className="text-sm text-muted-foreground">
              {idealBlockCount === 0
                ? `${capitalize(ownerLabel)} has no reusable ideal blocks yet.`
                : `${applicableBlockCount} of ${ownerLabel}'s ${idealBlockCount} ideal blocks apply to this date.`}
            </p>
          </CardHeader>
          <CardContent className="grid gap-3">
            <form action={applyIdealScheduleAction}>
              <input type="hidden" name="entryDate" value={date} />
              <Button className="w-full gap-2" disabled={applicableBlockCount === 0} type="submit">
                <CopyPlus size={17} />
                Plan this day from ideal
              </Button>
            </form>
            <Link className="text-center text-sm font-semibold text-primary hover:underline" href={`/schedule?date=${date}&view=ideal`}>
              Review ideal schedule
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add one-off block</CardTitle>
            <p className="text-sm text-muted-foreground">For something needed on this date only.</p>
          </CardHeader>
          <CardContent>
            <form action={createScheduleEntryAction} className="grid gap-4">
              <input name="entryDate" type="hidden" value={date} />
              <Label>Title<Input name="title" required placeholder="Deep work" /></Label>
              <div className="grid grid-cols-2 gap-3">
                <Label>Start<Input name="plannedStart" type="time" defaultValue="09:00" required /></Label>
                <Label>End<Input name="plannedEnd" type="time" defaultValue="10:30" required /></Label>
              </div>
              <Label>
                Category
                <Select name="category" defaultValue="career">
                  {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                </Select>
              </Label>
              <Button className="gap-2" type="submit"><Plus size={17} />Add one-off block</Button>
            </form>
          </CardContent>
        </Card>
      </aside>
    </section>
  );
}

function IdealSchedule({
  templates,
  showLocalImport,
  ownerLabel
}: {
  templates: ScheduleTemplate[];
  showLocalImport: boolean;
  ownerLabel: string;
}) {
  const everydayCount = templates.filter((template) => template.weekday === null).length;

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Ideal schedule</CardTitle>
          <p className="text-sm text-muted-foreground">
            {templates.length} blocks owned by {ownerLabel} - {everydayCount} every day - past daily records stay unchanged
          </p>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="border-l-2 border-border bg-muted p-4 text-sm text-muted-foreground">
              {capitalize(ownerLabel)} has no ideal blocks yet. Add this person&apos;s routine; other users keep separate schedules.
            </p>
          ) : (
            <div className="border-y border-border">
              {templates.map((template) => (
                <details key={template.id} className="group border-b border-border last:border-b-0">
                  <summary className="grid cursor-pointer list-none gap-1 px-1 py-4 marker:hidden sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                    <span className="font-semibold text-foreground">
                      {formatTime(template.start_time)}-{formatTime(template.end_time)}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-foreground">{template.name}</span>
                      <span className="block text-sm capitalize text-muted-foreground">{categoryLabel(template.category)}</span>
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {weekdayLabel(template.weekday)} <span aria-hidden="true">+</span>
                    </span>
                  </summary>
                  <div className="grid gap-3 border-t border-border bg-muted/50 p-4">
                    <form action={updateScheduleTemplateAction} className="grid gap-3 md:grid-cols-2">
                      <input name="templateId" type="hidden" value={template.id} />
                      <Label className="md:col-span-2">
                        Title
                        <Input name="name" defaultValue={template.name} required />
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Label>Start<Input name="startTime" type="time" defaultValue={template.start_time.slice(0, 5)} required /></Label>
                        <Label>End<Input name="endTime" type="time" defaultValue={template.end_time.slice(0, 5)} required /></Label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Label>
                          Applies
                          <Select name="weekday" defaultValue={template.weekday?.toString() ?? ""}>
                            {weekdays.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}
                          </Select>
                        </Label>
                        <Label>
                          Category
                          <Select name="category" defaultValue={template.category}>
                            {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                          </Select>
                        </Label>
                      </div>
                      <Button className="gap-2 md:col-span-2 md:justify-self-start" type="submit" variant="secondary">
                        <Save size={16} />
                        Save ideal block
                      </Button>
                    </form>
                    <form action={deleteScheduleTemplateAction}>
                      <input name="templateId" type="hidden" value={template.id} />
                      <Button className="gap-2 text-destructive" type="submit" variant="ghost">
                        <Trash2 size={16} />
                        Delete ideal block
                      </Button>
                    </form>
                  </div>
                </details>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <aside className="grid content-start gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Add ideal block</CardTitle>
            <p className="text-sm text-muted-foreground">Saved only to {ownerLabel}.</p>
          </CardHeader>
          <CardContent>
            <form action={createScheduleTemplateAction} className="grid gap-4" data-testid="add-ideal-block-form">
              <Label>Title<Input name="name" required placeholder="Morning walk" /></Label>
              <div className="grid grid-cols-2 gap-3">
                <Label>Start<Input name="startTime" type="time" defaultValue="07:00" required /></Label>
                <Label>End<Input name="endTime" type="time" defaultValue="07:30" required /></Label>
              </div>
              <Label>
                Applies
                <Select name="weekday" defaultValue="">
                  {weekdays.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}
                </Select>
              </Label>
              <Label>
                Category
                <Select name="category" defaultValue="routine">
                  {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                </Select>
              </Label>
              <Button className="gap-2" type="submit"><Plus size={17} />Add ideal block</Button>
            </form>
          </CardContent>
        </Card>

        {showLocalImport ? (
          <Card className="border-l-2 border-l-accent">
            <CardHeader>
              <CardTitle>Move local schedule</CardTitle>
              <p className="text-sm text-muted-foreground">
                Import the ideal blocks from this computer&apos;s demo workspace into this signed-in Supabase account. This option is never shown in production.
              </p>
            </CardHeader>
            <CardContent>
              <form action={importLocalIdealScheduleAction}>
                <Button className="w-full gap-2" type="submit" variant="secondary">
                  <CopyPlus size={17} />
                  Import my local ideal schedule
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}
      </aside>
    </section>
  );
}

function formatTime(value: string): string {
  const [hourText, minute = "00"] = value.slice(0, 5).split(":");
  const hour = Number(hourText);
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
}

function weekdayLabel(weekday: number | null): string {
  return weekdays.find((day) => day.value === (weekday?.toString() ?? ""))?.label ?? "Every day";
}

function categoryLabel(category: HabitCategory): string {
  return categories.find((item) => item.value === category)?.label ?? category;
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
