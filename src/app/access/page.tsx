import Link from "next/link";
import { AudioWaveform, Database, RefreshCw } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default async function AccessPage({
  searchParams
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const databaseMissing = reason === "database";

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-16 text-foreground">
      <div className="absolute right-4 top-4">
        <ThemeToggle compact />
      </div>
      <section className="w-full max-w-lg rounded-md border border-border bg-card p-7 shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:shadow-none sm:p-10">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-sm bg-foreground text-background">
            <AudioWaveform size={22} />
          </span>
          <span className="font-display text-2xl font-bold">Rhythm</span>
        </div>
        <div className="mt-9">
          <Database className="text-accent" size={26} />
          <h1 className="font-display mt-4 text-3xl font-semibold">
            {databaseMissing ? "Connect private storage" : "Workspace could not open"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {databaseMissing
              ? "Rhythm needs its Supabase project variables before it can store your records."
              : "Anonymous sign-ins must be enabled in Supabase before Rhythm can create a private browser workspace."}
          </p>
          <Link
            className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            href="/auth/anonymous?next=/dashboard"
          >
            <RefreshCw size={17} />
            Try again
          </Link>
        </div>
      </section>
    </main>
  );
}
