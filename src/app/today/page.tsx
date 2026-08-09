import Link from "next/link";
import { CheckCircle2, CircleDashed, Clock3, Coffee } from "lucide-react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CheckinForm } from "@/components/today/checkin-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCheckinForDate, getCurrentUserId } from "@/lib/db/checkins";
import { listScheduleEntries, listScheduleTemplates } from "@/lib/db/schedule";
import { applicableScheduleTemplatesForDate, isIdealScheduleDayComplete, isScheduleEntryOnTime } from "@/lib/metrics/schedule";
import type { ScheduleEntry } from "@/types/database";

export default async function TodayPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const today = new Date().toISOString().slice(0, 10);
  const [existing, entries, templates] = await Promise.all([
    getCheckinForDate(userId, today),
    listScheduleEntries(userId, today),
    listScheduleTemplates(userId)
  ]);
  const isSaturday = new Date(`${today}T00:00:00Z`).getUTCDay() === 6;
  const applicableTemplates = applicableScheduleTemplatesForDate(templates, today);
  const idealKeys = new Set(applicableTemplates.map((template) => `${template.start_time.slice(0, 5)}:${template.name}`));
  const idealEntries = entries.filter((entry) => idealKeys.has(`${entry.planned_start.slice(0, 5)}:${entry.title}`));

  return (
    <AppShell>
      <div className="grid gap-6">
        <div>
          <h1 className="font-display text-4xl font-semibold">Today</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Log what happened, then let the dashboard show the pattern. No single day gets to define the whole story.</p>
        </div>
        <IdealScheduleCheck entries={idealEntries} isSaturday={isSaturday} today={today} />
        <CheckinForm today={today} existing={existing} />
      </div>
    </AppShell>
  );
}

function IdealScheduleCheck({ entries, isSaturday, today }: { entries: ScheduleEntry[]; isSaturday: boolean; today: string }) {
  if (isSaturday) {
    return <Card className="border-l-2 border-l-[hsl(var(--recovery))]"><CardContent className="flex items-center gap-4 pt-5"><span className="grid size-11 place-items-center rounded-full bg-muted text-[hsl(var(--recovery))]"><Coffee size={21} /></span><div><p className="font-semibold">Saturday rest day</p><p className="mt-1 text-sm text-muted-foreground">No ideal schedule is applied. Sunday keeps its own routine.</p></div></CardContent></Card>;
  }

  const complete = isIdealScheduleDayComplete(entries);
  return (
    <Card className={complete ? "border-l-2 border-l-accent bg-accent/5" : "border-l-2 border-l-border"}>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div><CardTitle className="flex items-center gap-2">{complete ? <CheckCircle2 className="text-accent" size={21} /> : <Clock3 className="text-muted-foreground" size={21} />}Ideal schedule check</CardTitle><p className="mt-2 text-sm text-muted-foreground">{entries.length === 0 ? "No ideal activities have been planned for today yet." : complete ? "All ideal activities were completed on time." : `${entries.filter(isScheduleEntryOnTime).length} of ${entries.length} activities completed on time.`}</p></div>
        <Link className="shrink-0 text-sm font-semibold text-primary hover:underline" href={`/schedule?date=${today}&view=day`}>{entries.length === 0 ? "Plan today" : "Update times"}</Link>
      </CardHeader>
      {entries.length > 0 ? <CardContent><ul className="grid gap-2 sm:grid-cols-2">{entries.map((entry) => { const onTime = isScheduleEntryOnTime(entry); return <li className="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2 text-sm" key={entry.id}>{onTime ? <CheckCircle2 className="text-accent" size={17} /> : <CircleDashed className="text-muted-foreground" size={17} />}<span className="font-medium">{entry.title}</span><span className="ml-auto text-xs text-muted-foreground">{entry.planned_start.slice(0, 5)}–{entry.planned_end.slice(0, 5)}</span></li>; })}</ul><p className="mt-3 text-xs text-muted-foreground">On time allows a 15-minute grace period after the planned start and end.</p></CardContent> : null}
    </Card>
  );
}
