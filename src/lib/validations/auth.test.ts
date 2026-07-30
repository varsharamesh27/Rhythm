import { describe, expect, it } from "vitest";
import { authEmailSchema, emailOtpSchema, passwordSignInSchema } from "./auth";

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

  it("requires a valid email and an eight-character password", () => {
    expect(
      passwordSignInSchema.safeParse({
        email: "person@example.com",
        password: "private-password"
      }).success
    ).toBe(true);
    expect(
      passwordSignInSchema.safeParse({
        email: "not-an-email",
        password: "short"
      }).success
    ).toBe(false);
  });
});
