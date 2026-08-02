"use client";

import type { ReactNode } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardMetrics } from "@/lib/metrics/checkins";

export function DashboardCharts({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Sleep-duration trend" empty={metrics.sleepTrend.length === 0}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={metrics.sleepTrend} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={[0, 12]} />
            <Tooltip />
            <Line type="monotone" dataKey="hours" stroke="#386b5a" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Weight trend" empty={metrics.weightTrend.length === 0}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={metrics.weightTrend} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} width={42} />
            <Tooltip />
            <Line type="monotone" dataKey="weight" stroke="#82334a" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, empty, children }: { title: string; empty: boolean; children: ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>{empty ? <p className="border-l-2 border-border bg-muted p-4 text-sm text-muted-foreground">Add a few check-ins to see this trend.</p> : children}</CardContent>
    </Card>
  );
}
