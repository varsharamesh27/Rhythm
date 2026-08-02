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
        variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-primary",
        variant === "secondary" && "border border-border bg-card text-foreground hover:bg-muted focus-visible:outline-primary",
        variant === "ghost" && "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-primary",
        className
      )}
      {...props}
    />
  );
}
