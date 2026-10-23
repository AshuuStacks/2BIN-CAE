import { test, expect } from "@playwright/test";
import { goFromHomePageToLoginPage, loginWith } from "./loginHelper";

test.describe("Login", () => {
  // Before each test, navigate to the login page
  test.beforeEach(async ({ page }) => {
    await goFromHomePageToLoginPage(page);
  });

  // Test case to login with valid credentials
  test("TC1.2:should login with valid credentials", async ({ page }) => {
    const email = "client@gmail.com"; // Use the provided email
    const password = "Admin&123"; // Use the provided password

    // If you do not need to create a user, comment out or remove this line
    // await createUser(email, password, firstname);

    await loginWith(page, email, password); // Perform login with the provided credentials

    // Vérifier la redirection vers la page d'accueil
    await expect(page).toHaveURL("/", { timeout: 10000 });

    // Vérifier que le bouton "Déconnexion" est visible
    await expect(page.locator('button:has-text("Compte")')).toBeVisible();
  });

  // Test case to ensure login fails with invalid credentials
  test("TC2.2:should not login with invalid credentials", async ({ page }) => {
    const email = "invalid@example.com"; // Use an invalid email
    const password = "wrongpassword"; // Use an invalid password

    await loginWith(page, email, password); // Perform login with invalid credentials

    // Add debug logs to check the state of the page
    console.log("Checking for error message...");
    const errorMessage = "Email ou mot de passe incorrect"; // Error message for incorrect email or password
    await page.waitForSelector(`text=${errorMessage}`, { timeout: 60000 }); // Increase timeout to 60 seconds
    await expect(page.getByText(errorMessage)).toBeVisible(); // Expect the error message to be visible
  });
});
