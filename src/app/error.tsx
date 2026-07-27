"use client";

import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid gap-4 rounded-lg border border-red-200 bg-white dark:bg-zinc-900 p-6">
      <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Something needs attention</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
