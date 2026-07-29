import { describe, expect, it } from "vitest";
import {
  getAuthCallbackErrorMessage,
  getMagicLinkErrorMessage
} from "@/lib/auth-errors";

describe("authentication error messages", () => {
  it("explains Supabase email rate limits", () => {
    expect(getMagicLinkErrorMessage({ status: 429 })).toContain("up to one hour");
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
