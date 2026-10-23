import { test, expect } from "@playwright/test";
import { goFromHomePageToLoginPage, loginWith } from "./rememberMeHelper";

test.describe("Remember Me", () => {
  // Before each test, navigate to the login page
  test.beforeEach(async ({ page }) => {
    await goFromHomePageToLoginPage(page);
  });

  // Test case to ensure the user stays logged in when "Remember Me" is checked
  test('should stay logged in when "Remember Me" is checked', async ({
    page,
  }) => {
    const email = "client@gmail.com";
    const password = "Admin&123";

    // Perform login with "Remember Me" checked
    await loginWith(page, email, password, true);

    // Wait for the redirection to the home page
    // Vérifier la redirection vers la page d'accueil
    await expect(page).toHaveURL("/", { timeout: 10000 });

    // Vérifier que le bouton "Déconnexion" est visible
    await expect(page.locator('button:has-text("Compte")')).toBeVisible();

    await page.waitForTimeout(3000);

    // Refresh the page
    await page.reload();

    // Vérifier la redirection vers la page d'accueil
    await expect(page).toHaveURL("/", { timeout: 10000 });

    // Vérifier que le bouton "Déconnexion" est visible
    await expect(page.locator('button:has-text("Compte")')).toBeVisible();
  });

  // Test case to ensure the user is logged out when "Remember Me" is not checked
  test('should be logged out when "Remember Me" is not checked', async ({
    page,
  }) => {
    const email = "client@gmail.com";
    const password = "Admin&123";

    // Perform login without "Remember Me" checked
    await loginWith(page, email, password, false);

    // Wait for the redirection to the home page
    await page.goto("/");
    await expect(page).toHaveURL("/", { timeout: 10000 });

    // Refresh the page
    await page.reload();

    // Verify that the user is logged out and the welcome message is not displayed
    await expect(page).toHaveURL("/", { timeout: 10000 });
  });
});
