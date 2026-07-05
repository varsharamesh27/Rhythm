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
        variant === "default" && "bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:outline-emerald-700",
        variant === "secondary" && "bg-stone-100 text-stone-900 hover:bg-stone-200 focus-visible:outline-stone-500",
        variant === "ghost" && "bg-transparent text-stone-700 hover:bg-stone-100 focus-visible:outline-stone-500",
        className
      )}
      {...props}
    />
  );
}
