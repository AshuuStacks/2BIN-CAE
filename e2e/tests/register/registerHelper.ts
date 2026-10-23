import { Page, expect } from "@playwright/test";

// Function to navigate from the home page to the register page
const goFromHomePageToRegisterPage = async (page: Page) => {
  await page.goto("/"); // Go to the home page
  await page.getByText("s'inscrire").click(); // Click on the "s'inscrire" (register) link
  await expect(page).toHaveURL("/register"); // Verify that the URL is the register page
  await page.screenshot({ path: "screenshots/register_page.png" }); // Take a screenshot of the register page
};

// Function to register a user with the provided information
const registerWith = async (
  page: Page,
  civility: string,
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  confirmPassword: string,
  street: string,
  number: string,
  postalcode: string,
  mailbox: string,
  country: string,
  city: string,
  phonenumber: string,
) => {
  await page.waitForSelector("label:has-text('Civilité')"); // Wait for the civility label to be visible
  await page.getByLabel("Civilité").click(); // Click on the civility dropdown
  await page.getByRole("option", { name: civility }).click(); // Select the provided civility option

  await page.waitForSelector("label:has-text('Email')"); // Wait for the email label to be visible
  await page.getByLabel("Email").fill(email); // Fill in the email field

  await page.waitForSelector("label:has-text('Prénom')"); // Wait for the first name label to be visible
  await page.getByLabel("Prénom").fill(firstname); // Fill in the first name field

  await page.waitForSelector("label:has-text('Nom')"); // Wait for the last name label to be visible
  await page.getByLabel("Nom", { exact: true }).fill(lastname); // Fill in the last name field

  await page.waitForSelector("label:has-text('Mot de passe')"); // Wait for the password label to be visible
  await page.getByLabel("Mot de passe", { exact: true }).fill(password); // Fill in the password field

  await page.waitForSelector("label:has-text('Confirmer le mot de passe')"); // Wait for the confirm password label to be visible
  await page.getByLabel("Confirmer le mot de passe").fill(confirmPassword); // Fill in the confirm password field
  await page.screenshot({ path: "screenshots/confirm_password_filled.png" }); // Take a screenshot after filling confirm password

  await page.waitForSelector("label:has-text('Rue')"); // Wait for the street label to be visible
  await page.getByLabel("Rue").fill(street); // Fill in the street field

  await page.waitForSelector("label:has-text('Numéro')"); // Wait for the number label to be visible
  await page.getByLabel("Numéro", { exact: true }).fill(number); // Fill in the number field

  await page.waitForSelector("label:has-text('Code Postal')"); // Wait for the postal code label to be visible
  await page.getByLabel("Code Postal").fill(postalcode); // Fill in the postal code field

  await page.waitForSelector("label:has-text('Boîte aux lettres (optionnel)')"); // Wait for the mailbox label to be visible
  await page.getByLabel("Boîte aux lettres (optionnel)").fill(mailbox); // Fill in the mailbox field

  await page.waitForSelector("label:has-text('Pays')"); // Wait for the country label to be visible
  await page.getByLabel("Pays").fill(country); // Fill in the country field

  await page.waitForSelector("label:has-text('Ville')"); // Wait for the city label to be visible
  await page.getByLabel("Ville").fill(city); // Fill in the city field

  await page.waitForSelector("label:has-text('Numéro de téléphone')"); // Wait for the phone number label to be visible
  await page.getByLabel("Numéro de téléphone").fill(phonenumber); // Fill in the phone number field
  await page.screenshot({ path: "screenshots/phonenumber_filled.png" }); // Take a screenshot after filling phone number

  await page.waitForSelector("button[type='submit']"); // Wait for the submit button to be visible
  await page.getByRole("button", { name: "Créer un compte" }).click(); // Click on the submit button to create the account
};

export { registerWith, goFromHomePageToRegisterPage };
