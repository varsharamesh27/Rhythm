type AuthUrlEnvironment = {
  readonly NODE_ENV?: string;
  readonly SITE_URL?: string;
};

const LOCAL_SITE_URL = "http://localhost:3000";

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

export function canonicalLocalDevelopmentUrl(
  requestHost: string | null,
  pathname: string,
  search: string,
  environment: AuthUrlEnvironment = process.env
): string | null {
  if (environment.NODE_ENV === "production") return null;

  const siteOrigin = new URL(getSiteOrigin(environment));
  const hostname = requestHost?.split(":")[0]?.toLowerCase();
  const isLocalPair = new Set([hostname, siteOrigin.hostname]);
  if (!isLocalPair.has("localhost") || !isLocalPair.has("127.0.0.1")) {
    return null;
  }
  const port = requestHost?.split(":")[1] ?? "";
  if (port !== siteOrigin.port) return null;

  return new URL(`${pathname}${search}`, siteOrigin).toString();
}

export function safeNextPath(requestedNext: string | null, fallback = "/dashboard"): string {
  if (requestedNext?.startsWith("/") && !requestedNext.startsWith("//")) {
    return requestedNext;
  }
  return fallback;
}
