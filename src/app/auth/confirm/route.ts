import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseConfiguration } from "@/lib/demo-mode";
import { buildAuthUrl, safeNextPath } from "@/lib/auth-urls";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const EMAIL_OTP_TYPES: ReadonlySet<string> = new Set([
  "email",
  "email_change",
  "invite",
  "magiclink",
  "recovery",
  "signup"
]);

export async function GET(request: NextRequest) {
  if (!hasSupabaseConfiguration()) {
    return noStoreRedirect(loginMessage("Connect Supabase before using production tracking."));
  }

  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const requestedType = request.nextUrl.searchParams.get("type");
  const type = isEmailOtpType(requestedType) ? requestedType : null;

  if (!tokenHash || !type) {
    return noStoreRedirect(loginMessage("The account link is invalid or has expired. Request a new one."));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) {
    console.error("Supabase token confirmation failed", { code: error.code, status: error.status, message: error.message, type });
    return noStoreRedirect(loginMessage("That account link is invalid or has expired. Request a new one."));
  }

  const fallback = type === "recovery" ? "/reset-password" : "/dashboard";
  const requestedNext = safeNextPath(request.nextUrl.searchParams.get("next"), fallback);
  const next = type === "recovery" ? "/reset-password" : requestedNext;
  return noStoreRedirect(buildAuthUrl(next));
}

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return Boolean(value && EMAIL_OTP_TYPES.has(value));
}

function loginMessage(message: string): string {
  return buildAuthUrl("/login", { message });
}

function noStoreRedirect(url: string): NextResponse {
  const response = NextResponse.redirect(url, 303);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
