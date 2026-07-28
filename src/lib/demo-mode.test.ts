import { describe, expect, it } from "vitest";
import {
  hasSupabaseConfiguration,
  isDatabaseSetupRequired,
  isDemoMode
} from "./demo-mode";

describe("Supabase runtime configuration", () => {
  it("recognizes a configured Supabase project", () => {
    const environment = {
      NODE_ENV: "production",
      SUPABASE_URL: "https://project.supabase.co",
      SUPABASE_ANON_KEY: "publishable-key"
    } as const;

    expect(hasSupabaseConfiguration(environment)).toBe(true);
    expect(isDemoMode(environment)).toBe(false);
    expect(isDatabaseSetupRequired(environment)).toBe(false);
  });

  it("keeps the empty demo workspace available during local development", () => {
    const environment = {
      NODE_ENV: "development",
      SUPABASE_URL: "",
      SUPABASE_ANON_KEY: ""
    } as const;

    expect(hasSupabaseConfiguration(environment)).toBe(false);
    expect(isDemoMode(environment)).toBe(true);
    expect(isDatabaseSetupRequired(environment)).toBe(false);
  });

  it("blocks non-durable demo storage in production", () => {
    const environment = {
      NODE_ENV: "production",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_ANON_KEY: "placeholder"
    } as const;

    expect(hasSupabaseConfiguration(environment)).toBe(false);
    expect(isDemoMode(environment)).toBe(false);
    expect(isDatabaseSetupRequired(environment)).toBe(true);
  });
});
