import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const accents = ["border-t-rose-500", "border-t-teal-500", "border-t-amber-400", "border-t-violet-500", "border-t-orange-500"];

export function MetricCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  const accent = accents[Math.abs(hashTitle(title)) % accents.length];

  return (
    <Card className={`border-t-4 ${accent}`}>
      <CardHeader className="pb-3"><CardTitle className="text-sm text-zinc-600 dark:text-zinc-300">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">{value}</div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{helper}</p>
      </CardContent>
    </Card>
  );
}

function hashTitle(title: string): number {
  return Array.from(title).reduce((total, letter) => total + letter.charCodeAt(0), 0);
}
