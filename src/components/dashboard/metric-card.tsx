import type { ComponentType } from "react";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricTone = "routine" | "recovery" | "movement" | "nutrition" | "career" | "neutral";

const toneClasses: Record<MetricTone, { border: string; icon: string; wash: string }> = {
  routine: { border: "border-t-rose-500", icon: "text-rose-600 dark:text-rose-400", wash: "bg-rose-50 dark:bg-rose-950/40" },
  recovery: { border: "border-t-cyan-500", icon: "text-cyan-700 dark:text-cyan-400", wash: "bg-cyan-50 dark:bg-cyan-950/40" },
  movement: { border: "border-t-lime-500", icon: "text-lime-700 dark:text-lime-400", wash: "bg-lime-50 dark:bg-lime-950/40" },
  nutrition: { border: "border-t-amber-400", icon: "text-amber-700 dark:text-amber-400", wash: "bg-amber-50 dark:bg-amber-950/40" },
  career: { border: "border-t-violet-500", icon: "text-violet-700 dark:text-violet-400", wash: "bg-violet-50 dark:bg-violet-950/40" },
  neutral: { border: "border-t-zinc-400", icon: "text-zinc-600 dark:text-zinc-300", wash: "bg-zinc-100 dark:bg-zinc-800" }
};

export function MetricCard({
  title,
  value,
  helper,
  tone = "neutral",
  icon: Icon = Activity
}: {
  title: string;
  value: string;
  helper: string;
  tone?: MetricTone;
  icon?: ComponentType<{ size?: number; className?: string }>;
}) {
  const colors = toneClasses[tone];

  return (
    <Card className={cn("border-t-4", colors.border)}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
        <CardTitle className="text-sm text-zinc-600 dark:text-zinc-300">{title}</CardTitle>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-md", colors.wash, colors.icon)} aria-hidden="true">
          <Icon size={18} />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black tabular-nums text-zinc-950 dark:text-zinc-50">{value}</div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{helper}</p>
      </CardContent>
    </Card>
  );
}
