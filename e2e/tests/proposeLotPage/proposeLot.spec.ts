import { test, expect } from "@playwright/test";

test.describe("proposerUnLot", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/propose-lot");
  });

  test("displays error if not authenticated", async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto("/propose-lot");

    expect(await expect(page).toHaveURL("/login"));
  });
});
