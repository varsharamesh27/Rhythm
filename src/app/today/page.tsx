import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CheckinForm } from "@/components/today/checkin-form";
import { getCheckinForDate, getCurrentUserId } from "@/lib/db/checkins";

export default async function TodayPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const today = new Date().toISOString().slice(0, 10);
  const existing = await getCheckinForDate(userId, today);

  return (
    <AppShell>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Today</h1>
          <p className="mt-2 max-w-2xl text-stone-600">Log what happened, then let the dashboard show the pattern. No single day gets to define the whole story.</p>
        </div>
        <CheckinForm today={today} existing={existing} />
      </div>
    </AppShell>
  );
}
