import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn("min-h-24 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-inner shadow-black/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary", className)}
      {...props}
    />
  );
}
