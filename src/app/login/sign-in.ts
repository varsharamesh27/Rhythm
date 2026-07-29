"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  hasSupabaseConfiguration,
  isDatabaseSetupRequired,
  isDemoMode
} from "@/lib/demo-mode";
import { getMagicLinkErrorMessage } from "@/lib/auth-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email();

export async function signInWithEmail(formData: FormData) {
  if (isDemoMode()) redirect("/dashboard?message=demo-mode");
  if (!hasSupabaseConfiguration()) {
    redirect("/login?message=Connect Supabase before using production tracking.");
  }

  const parsedEmail = emailSchema.safeParse(formData.get("email"));
  if (!parsedEmail.success) redirect("/login?message=Enter a valid email address.");

  const requestOrigin = (await headers()).get("origin");
  const origin = process.env.SITE_URL?.replace(/\/$/, "") ?? requestOrigin ?? "http://127.0.0.1:3000";
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsedEmail.data.toLowerCase(),
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      shouldCreateUser: true
    }
  });
  if (error) {
    console.error("Supabase magic-link request failed", {
      code: error.code,
      status: error.status,
      message: error.message
    });
    redirect(`/login?message=${encodeURIComponent(getMagicLinkErrorMessage(error))}`);
  }
  redirect("/login?message=Check your email for a secure sign-in link.");
}

export async function enterDemoWorkspace() {
  if (isDatabaseSetupRequired()) {
    redirect("/login?message=The production demo is disabled because its data would not be durable.");
  }
  if (!isDemoMode()) {
    redirect("/login?message=Demo mode is available only during local development.");
  }
  redirect("/dashboard?message=demo-mode");
}
