import { expect, test } from "@playwright/test";

test("adds the personal routine without duplicating it", async ({ page }) => {
  await page.goto("/schedule");
  await page.getByRole("button", { name: "Add routine to this day" }).click();
  await page.getByRole("button", { name: "Add routine to this day" }).click();

  await expect(page.getByText("Wake up, make bed, open curtains, sunlight and fresh air")).toHaveCount(1);
  await expect(page.getByText("Lights out", { exact: true })).toHaveCount(1);
});
