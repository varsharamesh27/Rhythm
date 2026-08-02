import { expect, test } from "@playwright/test";

test("plans multiple breakfast items and calculates calories from quantities", async ({ page }) => {
  await page.goto("/weekly-menu");
  await expect(page.getByRole("heading", { name: "Weekly menu" })).toBeVisible();

  const addBreakfastItem = page.getByRole("button", { name: "Monday Breakfast add item" });

  await addBreakfastItem.click();
  await page.getByLabel("Monday Breakfast item 1 food item").fill("Idli");
  await page.getByLabel("Monday Breakfast item 1 planned quantity").fill("2");
  await page.getByLabel("Monday Breakfast item 1 eaten quantity").fill("3");
  await page.getByLabel("Monday Breakfast item 1 unit").fill("piece");
  await page.getByLabel("Monday Breakfast item 1 calories per unit").fill("58");

  await addBreakfastItem.click();
  await page.getByLabel("Monday Breakfast item 2 food item").fill("Sambar");
  await page.getByLabel("Monday Breakfast item 2 planned quantity").fill("1");
  await page.getByLabel("Monday Breakfast item 2 eaten quantity").fill("0.75");
  await page.getByLabel("Monday Breakfast item 2 unit").fill("cup");
  await page.getByLabel("Monday Breakfast item 2 calories per unit").fill("140");

  await addBreakfastItem.click();
  await page.getByLabel("Monday Breakfast item 3 food item").fill("Banana");
  await page.getByLabel("Monday Breakfast item 3 planned quantity").fill("1");
  await page.getByLabel("Monday Breakfast item 3 eaten quantity").fill("1");
  await page.getByLabel("Monday Breakfast item 3 unit").fill("medium");
  await page.getByLabel("Monday Breakfast item 3 calories per unit").fill("105");

  await expect(page.getByText("361 kcal planned - 384 kcal eaten")).toBeVisible();
  await page.getByRole("button", { name: "Save week" }).first().click();

  await expect(page.getByRole("status")).toHaveText("Weekly menu saved.");
  await expect(page.getByLabel("Monday Breakfast item 1 food item")).toHaveValue("Idli");
  await expect(page.getByLabel("Monday Breakfast item 2 food item")).toHaveValue("Sambar");
  await expect(page.getByLabel("Monday Breakfast item 3 food item")).toHaveValue("Banana");
  await expect(page.getByText("361 kcal planned - 384 kcal eaten")).toBeVisible();
});
