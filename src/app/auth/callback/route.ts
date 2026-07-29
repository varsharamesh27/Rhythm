import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseConfiguration } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (!hasSupabaseConfiguration()) {
    return NextResponse.redirect(
      new URL("/login?message=Connect Supabase before using production tracking.", request.url)
    );
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next") ?? "/dashboard";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?message=The sign-in link is invalid or has expired.", request.url));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent(error.message)}`, request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
