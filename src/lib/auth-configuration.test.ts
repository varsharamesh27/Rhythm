import { afterEach, describe, expect, it } from "vitest";
import { getOwnerEmail, isOwnerEmail, normalizeEmail } from "./auth-configuration";

const originalOwnerEmail = process.env.RHYTHM_OWNER_EMAIL;

afterEach(() => {
  if (originalOwnerEmail === undefined) {
    delete process.env.RHYTHM_OWNER_EMAIL;
  } else {
    process.env.RHYTHM_OWNER_EMAIL = originalOwnerEmail;
  }
});

describe("owner email configuration", () => {
  it("normalizes email casing and whitespace", () => {
    expect(normalizeEmail("  Owner@Example.COM ")).toBe("owner@example.com");
  });

  it("accepts only the configured owner", () => {
    process.env.RHYTHM_OWNER_EMAIL = "owner@example.com";

    expect(getOwnerEmail()).toBe("owner@example.com");
    expect(isOwnerEmail("OWNER@example.com")).toBe(true);
    expect(isOwnerEmail("someone@example.com")).toBe(false);
  });

  it("rejects every email when the owner is not configured", () => {
    delete process.env.RHYTHM_OWNER_EMAIL;

    expect(getOwnerEmail()).toBeNull();
    expect(isOwnerEmail("owner@example.com")).toBe(false);
  });
});
