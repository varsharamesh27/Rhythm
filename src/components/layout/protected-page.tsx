import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUserId } from "@/lib/db/checkins";

export async function ProtectedPage({ children }: { children: ReactNode }) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  return <AppShell>{children}</AppShell>;
}
