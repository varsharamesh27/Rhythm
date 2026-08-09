import { describe, expect, it } from "vitest";
import { weeklyMovementActivityPoints } from "./leaderboard";

const day = (gym: boolean, walk: boolean, yoga = false) => ({
  workout_completed: gym,
  walking_completed: walk,
  yoga_completed: yoga
});

describe("weeklyMovementActivityPoints", () => {
  it("awards full coverage for three gym days and walks on the other four days", () => {
    expect(weeklyMovementActivityPoints([
      day(true, false, true), day(true, false, true), day(true, false, true),
      day(false, true, true), day(false, true, true), day(false, true, true), day(false, true, true)
    ])).toBe(10);
  });

  it("lets extra gym days replace required walk days", () => {
    expect(weeklyMovementActivityPoints([
      day(true, false), day(true, false), day(true, false), day(true, false), day(true, false),
      day(false, true), day(false, true)
    ])).toBe(8);
  });

  it("reduces points when the three-day gym minimum is missed", () => {
    expect(weeklyMovementActivityPoints([
      day(true, false), day(true, false), day(false, true), day(false, true),
      day(false, true), day(false, true), day(false, true)
    ])).toBe(6);
  });
});
