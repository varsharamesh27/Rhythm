import { cookies } from "next/headers";
import {
  DEMO_USER_ID,
  hasSupabaseConfiguration,
  isDemoMode
} from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentUserContext = {
  id: string;
  isAnonymous: boolean;
};

export async function getCurrentUserContext(): Promise<CurrentUserContext | null> {
  await cookies();
  if (isDemoMode()) {
    return { id: DEMO_USER_ID, isAnonymous: false };
  }
  if (!hasSupabaseConfiguration()) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return {
    id: data.user.id,
    isAnonymous: Boolean(data.user.is_anonymous)
  };
}

export async function getCurrentUserId(): Promise<string | null> {
  return (await getCurrentUserContext())?.id ?? null;
}
