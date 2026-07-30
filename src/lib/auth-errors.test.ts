import { describe, expect, it } from "vitest";
import {
  getAuthCallbackErrorMessage,
  getOtpRequestErrorMessage,
  getOtpVerificationErrorMessage
} from "@/lib/auth-errors";

describe("authentication error messages", () => {
  it("explains Supabase email rate limits", () => {
    expect(getOtpRequestErrorMessage({ status: 429 })).toContain("up to one hour");
  });

  it("does not expose unknown OTP request errors", () => {
    expect(getOtpRequestErrorMessage({ message: "sensitive provider detail" })).toBe(
      "We could not send a sign-in code. Please wait a minute and try once more."
    );
  });

  it("gives a useful message for an invalid email code", () => {
    expect(getOtpVerificationErrorMessage({ code: "otp_expired" })).toContain(
      "expired"
    );
  });

  it("explains that PKCE links must return to the same browser", () => {
    expect(
      getAuthCallbackErrorMessage({
        message: "PKCE code verifier not found in storage."
      })
    ).toContain("same browser and device");
  });

  it("does not expose unknown provider errors", () => {
    expect(
      getAuthCallbackErrorMessage({ message: "sensitive provider detail" })
    ).toBe(
      "That sign-in link could not be verified. Return here and request one new link."
    );
  });
});
