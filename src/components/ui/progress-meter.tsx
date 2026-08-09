import { cn } from "@/lib/utils";

export function ProgressMeter({ value, label, className }: { value: number; label: string; className?: string }) {
  const boundedValue = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-semibold tabular-nums text-muted-foreground">{boundedValue}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={boundedValue}>
        <div className="h-full rounded-full bg-primary transition-[width] duration-700 motion-reduce:transition-none" style={{ width: `${boundedValue}%` }} />
      </div>
    </div>
  );
}
