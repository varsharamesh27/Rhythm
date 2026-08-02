import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseConfiguration } from "@/lib/demo-mode";
import { getAuthCallbackErrorMessage } from "@/lib/auth-errors";
import { buildAuthUrl, safeNextPath } from "@/lib/auth-urls";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!hasSupabaseConfiguration()) {
    return noStoreRedirect(loginMessage("Connect Supabase before using production tracking."));
  }

  const code = request.nextUrl.searchParams.get("code");
  const providerError = request.nextUrl.searchParams.get("error");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));

  if (providerError) {
    return noStoreRedirect(loginMessage("Supabase could not verify that account link. Request a new one."));
  }
  if (!code) {
    return noStoreRedirect(loginMessage("The account link is invalid or has expired. Request a new one."));
  }

  const auth = createSupabaseRouteClient(request);
  const { supabase } = auth;
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("Supabase auth callback failed", { code: error.code, status: error.status, message: error.message });
    return noStoreRedirect(loginMessage(getAuthCallbackErrorMessage(error)));
  }

  return auth.redirect(buildAuthUrl(next));
}

function loginMessage(message: string): string {
  return buildAuthUrl("/login", { message });
}

function noStoreRedirect(url: string): NextResponse {
  const response = NextResponse.redirect(url, 303);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
