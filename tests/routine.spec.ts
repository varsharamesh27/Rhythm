import { expect, test } from "@playwright/test";

test("uses the ideal schedule to plan a day without duplicates", async ({ page }) => {
  await page.goto("/schedule?view=ideal");
  const addStarter = page.getByRole("button", { name: "Add missing starter blocks" });
  if (await addStarter.isEnabled()) await addStarter.click();

  await expect(page.getByText("Wake up, make bed, open curtains, sunlight and fresh air")).toHaveCount(1);
  await expect(page.getByText("Lights out", { exact: true })).toHaveCount(1);

  await page.getByRole("link", { name: "Daily plan" }).click();
  await page.getByRole("button", { name: "Plan this day from ideal" }).click();
  await page.getByRole("button", { name: "Plan this day from ideal" }).click();

  await expect(page.getByText("Wake up, make bed, open curtains, sunlight and fresh air")).toHaveCount(1);
  await expect(page.getByText("Lights out", { exact: true })).toHaveCount(1);
});

test("creates, edits, and deletes an ideal block", async ({ page }) => {
  await page.goto("/schedule?view=ideal");
  const addForm = page.getByTestId("add-ideal-block-form");
  await addForm.getByLabel("Title").fill("Test evening reading");
  await addForm.getByLabel("Start").fill("20:30");
  await addForm.getByLabel("End").fill("21:00");
  await addForm.getByRole("button", { name: "Add ideal block" }).click();

  const block = page.locator("details").filter({ hasText: "Test evening reading" });
  await expect(block).toHaveCount(1);
  await block.locator("summary").click();
  await block.getByLabel("Title").fill("Test evening reflection");
  await block.getByRole("button", { name: "Save ideal block" }).click();

  const updatedBlock = page.locator("details").filter({ hasText: "Test evening reflection" });
  await expect(updatedBlock).toHaveCount(1);
  const deleteButton = updatedBlock.getByRole("button", { name: "Delete ideal block" });
  if (!(await deleteButton.isVisible())) await updatedBlock.locator("summary").click();
  await deleteButton.click();
  await expect(page.getByText("Test evening reflection", { exact: true })).toHaveCount(0);
});
