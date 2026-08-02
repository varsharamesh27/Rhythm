import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, UtensilsCrossed } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { WeeklyMenuEditor } from "@/components/weekly-menu/weekly-menu-editor";
import { addDaysIso, formatShortDate, isIsoDate, mondayWeekStartIso, todayIso } from "@/lib/dates";
import { getCurrentUserId } from "@/lib/db/auth";
import { listWeeklyMenuItems } from "@/lib/db/weekly-menu";

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
              Plan each meal item, then record the quantity you ate. The weekly totals are context, not a grade.
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

        <WeeklyMenuEditor dates={dates} initialItems={items} weekStart={weekStart} />
      </div>
    </AppShell>
  );
}
