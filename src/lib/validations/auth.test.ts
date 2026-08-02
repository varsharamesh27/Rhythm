import { describe, expect, it } from "vitest";
import {
  authEmailSchema,
  passwordResetSchema,
  passwordSignInSchema,
  passwordSignUpSchema
} from "./auth";

describe("account validation", () => {
  it("normalizes valid email addresses", () => {
    expect(authEmailSchema.parse("  person@example.com ")).toBe("person@example.com");
  });

  it("requires a valid email and an eight-character password", () => {
    expect(passwordSignInSchema.safeParse({ email: "person@example.com", password: "private-password" }).success).toBe(true);
    expect(passwordSignInSchema.safeParse({ email: "not-an-email", password: "short" }).success).toBe(false);
  });

  it("requires matching passwords for signup", () => {
    expect(passwordSignUpSchema.safeParse({
      firstName: "Varsha",
      lastName: "Balasubramaniam",
      email: "person@example.com",
      password: "private-password",
      confirmPassword: "private-password"
    }).success).toBe(true);
    expect(passwordSignUpSchema.safeParse({
      firstName: "",
      lastName: "Balasubramaniam",
      email: "person@example.com",
      password: "private-password",
      confirmPassword: "private-password"
    }).success).toBe(false);
    expect(passwordSignUpSchema.safeParse({
      firstName: "Varsha",
      lastName: "Balasubramaniam",
      email: "person@example.com",
      password: "private-password",
      confirmPassword: "different-password"
    }).success).toBe(false);
  });

  it("requires matching passwords when resetting", () => {
    expect(passwordResetSchema.safeParse({
      password: "new-private-password",
      confirmPassword: "new-private-password"
    }).success).toBe(true);
  });
});
