import { describe, expect, it } from "vitest";
import {
  buildAuthUrl,
  canonicalLocalDevelopmentUrl,
  getSiteOrigin,
  safeNextPath
} from "./auth-urls";

describe("authentication URLs", () => {
  it("uses one canonical origin and removes configured paths", () => {
    expect(getSiteOrigin({ SITE_URL: "http://localhost:3000/some/path" })).toBe("http://localhost:3000");
  });

  it("builds encoded callback URLs", () => {
    expect(buildAuthUrl("/auth/callback", { next: "/reset-password" }, { SITE_URL: "http://localhost:3000" })).toBe(
      "http://localhost:3000/auth/callback?next=%2Freset-password"
    );
  });

  it("blocks external next destinations", () => {
    expect(safeNextPath("/settings")).toBe("/settings");
    expect(safeNextPath("//malicious.example")).toBe("/dashboard");
    expect(safeNextPath("https://malicious.example")).toBe("/dashboard");
  });

  it("requires https for a production origin", () => {
    expect(() => getSiteOrigin({ NODE_ENV: "production", SITE_URL: "http://example.com" })).toThrow("https");
  });

  it("keeps local authentication on the configured localhost origin", () => {
    expect(
      canonicalLocalDevelopmentUrl(
        "127.0.0.1:3000",
        "/login",
        "?mode=signup",
        { NODE_ENV: "development", SITE_URL: "http://localhost:3000" }
      )
    ).toBe("http://localhost:3000/login?mode=signup");
    expect(
      canonicalLocalDevelopmentUrl(
        "localhost:3000",
        "/login",
        "",
        { NODE_ENV: "development", SITE_URL: "http://localhost:3000" }
      )
    ).toBeNull();
  });
});
