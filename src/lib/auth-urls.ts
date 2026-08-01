type AuthUrlEnvironment = {
  readonly NODE_ENV?: string;
  readonly SITE_URL?: string;
};

const LOCAL_SITE_URL = "http://127.0.0.1:3000";

export function getSiteOrigin(environment: AuthUrlEnvironment = process.env): string {
  const configuredUrl = environment.SITE_URL?.trim();
  if (!configuredUrl && environment.NODE_ENV === "production") {
    throw new Error("SITE_URL is required in production.");
  }

  const url = new URL(configuredUrl || LOCAL_SITE_URL);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("SITE_URL must use http or https.");
  }
  if (environment.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("SITE_URL must use https in production.");
  }
  return url.origin;
}

export function buildAuthUrl(
  pathname: string,
  searchParams: Record<string, string> = {},
  environment: AuthUrlEnvironment = process.env
): string {
  const url = new URL(pathname, getSiteOrigin(environment));
  Object.entries(searchParams).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

export function safeNextPath(requestedNext: string | null, fallback = "/dashboard"): string {
  if (requestedNext?.startsWith("/") && !requestedNext.startsWith("//")) {
    return requestedNext;
  }
  return fallback;
}
