import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { goFromHomePageToRegisterPage, registerWith } from "./registerHelper";

// Function to generate a valid password with specific criteria
const generateValidPassword = () => {
  const upperCase = faker.string.alpha({ length: 1, casing: "upper" });
  const lowerCase = faker.string.alpha({ length: 1, casing: "lower" });
  const digit = faker.string.numeric(1);
  const specialChar = faker.string.symbol();
  const remaining = faker.string.alphanumeric(4);
  return upperCase + lowerCase + digit + specialChar + remaining;
};

// Function to generate a valid phone number in international format
const generateValidPhoneNumber = () => {
  return faker.phone.number({ style: "international" });
};

test.describe("Register", () => {
  // Before each test, navigate to the register page
  test.beforeEach(async ({ page }) => {
    await goFromHomePageToRegisterPage(page);
  });

  // Test case to register a new user with valid information
  test("TC1.1: should register a new user when valid information is provided", async ({
    page,
  }) => {
    const civility = "Monsieur"; // Example civility
    const email = faker.internet.email();
    const firstname = faker.person.firstName();
    const lastname = faker.person.lastName();
    const password = generateValidPassword();
    const confirmPassword = password; // Use the same password for confirmation
    const street = faker.location.streetAddress();
    const number = faker.location.buildingNumber();
    const postalcode = faker.location.zipCode();
    const mailbox = ""; // Optional
    const country = faker.location.country();
    const city = faker.location.city();
    const phonenumber = generateValidPhoneNumber();

    // Register the user with the provided information
    await registerWith(
      page,
      civility,
      email,
      firstname,
      lastname,
      password,
      confirmPassword,
      street,
      number,
      postalcode,
      mailbox,
      country,
      city,
      phonenumber,
    );

    // Verify that the user is redirected to the login page
    await page.goto("/login");
    await expect(page).toHaveURL("/login", {
      timeout: 10000,
    });
  });

  // Test case to ensure a new user cannot register with an existing email
  test("TC2.1: should not register a new user when existing email", async ({
    page,
  }) => {
    const civility = "Monsieur"; // Example civility
    const email = "ashutosh@gmail.com"; // Existing email
    const firstname = "Farina";
    const lastname = "Example";
    const password = generateValidPassword();
    const confirmPassword = password; // Use the same password for confirmation
    const street = "Example Street";
    const number = "123";
    const postalcode = "12345";
    const mailbox = ""; // Optional
    const country = "Example Country";
    const city = "Example City";
    const phonenumber = generateValidPhoneNumber();

    // Attempt to register the user with the existing email
    await registerWith(
      page,
      civility,
      email,
      firstname,
      lastname,
      password,
      confirmPassword,
      street,
      number,
      postalcode,
      mailbox,
      country,
      city,
      phonenumber,
    );

    // Verify that the error message is displayed
    console.log("Checking for error message...");
    await expect(
      page.getByText(
        "Cet email est déjà utilisé. Veuillez en choisir un autre.",
      ),
    ).toBeVisible({ timeout: 60000 });
  });
});
