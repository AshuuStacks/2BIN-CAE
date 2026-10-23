import { test, expect } from "@playwright/test";

test.describe("MyLotsPages", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/my-lots");
  });

  test("displays error if not authenticated", async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto("/my-lots");

    await expect(
      page.locator(".MuiAlert-root", {
        hasText: "Vous devez être connecté pour voir vos lots.",
      }),
    ).toBeVisible();
  });
});
