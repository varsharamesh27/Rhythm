"use server";

import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOutAction() {
  if (!isDemoMode()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  const message = isDemoMode() ? "Demo workspace closed." : "You have been signed out.";
  redirect(`/login?message=${encodeURIComponent(message)}`);
}
