import { expect, test } from "@playwright/test";

test("exits the local demo workspace", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.getByRole("button", { name: "Exit demo" }).click();

  await expect(page.getByRole("heading", { name: "Sign in to rhythm" })).toBeVisible();
});
