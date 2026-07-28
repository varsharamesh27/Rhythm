export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

type SupabaseEnvironment = {
  readonly SUPABASE_URL?: string;
  readonly SUPABASE_ANON_KEY?: string;
  readonly NODE_ENV?: "development" | "production" | "test";
};

export function hasSupabaseConfiguration(environment: SupabaseEnvironment = process.env): boolean {
  const url = environment.SUPABASE_URL?.trim();
  const key = environment.SUPABASE_ANON_KEY?.trim();
  return Boolean(
    url &&
      key &&
      !url.includes("example.supabase.co") &&
      !key.toLowerCase().includes("placeholder")
  );
}

export function isDemoMode(environment: SupabaseEnvironment = process.env): boolean {
  return environment.NODE_ENV !== "production" && !hasSupabaseConfiguration(environment);
}

export function isDatabaseSetupRequired(environment: SupabaseEnvironment = process.env): boolean {
  return environment.NODE_ENV === "production" && !hasSupabaseConfiguration(environment);
}
