import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test.describe("Register Manager/Producer Page", () => {
  // Before each test, log in as a gestionnaire and navigate to the register-manager-producer page
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
    console.log("Navigating to login page...");
    await page.waitForSelector("text=Se connecter", { timeout: 10000 });
    await page.getByText("Se connecter").click();
    await expect(page).toHaveURL("/login", { timeout: 10000 });

    // Log in as gestionnaire
    const email = "gestionnaire@gmail.com";
    const password = "Admin&123";
    console.log(`Logging in with email: ${email}`);

    await page.waitForSelector("label:has-text('Email')", { timeout: 10000 });
    await page.getByLabel("Email").fill(email);
    await page.waitForSelector("label:has-text('Mot de passe')", {
      timeout: 10000,
    });
    await page.getByLabel("Mot de passe").fill(password);
    await page.waitForSelector("button[type='submit']", { timeout: 10000 });
    await page.locator("button[type='submit']").click();

    // Verify redirection to home page
    await expect(page).toHaveURL("/", { timeout: 10000 });
    await page.waitForSelector('button:has-text("Compte")', { timeout: 10000 });
    console.log("Logged in successfully");

    // Navigate to register-manager-producer page via navbar
    await page.waitForSelector("text=Inscrire Gestionnaire/Producteur", {
      timeout: 10000,
    });
    await page.locator("text=Inscrire Gestionnaire/Producteur").click();
    await expect(page).toHaveURL("/register-manager-producer", {
      timeout: 10000,
    });
    console.log("Navigated to register-manager-producer page");
    await page.screenshot({
      path: "screenshots/register_manager_producer_page.png",
    });
  });

  // Test case: Successful registration of a new manager
  test("TC1: should register a new manager with valid information", async ({
    page,
  }) => {
    // Generate valid data using faker
    const civility = "Monsieur";
    const email = faker.internet.email();
    const firstname = faker.person.firstName();
    const lastname = faker.person.lastName();
    const password = generateValidPassword();
    const phonenumber = generateValidPhoneNumber();
    const street = faker.location.streetAddress();
    const number = faker.location.buildingNumber();
    const postalcode = faker.location.zipCode();
    const city = faker.location.city();
    const country = faker.location.country();

    // Fill the registration form
    await page.waitForSelector("label:has-text('Civilité')", {
      timeout: 10000,
    });
    await page.getByLabel("Civilité").click();
    await page.getByRole("option", { name: civility }).click();
    await page.getByLabel("Prénom", { exact: true }).fill(firstname);
    await page.getByLabel("Nom", { exact: true }).fill(lastname);
    await page.getByLabel("Rue", { exact: true }).fill(street);
    await page.getByLabel("Numéro", { exact: true }).fill(number);
    await page.getByLabel("Code Postal", { exact: true }).fill(postalcode);
    await page.getByLabel("Ville", { exact: true }).fill(city);
    await page.getByLabel("Pays", { exact: true }).fill(country);
    await page
      .getByLabel("Numéro de téléphone", { exact: true })
      .fill(phonenumber);
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Mot de passe", { exact: true }).fill(password);
    await page
      .getByLabel("Confirmer le mot de passe", { exact: true })
      .fill(password);
    await page.getByLabel("Rôle").click();
    await page.getByRole("option", { name: "Gestionnaire" }).click();
    await page.screenshot({ path: "screenshots/register_form_filled.png" });

    // Capture API response
    const registerResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/auths/register-manager-producer") &&
        response.request().method() === "POST",
    );

    // Submit the form
    await page.locator('button:has-text("Créer un compte")').click();

    // Verify API response
    const response = await registerResponse;
    console.log(`Register API response status: ${response.status()}`);
    expect(response.status()).toBe(200);

    // Debug URL after submission
    console.log(`Current URL after submission: ${await page.url()}`);

    // Verify success message and redirection
    await expect(page).toHaveURL("/", { timeout: 10000 });
    await page.screenshot({ path: "screenshots/register_success.png" });
  });

  // Test case: Fail to register with an existing email
  test("TC2: should not register with existing email", async ({ page }) => {
    // Use an existing email
    const civility = "Monsieur";
    const email = "gestionnaire@gmail.com"; // Known existing email
    const firstname = faker.person.firstName();
    const lastname = faker.person.lastName();
    const password = generateValidPassword();
    const phonenumber = generateValidPhoneNumber();
    const street = faker.location.streetAddress();
    const number = faker.location.buildingNumber();
    const postalcode = faker.location.zipCode();
    const city = faker.location.city();
    const country = faker.location.country();

    // Fill the registration form
    await page.waitForSelector("label:has-text('Civilité')", {
      timeout: 10000,
    });
    await page.getByLabel("Civilité").click();
    await page.getByRole("option", { name: civility }).click();
    await page.getByLabel("Prénom", { exact: true }).fill(firstname);
    await page.getByLabel("Nom", { exact: true }).fill(lastname);
    await page.getByLabel("Rue", { exact: true }).fill(street);
    await page.getByLabel("Numéro", { exact: true }).fill(number);
    await page.getByLabel("Code Postal", { exact: true }).fill(postalcode);
    await page.getByLabel("Ville", { exact: true }).fill(city);
    await page.getByLabel("Pays", { exact: true }).fill(country);
    await page
      .getByLabel("Numéro de téléphone", { exact: true })
      .fill(phonenumber);
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Mot de passe", { exact: true }).fill(password);
    await page
      .getByLabel("Confirmer le mot de passe", { exact: true })
      .fill(password);
    await page.getByLabel("Rôle").click();
    await page.getByRole("option", { name: "Gestionnaire" }).click();
    await page.screenshot({
      path: "screenshots/register_form_existing_email.png",
    });

    // Capture API response
    page.on("response", (response) => {
      if (response.url().includes("/api/auths/register-manager-producer")) {
        console.log(`Register API response: Status ${response.status()}`);
        response
          .text()
          .then((text) => console.log(`Response content: ${text}`));
      }
    });

    // Submit the form
    await page.locator('button:has-text("Créer un compte")').click();

    // Verify error message
    await expect(
      page.getByText(
        "Cet email est déjà utilisé. Veuillez en choisir un autre.",
      ),
    ).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: "screenshots/register_email_error.png" });
  });

  // Test case: Fail to register with mismatched password confirmation
  test("TC3: should not register with mismatched password confirmation", async ({
    page,
  }) => {
    // Generate valid data but with mismatched passwords
    const civility = "Monsieur";
    const email = faker.internet.email();
    const firstname = faker.person.firstName();
    const lastname = faker.person.lastName();
    const password = generateValidPassword();
    const confirmPassword = password + "mismatch";
    const phonenumber = generateValidPhoneNumber();
    const street = faker.location.streetAddress();
    const number = faker.location.buildingNumber();
    const postalcode = faker.location.zipCode();
    const city = faker.location.city();
    const country = faker.location.country();

    // Fill the registration form
    await page.waitForSelector("label:has-text('Civilité')", {
      timeout: 10000,
    });
    await page.getByLabel("Civilité").click();
    await page.getByRole("option", { name: civility }).click();
    await page.getByLabel("Prénom", { exact: true }).fill(firstname);
    await page.getByLabel("Nom", { exact: true }).fill(lastname);
    await page.getByLabel("Rue", { exact: true }).fill(street);
    await page.getByLabel("Numéro", { exact: true }).fill(number);
    await page.getByLabel("Code Postal", { exact: true }).fill(postalcode);
    await page.getByLabel("Ville", { exact: true }).fill(city);
    await page.getByLabel("Pays", { exact: true }).fill(country);
    await page
      .getByLabel("Numéro de téléphone", { exact: true })
      .fill(phonenumber);
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Mot de passe", { exact: true }).fill(password);
    await page
      .getByLabel("Confirmer le mot de passe", { exact: true })
      .fill(confirmPassword);
    await page.getByLabel("Rôle").click();
    await page.getByRole("option", { name: "Gestionnaire" }).click();
    await page.screenshot({
      path: "screenshots/register_form_mismatched_password.png",
    });

    // Submit the form
    await page.locator('button:has-text("Créer un compte")').click();

    // Verify error message
    await expect(
      page.getByText("Le mot de passe et la confirmation ne correspondent pas"),
    ).toBeVisible({ timeout: 10000 });
    await page.screenshot({
      path: "screenshots/register_password_mismatch_error.png",
    });
  });

  // Test case: Fail to register with invalid password
  test("TC4: should not register with invalid password", async ({ page }) => {
    // Generate valid data but with invalid password
    const civility = "Monsieur";
    const email = faker.internet.email();
    const firstname = faker.person.firstName();
    const lastname = faker.person.lastName();
    const password = "weak"; // Invalid password
    const phonenumber = generateValidPhoneNumber();
    const street = faker.location.streetAddress();
    const number = faker.location.buildingNumber();
    const postalcode = faker.location.zipCode();
    const city = faker.location.city();
    const country = faker.location.country();

    // Fill the registration form
    await page.waitForSelector("label:has-text('Civilité')", {
      timeout: 10000,
    });
    await page.getByLabel("Civilité").click();
    await page.getByRole("option", { name: civility }).click();
    await page.getByLabel("Prénom", { exact: true }).fill(firstname);
    await page.getByLabel("Nom", { exact: true }).fill(lastname);
    await page.getByLabel("Rue", { exact: true }).fill(street);
    await page.getByLabel("Numéro", { exact: true }).fill(number);
    await page.getByLabel("Code Postal", { exact: true }).fill(postalcode);
    await page.getByLabel("Ville", { exact: true }).fill(city);
    await page.getByLabel("Pays", { exact: true }).fill(country);
    await page
      .getByLabel("Numéro de téléphone", { exact: true })
      .fill(phonenumber);
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Mot de passe", { exact: true }).fill(password);
    await page
      .getByLabel("Confirmer le mot de passe", { exact: true })
      .fill(password);
    await page.getByLabel("Rôle").click();
    await page.getByRole("option", { name: "Gestionnaire" }).click();
    await page.screenshot({
      path: "screenshots/register_form_invalid_password.png",
    });

    // Submit the form
    await page.locator('button:has-text("Créer un compte")').click();

    // Verify error message
    await expect(
      page.getByText(
        "Le mot de passe doit contenir au moins 6 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
      ),
    ).toBeVisible({ timeout: 10000 });
    await page.screenshot({
      path: "screenshots/register_invalid_password_error.png",
    });
  });

  // Test case: Register a producer with company name
  test("TC5: should register a new producer with valid information", async ({
    page,
  }) => {
    // Generate valid data for a producer
    const civility = "Madame";
    const email = faker.internet.email();
    const firstname = faker.person.firstName();
    const lastname = faker.person.lastName();
    const password = generateValidPassword();
    const phonenumber = generateValidPhoneNumber();
    const street = faker.location.streetAddress();
    const number = faker.location.buildingNumber();
    const postalcode = faker.location.zipCode();
    const city = faker.location.city();
    const country = faker.location.country();
    const nomEntreprise = faker.company.name();

    // Fill the registration form
    await page.waitForSelector("label:has-text('Civilité')", {
      timeout: 10000,
    });
    await page.getByLabel("Civilité").click();
    await page.getByRole("option", { name: civility }).click();
    await page.getByLabel("Prénom", { exact: true }).fill(firstname);
    await page.getByLabel("Nom", { exact: true }).fill(lastname);
    await page.getByLabel("Rue", { exact: true }).fill(street);
    await page.getByLabel("Numéro", { exact: true }).fill(number);
    await page.getByLabel("Code Postal", { exact: true }).fill(postalcode);
    await page.getByLabel("Ville", { exact: true }).fill(city);
    await page.getByLabel("Pays", { exact: true }).fill(country);
    await page
      .getByLabel("Numéro de téléphone", { exact: true })
      .fill(phonenumber);
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Mot de passe", { exact: true }).fill(password);
    await page
      .getByLabel("Confirmer le mot de passe", { exact: true })
      .fill(password);
    await page.getByLabel("Rôle").click();
    await page.getByRole("option", { name: "Producteur" }).click();
    await page.waitForSelector("label:has-text('Nom de l\\'entreprise')", {
      timeout: 10000,
    });
    await page
      .getByLabel("Nom de l'entreprise", { exact: true })
      .fill(nomEntreprise);
    await page.screenshot({
      path: "screenshots/register_producer_form_filled.png",
    });

    // Capture API response
    const registerResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/auths/register-manager-producer") &&
        response.request().method() === "POST",
    );

    // Submit the form
    await page.locator('button:has-text("Créer un compte")').click();

    // Verify API response
    const response = await registerResponse;
    console.log(`Register API response status: ${response.status()}`);
    expect(response.status()).toBe(200);

    // Debug URL after submission
    console.log(`Current URL after submission: ${await page.url()}`);

    // Verify success message and redirection
    await expect(page).toHaveURL("/", { timeout: 10000 });
    await page.screenshot({
      path: "screenshots/register_producer_success.png",
    });
  });
});

// Function to generate a valid password
const generateValidPassword = () => {
  const upperCase = faker.string.alpha({ length: 1, casing: "upper" });
  const lowerCase = faker.string.alpha({ length: 1, casing: "lower" });
  const digit = faker.string.numeric(1);
  const specialChar = faker.string.symbol();
  const remaining = faker.string.alphanumeric(4);
  return upperCase + lowerCase + digit + specialChar + remaining;
};

// Function to generate a valid phone number
const generateValidPhoneNumber = () => {
  return faker.phone.number({ style: "international" });
};
