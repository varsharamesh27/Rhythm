"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInWithEmail(formData: FormData) {
  if (isDemoMode()) redirect("/dashboard?message=demo-mode");

  const email = String(formData.get("email") ?? "");
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/dashboard` }
  });
  if (error) redirect(`/login?message=${encodeURIComponent(error.message)}`);
  redirect("/login?message=Check your email for a secure sign-in link.");
}
