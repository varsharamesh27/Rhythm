"use server";

import { redirect } from "next/navigation";
import {
  hasSupabaseConfiguration,
  isDatabaseSetupRequired,
  isDemoMode
} from "@/lib/demo-mode";
import {
  getPasswordRecoveryErrorMessage,
  getPasswordSignInErrorMessage,
  getPasswordSignUpErrorMessage
} from "@/lib/auth-errors";
import { buildAuthUrl } from "@/lib/auth-urls";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  authEmailSchema,
  passwordSignInSchema,
  passwordSignUpSchema
} from "@/lib/validations/auth";

export async function signInWithPassword(formData: FormData) {
  requireSupabase();
  const parsed = passwordSignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });
  if (!parsed.success) {
    redirect(loginMessage(parsed.error.issues[0]?.message ?? "Enter a valid email and password."));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password
  });
  if (error) {
    console.error("Supabase password login failed", { code: error.code, status: error.status, message: error.message });
    redirect(loginMessage(getPasswordSignInErrorMessage(error)));
  }
  redirect("/dashboard");
}

export async function signUpWithPassword(formData: FormData) {
  requireSupabase();
  const parsed = passwordSignUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });
  if (!parsed.success) {
    redirect(`/login?mode=signup&message=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Check the account details.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    options: {
      emailRedirectTo: authCallbackUrl("/dashboard")
    }
  });
  if (error) {
    console.error("Supabase password signup failed", { code: error.code, status: error.status, message: error.message });
    redirect(`/login?mode=signup&message=${encodeURIComponent(getPasswordSignUpErrorMessage(error))}`);
  }
  if (data.session) redirect("/dashboard");
  if (data.user?.identities?.length === 0) {
    redirect(`/login?mode=forgot&message=${encodeURIComponent("This email already has a Rhythm account. Set a password using the reset link.")}`);
  }

  redirect(loginMessage("Check your email to confirm the account. If no message arrives, log in or reset the password instead."));
}

export async function requestPasswordReset(formData: FormData) {
  requireSupabase();
  const parsed = authEmailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    redirect(`/login?mode=forgot&message=${encodeURIComponent("Enter a valid email address.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.toLowerCase(), {
    redirectTo: authCallbackUrl("/reset-password")
  });
  if (error) {
    console.error("Supabase password recovery failed", { code: error.code, status: error.status, message: error.message });
    redirect(`/login?mode=forgot&message=${encodeURIComponent(getPasswordRecoveryErrorMessage(error))}`);
  }
  redirect(loginMessage("If an account exists for that email, Supabase will send a password reset link."));
}

export async function enterDemoWorkspace() {
  if (isDatabaseSetupRequired()) redirect(loginMessage("The production demo is disabled because its data would not be durable."));
  if (!isDemoMode()) redirect(loginMessage("Demo mode is available only during local development."));
  redirect("/dashboard?message=demo-mode");
}

function requireSupabase(): void {
  if (!hasSupabaseConfiguration()) redirect(loginMessage("Connect Supabase before using account tracking."));
}

function loginMessage(message: string): string {
  return `/login?message=${encodeURIComponent(message)}`;
}

function authCallbackUrl(next: string): string {
  return buildAuthUrl("/auth/callback", { next });
}
