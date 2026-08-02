import { describe, expect, it } from "vitest";
import { NextResponse } from "next/server";
import { applySupabaseCookies } from "./route";

describe("Supabase route responses", () => {
  it("carries a refreshed session cookie onto a redirect", () => {
    const response = applySupabaseCookies(
      NextResponse.redirect("http://127.0.0.1:3000/reset-password", 303),
      [{ name: "sb-rhythm-auth-token", value: "session-value", options: { path: "/", httpOnly: true } }]
    );

    expect(response.headers.get("set-cookie")).toContain("sb-rhythm-auth-token=session-value");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  });
});
