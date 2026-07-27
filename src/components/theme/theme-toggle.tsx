"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeChoice = "light" | "dark" | "system";

const choices: Array<{ value: ThemeChoice; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor }
];

function applyTheme(theme: ThemeChoice) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && prefersDark));
}

function readStoredTheme(): ThemeChoice {
  const saved = window.localStorage.getItem("rhythm-theme");
  return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<ThemeChoice>("system");

  useEffect(() => {
    const stored = readStoredTheme();
    setTheme(stored);
    applyTheme(stored);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      const current = readStoredTheme();
      if (current === "system") applyTheme(current);
    };
    media.addEventListener("change", syncSystemTheme);
    return () => media.removeEventListener("change", syncSystemTheme);
  }, []);

  function chooseTheme(nextTheme: ThemeChoice) {
    setTheme(nextTheme);
    window.localStorage.setItem("rhythm-theme", nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <div className="inline-flex rounded-md border border-rose-200 bg-white/90 p-1 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/90" aria-label="Color theme">
      {choices.map((choice) => {
        const Icon = choice.icon;
        const active = theme === choice.value;
        return (
          <button
            aria-pressed={active}
            className={cn(
              "inline-flex min-h-9 items-center justify-center gap-2 rounded px-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:outline-teal-400",
              active && "bg-rose-600 text-white hover:bg-rose-600 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-500"
            )}
            key={choice.value}
            onClick={() => chooseTheme(choice.value)}
            type="button"
          >
            <Icon size={16} aria-hidden="true" />
            {compact ? <span className="sr-only">{choice.label}</span> : <span>{choice.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
