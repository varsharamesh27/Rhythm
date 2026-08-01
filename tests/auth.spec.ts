import { expect, test } from "@playwright/test";

test("opens the workspace without a login screen", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
    timeout: 15000
  });
  await expect(page.getByRole("heading", { name: /sign in/i })).toHaveCount(0);
});
