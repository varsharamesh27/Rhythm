"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PENDING_EMAIL_COOKIE } from "@/lib/auth-cookies";
import {
  hasSupabaseConfiguration,
  isDatabaseSetupRequired,
  isDemoMode
} from "@/lib/demo-mode";
import {
  getOtpRequestErrorMessage,
  getOtpVerificationErrorMessage
} from "@/lib/auth-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authEmailSchema, emailOtpSchema } from "@/lib/validations/auth";

export async function signInWithEmail(formData: FormData) {
  if (isDemoMode()) redirect("/dashboard?message=demo-mode");
  if (!hasSupabaseConfiguration()) {
    redirect("/login?message=Connect Supabase before using production tracking.");
  }

  const parsedEmail = authEmailSchema.safeParse(formData.get("email"));
  if (!parsedEmail.success) redirect("/login?message=Enter a valid email address.");

  await requestEmailCode(parsedEmail.data.toLowerCase());
}

export async function resendEmailCode() {
  const cookieStore = await cookies();
  const pendingEmail = cookieStore.get(PENDING_EMAIL_COOKIE)?.value;
  const parsedEmail = authEmailSchema.safeParse(pendingEmail);
  if (!parsedEmail.success) {
    redirect("/login?message=Enter your email address to request a new code.");
  }

  await requestEmailCode(parsedEmail.data.toLowerCase());
}

export async function verifyEmailCode(formData: FormData) {
  if (!hasSupabaseConfiguration()) {
    redirect("/login?message=Connect Supabase before using production tracking.");
  }

  const cookieStore = await cookies();
  const pendingEmail = cookieStore.get(PENDING_EMAIL_COOKIE)?.value;
  const parsedEmail = authEmailSchema.safeParse(pendingEmail);
  if (!parsedEmail.success) {
    redirect("/login?message=Your sign-in request expired. Enter your email to request a new code.");
  }

  const parsedToken = emailOtpSchema.safeParse(formData.get("token"));
  if (!parsedToken.success) {
    redirect(`/login?step=verify&message=${encodeURIComponent(parsedToken.error.issues[0]?.message ?? "Enter a valid sign-in code.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsedEmail.data,
    token: parsedToken.data,
    type: "email"
  });
  if (error) {
    console.error("Supabase email OTP verification failed", {
      code: error.code,
      status: error.status,
      message: error.message
    });
    redirect(`/login?step=verify&message=${encodeURIComponent(getOtpVerificationErrorMessage(error))}`);
  }

  cookieStore.delete(PENDING_EMAIL_COOKIE);
  redirect("/dashboard");
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

async function requestEmailCode(email: string): Promise<never> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true
    }
  });
  if (error) {
    console.error("Supabase email OTP request failed", {
      code: error.code,
      status: error.status,
      message: error.message
    });
    redirect(`/login?message=${encodeURIComponent(getOtpRequestErrorMessage(error))}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(PENDING_EMAIL_COOKIE, email, {
    httpOnly: true,
    maxAge: 15 * 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
  redirect("/login?step=verify&message=Enter the sign-in code from your newest email.");
}
