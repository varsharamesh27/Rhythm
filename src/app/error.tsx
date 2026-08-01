"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Rhythm page error", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-16 text-foreground">
      <section className="w-full max-w-lg rounded-md border border-border bg-card p-7 shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:shadow-none sm:p-10">
        <p className="text-sm font-medium text-muted-foreground">Rhythm</p>
        <h1 className="font-display mt-3 text-3xl font-semibold">This page needs another try</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Your existing records are unchanged. Restart this page, or return to the account screen if the issue happened while signing in.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button className="gap-2" onClick={reset} type="button"><RefreshCw size={17} />Try again</Button>
          <Link className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" href="/login">Account</Link>
        </div>
      </section>
    </main>
  );
}
