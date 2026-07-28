import { expect, test } from "@playwright/test";

test("plans a weekly meal and records calories", async ({ page }) => {
  await page.goto("/weekly-menu");
  await expect(page.getByRole("heading", { name: "Weekly menu" })).toBeVisible();

  await page.getByLabel(/Monday Breakfast meal plan/i).fill("Oats and berries");
  await page.getByLabel(/Monday Breakfast planned calories/i).fill("350");
  await page.getByLabel(/Monday Breakfast actual calories/i).fill("370");
  await page.getByRole("button", { name: "Save week" }).first().click();

  await expect(page.getByRole("status")).toHaveText("Weekly menu saved.");
  await expect(page.getByLabel(/Monday Breakfast meal plan/i)).toHaveValue("Oats and berries");
});
