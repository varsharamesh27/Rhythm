import { describe, expect, it } from "vitest";
import { settingsSchema } from "./settings";

const baseSettings = {
  firstName: "Avery",
  lastName: "Stone",
  timezone: "America/New_York"
};

describe("settingsSchema", () => {
  it("allows leaderboard participation with a public name", () => {
    expect(settingsSchema.safeParse({ ...baseSettings, leaderboardOptIn: true, leaderboardName: "Daybreak" }).success).toBe(true);
  });

  it("requires a public name when joining", () => {
    expect(settingsSchema.safeParse({ ...baseSettings, leaderboardOptIn: true, leaderboardName: "" }).success).toBe(false);
  });

  it("allows users to stay private without a public name", () => {
    expect(settingsSchema.safeParse({ ...baseSettings, leaderboardOptIn: false, leaderboardName: "" }).success).toBe(true);
  });
});

