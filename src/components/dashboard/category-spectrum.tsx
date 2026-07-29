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
  { key: "routine", label: "Routine", icon: Repeat2, barClass: "bg-rose-500", textClass: "text-rose-600 dark:text-rose-400" },
  { key: "recovery", label: "Recovery", icon: MoonStar, barClass: "bg-cyan-500", textClass: "text-cyan-700 dark:text-cyan-400" },
  { key: "movement", label: "Movement", icon: Dumbbell, barClass: "bg-lime-500", textClass: "text-lime-700 dark:text-lime-400" },
  { key: "nutrition", label: "Nutrition", icon: Salad, barClass: "bg-amber-400", textClass: "text-amber-700 dark:text-amber-400" },
  { key: "career", label: "Career", icon: BriefcaseBusiness, barClass: "bg-violet-500", textClass: "text-violet-700 dark:text-violet-400" }
];

export function CategorySpectrum({ scores }: { scores: CategoryScores }) {
  return (
    <section className="border-y border-zinc-200 bg-white px-4 py-5 dark:border-zinc-800 dark:bg-zinc-950" aria-labelledby="rhythm-spectrum-title">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold" id="rhythm-spectrum-title">Rhythm spectrum</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Five signals, kept separate so one number never defines the week.</p>
        </div>
        <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Recent seven days</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {categories.map((category) => {
          const Icon = category.icon;
          const score = scores[category.key];
          return (
            <div className="min-w-0" key={category.key}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className={`inline-flex items-center gap-2 text-sm font-bold ${category.textClass}`}>
                  <Icon size={16} />
                  {category.label}
                </span>
                <span className="text-sm font-black tabular-nums">{score}%</span>
              </div>
              <div
                aria-label={`${category.label} progress`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={score}
                className="h-2 overflow-hidden rounded-sm bg-zinc-100 dark:bg-zinc-800"
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
