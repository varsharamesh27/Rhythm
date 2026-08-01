import { describe, expect, it } from "vitest";
import {
  getAuthCallbackErrorMessage,
  getPasswordRecoveryErrorMessage,
  getPasswordSignInErrorMessage,
  getPasswordSignUpErrorMessage
} from "@/lib/auth-errors";

describe("authentication error messages", () => {
  it("guides unknown accounts toward signup or recovery", () => {
    expect(getPasswordSignInErrorMessage({ message: "invalid login credentials" })).toContain("Create an account first");
  });

  it("does not expose unknown provider details", () => {
    expect(getPasswordSignInErrorMessage({ message: "sensitive provider detail" })).toBe(
      "We could not log in to this account. Please wait a minute and try again."
    );
    expect(getPasswordSignUpErrorMessage({ message: "sensitive provider detail" })).toBe(
      "We could not create the account. Check the details and try again."
    );
  });

  it("handles password recovery rate limits", () => {
    expect(getPasswordRecoveryErrorMessage({ status: 429 })).toContain("Wait a few minutes");
  });

  it("explains that PKCE links must return to the same browser", () => {
    expect(getAuthCallbackErrorMessage({ message: "PKCE code verifier not found in storage." })).toContain("same browser and device");
  });
});
