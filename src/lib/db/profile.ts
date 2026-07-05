import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/database";

export async function getProfile(userId: string): Promise<UserProfile | null> {
  noStore();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertProfile(input: { userId: string; displayName: string; timezone: string }): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("users").upsert({
    id: input.userId,
    display_name: input.displayName,
    timezone: input.timezone
  });
  if (error) throw new Error(error.message);
}
