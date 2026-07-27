import { expect, test } from "@playwright/test";

test("switches between dark and light theme", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.getByRole("button", { name: "Light" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});
