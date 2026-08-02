import { unstable_noStore as noStore } from "next/cache";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/database";
import { getDemoProfile, upsertDemoProfile } from "./demo-store";

export async function getProfile(userId: string): Promise<UserProfile | null> {
  noStore();
  if (isDemoMode()) return getDemoProfile();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertProfile(input: { userId: string; displayName: string; timezone: string }): Promise<void> {
  if (isDemoMode()) {
    upsertDemoProfile(input);
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("users").upsert({
    id: input.userId,
    display_name: input.displayName,
    timezone: input.timezone
  });
  if (error) throw new Error(error.message);
}

export async function isWorkspaceOwner(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  return profile?.workspace_role === "owner";
}
