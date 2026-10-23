import { Page, expect } from "@playwright/test";

// Function to navigate from the home page to the login page
const goFromHomePageToLoginPage = async (page: Page) => {
  await page.goto("/"); // Go to the home page
  await page.getByText("SE CONNECTER").click(); // Click on the "SE CONNECTER" (login) link
  await expect(page).toHaveURL("/login"); // Verify that the URL is the login page
};

// Function to perform login with the provided email and password
const loginWith = async (page: Page, email: string, password: string) => {
  await page.waitForSelector("label:has-text('Email')"); // Wait for the email label to be visible
  await page.getByLabel("Email").fill(email); // Fill in the email field

  await page.waitForSelector("label:has-text('Mot de passe')"); // Wait for the password label to be visible
  await page.getByLabel("Mot de passe").fill(password); // Fill in the password field

  await page.waitForSelector("button[type='submit']"); // Wait for the submit button to be visible
  await page.locator("button[type='submit']").click(); // Click on the submit button to login
};

export { loginWith, goFromHomePageToLoginPage };
