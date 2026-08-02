import type { ComponentType } from "react";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricTone = "routine" | "recovery" | "movement" | "nutrition" | "career" | "neutral";

const toneClasses: Record<MetricTone, string> = {
  routine: "text-[hsl(var(--routine))]",
  recovery: "text-[hsl(var(--recovery))]",
  movement: "text-[hsl(var(--movement))]",
  nutrition: "text-[hsl(var(--nutrition))]",
  career: "text-[hsl(var(--career))]",
  neutral: "text-muted-foreground"
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
  const toneClass = toneClasses[tone];

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
        <CardTitle className="font-sans text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full border border-border", toneClass)} aria-hidden="true">
          <Icon size={18} />
        </span>
      </CardHeader>
      <CardContent>
        <div className="font-display text-3xl font-semibold tabular-nums text-foreground">{value}</div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
