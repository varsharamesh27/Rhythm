"use client";

import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid gap-4 rounded-lg border border-red-200 bg-white p-6">
      <h1 className="text-xl font-semibold text-stone-950">Something needs attention</h1>
      <p className="text-sm text-stone-600">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
