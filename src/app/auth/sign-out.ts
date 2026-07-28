"use server";

import { redirect } from "next/navigation";
import { hasSupabaseConfiguration, isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOutAction() {
  if (hasSupabaseConfiguration()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  const message = isDemoMode()
    ? "Demo workspace closed."
    : hasSupabaseConfiguration()
      ? "You have been signed out."
      : "Supabase setup is still required.";
  redirect(`/login?message=${encodeURIComponent(message)}`);
}
