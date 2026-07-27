import { isOwnerEmail } from "@/lib/auth-configuration";
import { DEMO_USER_ID, isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUserId(): Promise<string | null> {
  if (isDemoMode()) return DEMO_USER_ID;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !isOwnerEmail(data.user.email)) return null;
  return data.user.id;
}
