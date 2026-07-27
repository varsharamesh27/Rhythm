import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-600 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400 dark:focus-visible:outline-teal-400",
        variant === "secondary" && "bg-amber-50 text-zinc-900 hover:bg-amber-100 focus-visible:outline-amber-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:focus-visible:outline-amber-300",
        variant === "ghost" && "bg-transparent text-zinc-700 hover:bg-amber-50 focus-visible:outline-amber-600 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:outline-amber-300",
        className
      )}
      {...props}
    />
  );
}
