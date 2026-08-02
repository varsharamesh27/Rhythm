import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseConfiguration } from "@/lib/demo-mode";

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

/**
 * Route handlers must attach refreshed Supabase cookies to the response they return.
 * Server-component cookies alone are not enough when a route immediately redirects.
 */
export function createSupabaseRouteClient(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!hasSupabaseConfiguration() || !url || !key) {
    throw new Error("Supabase is not configured for this environment.");
  }

  const pendingCookies: PendingCookie[] = [];
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: PendingCookie[]) {
        cookiesToSet.forEach((cookie) => {
          request.cookies.set(cookie.name, cookie.value);
          pendingCookies.push(cookie);
        });
      }
    }
  });

  return {
    supabase,
    redirect(urlToRedirect: string, status = 303): NextResponse {
      const response = NextResponse.redirect(urlToRedirect, status);
      applySupabaseCookies(response, pendingCookies);
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  };
}

export function applySupabaseCookies(response: NextResponse, cookies: readonly PendingCookie[]): NextResponse {
  cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}
