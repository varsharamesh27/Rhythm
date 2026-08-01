"use server";

import { redirect } from "next/navigation";
import { getPasswordUpdateErrorMessage } from "@/lib/auth-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { passwordResetSchema } from "@/lib/validations/auth";

export async function updatePasswordAction(formData: FormData) {
  const parsed = passwordResetSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });
  if (!parsed.success) {
    redirect(`/reset-password?message=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Check the password details.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect(`/login?mode=forgot&message=${encodeURIComponent("Request a new password reset link.")}`);
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    console.error("Supabase password update failed", { code: error.code, status: error.status, message: error.message });
    redirect(`/reset-password?message=${encodeURIComponent(getPasswordUpdateErrorMessage(error))}`);
  }
  redirect("/dashboard");
}
