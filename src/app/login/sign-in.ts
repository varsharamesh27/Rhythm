"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getOwnerEmail, normalizeEmail } from "@/lib/auth-configuration";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email();

export async function signInWithEmail(formData: FormData) {
  if (isDemoMode()) redirect("/dashboard?message=demo-mode");

  const parsedEmail = emailSchema.safeParse(formData.get("email"));
  if (!parsedEmail.success) redirect("/login?message=Enter a valid email address.");

  const email = normalizeEmail(parsedEmail.data);
  const ownerEmail = getOwnerEmail();
  if (!ownerEmail) {
    redirect("/login?message=The private owner email has not been configured.");
  }
  if (email !== ownerEmail) {
    redirect("/login?message=This private workspace is limited to its owner.");
  }

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      shouldCreateUser: true
    }
  });
  if (error) redirect(`/login?message=${encodeURIComponent(error.message)}`);
  redirect("/login?message=Check your email for a secure sign-in link.");
}

export async function enterDemoWorkspace() {
  if (!isDemoMode()) redirect("/login?message=Demo mode is available when Supabase environment variables are placeholders or missing.");
  redirect("/dashboard?message=demo-mode");
}
