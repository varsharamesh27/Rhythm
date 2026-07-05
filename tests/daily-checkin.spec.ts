import { expect, test } from "@playwright/test";

test("completes a daily check-in", async ({ page }) => {
  await page.goto("/today");
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
  await page.getByLabel("Water intake").fill("9");
  await page.getByLabel("Energy").fill("4");
  await page.getByLabel("Mood").fill("4");
  await page.getByLabel("Study duration minutes").fill("60");
  await page.getByLabel("Workout").check();
  await page.getByLabel("Walking").check();
  await page.getByLabel("Study").check();
  await page.getByRole("button", { name: "Save check-in" }).click();
  await expect(page.getByText("Saved. Your day is logged without judgment.")).toBeVisible();
});
