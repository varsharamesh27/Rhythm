import { NextResponse, type NextRequest } from "next/server";
import {
  hasSupabaseConfiguration,
  isDemoMode
} from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const redirectTo = (path: string, reason?: "database" | "anonymous") => {
    const url = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost ?? request.headers.get("host");
    const forwardedProtocol = request.headers.get("x-forwarded-proto");

    if (host) url.host = host;
    if (forwardedProtocol) url.protocol = `${forwardedProtocol}:`;
    url.pathname = path;
    url.search = reason ? `reason=${reason}` : "";
    url.hash = "";
    return NextResponse.redirect(url);
  };

  if (isDemoMode()) {
    return redirectTo(next);
  }
  if (!hasSupabaseConfiguration()) {
    return redirectTo("/access", "database");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (user) {
    return redirectTo(next);
  }

  const { error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error("Supabase anonymous sign-in failed", {
      code: error.code,
      status: error.status,
      message: error.message
    });
    return redirectTo("/access", "anonymous");
  }

  return redirectTo(next);
}

function safeNextPath(requestedNext: string | null): string {
  if (
    requestedNext &&
    requestedNext.startsWith("/") &&
    !requestedNext.startsWith("//")
  ) {
    return requestedNext;
  }
  return "/dashboard";
}
