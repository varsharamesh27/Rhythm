import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-sm text-stone-600">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-stone-950">{value}</div>
        <p className="mt-2 text-sm text-stone-600">{helper}</p>
      </CardContent>
    </Card>
  );
}
