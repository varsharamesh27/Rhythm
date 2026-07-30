import { describe, expect, it } from "vitest";
import { authEmailSchema, emailOtpSchema } from "./auth";

describe("email OTP validation", () => {
  it("normalizes valid email addresses", () => {
    expect(authEmailSchema.parse("  person@example.com ")).toBe("person@example.com");
  });

  it("accepts supported numeric code lengths", () => {
    expect(emailOtpSchema.parse("123456")).toBe("123456");
    expect(emailOtpSchema.parse("12345678")).toBe("12345678");
  });

  it("rejects short or nonnumeric codes", () => {
    expect(emailOtpSchema.safeParse("12345").success).toBe(false);
    expect(emailOtpSchema.safeParse("12A456").success).toBe(false);
  });
});
