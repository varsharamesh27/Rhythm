import type { ComponentType } from "react";
import {
  BriefcaseBusiness,
  Dumbbell,
  MoonStar,
  Repeat2,
  Salad
} from "lucide-react";
import type { CategoryScores } from "@/lib/metrics/checkins";

const categories: Array<{
  key: keyof CategoryScores;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  barClass: string;
  textClass: string;
}> = [
  { key: "routine", label: "Routine", icon: Repeat2, barClass: "bg-[hsl(var(--routine))]", textClass: "text-[hsl(var(--routine))]" },
  { key: "recovery", label: "Recovery", icon: MoonStar, barClass: "bg-[hsl(var(--recovery))]", textClass: "text-[hsl(var(--recovery))]" },
  { key: "movement", label: "Movement", icon: Dumbbell, barClass: "bg-[hsl(var(--movement))]", textClass: "text-[hsl(var(--movement))]" },
  { key: "nutrition", label: "Nutrition", icon: Salad, barClass: "bg-[hsl(var(--nutrition))]", textClass: "text-[hsl(var(--nutrition))]" },
  { key: "career", label: "Career", icon: BriefcaseBusiness, barClass: "bg-[hsl(var(--career))]", textClass: "text-[hsl(var(--career))]" }
];

export function CategorySpectrum({ scores }: { scores: CategoryScores }) {
  return (
    <section className="border-y border-border bg-card" aria-labelledby="rhythm-spectrum-title">
      <div className="flex flex-col gap-1 border-b border-border px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold" id="rhythm-spectrum-title">Weekly balance</h2>
          <p className="text-sm text-muted-foreground">Five measures, kept independent by design.</p>
        </div>
        <p className="text-xs font-medium text-muted-foreground">Recent seven days</p>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-5">
        {categories.map((category) => {
          const Icon = category.icon;
          const score = scores[category.key];
          return (
            <div className="min-w-0 border-b border-border px-5 py-4 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 xl:border-b-0 xl:border-r xl:last:border-r-0" key={category.key}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className={`inline-flex items-center gap-2 text-sm font-semibold ${category.textClass}`}>
                  <Icon size={16} />
                  {category.label}
                </span>
                <span className="font-display text-lg font-semibold tabular-nums">{score}%</span>
              </div>
              <div
                aria-label={`${category.label} progress`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={score}
                className="h-1 overflow-hidden bg-muted"
                role="progressbar"
              >
                <div className={`h-full ${category.barClass}`} style={{ width: `${score}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
