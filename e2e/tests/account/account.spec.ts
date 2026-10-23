import { test, expect } from "@playwright/test";
import { goFromHomePageToLoginPage, loginWith } from "../login/loginHelper";

test.describe("Account Page", () => {
  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page de connexion et se connecter
    await goFromHomePageToLoginPage(page);
    await loginWith(page, "client@gmail.com", "Admin&123");

    // Vérifier que la redirection vers la page d'accueil a eu lieu
    await expect(page).toHaveURL("/", { timeout: 10000 });
    console.log("URL après connexion :", await page.url());

    // Vérifier que le bouton "Compte" est visible (indique un utilisateur connecté)
    await page.waitForSelector('button:has-text("Compte")', { timeout: 10000 });
    console.log("Bouton 'Compte' trouvé");

    // Cliquer sur le bouton "Compte" pour ouvrir le menu
    await page.locator('button:has-text("Compte")').click();

    // Vérifier que l'option "Déconnexion" est visible dans le menu
    await page.waitForSelector("text=Déconnexion", { timeout: 10000 });
    await expect(page.locator("text=Déconnexion")).toBeVisible({
      timeout: 10000,
    });
    console.log("Option 'Déconnexion' visible");

    // Cliquer sur l'option "Voir mon profil" pour naviguer vers /account
    await page.locator("text=Voir mon profil").click();

    // Vérifier la navigation vers /account
    await expect(page).toHaveURL("/account", { timeout: 10000 });
    console.log("Navigation vers /account réussie");
  });

  test("TC1: should display user information", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Mon profil" }),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "Admin" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Strator" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Main Street" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "123" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Apt 4B" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "10001" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Bruxelles" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Belgique" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "0000000000" })).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "client@gmail.com" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Crée le 12/12/12" }),
    ).toBeVisible();
  });

  test("TC2: should update password successfully", async ({ page }) => {
    await page.locator('button:has-text("Modifier")').click();
    await page.getByLabel("Ancien mot de passe").fill("Admin&123");
    await page.getByLabel("Nouveau mot de passe").fill("NewPassword&123");
    await page.getByLabel("Confirmer le mot de passe").fill("NewPassword&123");
    await page.locator('button:has-text("Confirmer")').click();
    await expect(
      page.getByText("Mot de passe mis à jour avec succès !"),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel("Ancien mot de passe")).not.toBeVisible();

    // Restaurer le mot de passe initial pour les tests suivants
    await page.locator('button:has-text("Modifier")').click();
    await page.getByLabel("Ancien mot de passe").fill("NewPassword&123");
    await page.getByLabel("Nouveau mot de passe").fill("Admin&123");
    await page.getByLabel("Confirmer le mot de passe").fill("Admin&123");
    await page.locator('button:has-text("Confirmer")').click();
    await expect(
      page.getByText("Mot de passe mis à jour avec succès !"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC3: should fail to update password with incorrect old password", async ({
    page,
  }) => {
    // Capturer les réponses réseau pour déboguer
    page.on("response", (response) => {
      if (response.url().includes("/api/auths/password")) {
        console.log(
          `Réponse API /api/auths/password: Statut ${response.status()}`,
        );
        response.text().then((text) => console.log(`Contenu réponse: ${text}`));
      }
    });

    await page.locator('button:has-text("Modifier")').click();
    await page.getByLabel("Ancien mot de passe").fill("WrongPassword");
    await page.getByLabel("Nouveau mot de passe").fill("NewPassword&123");
    await page.getByLabel("Confirmer le mot de passe").fill("NewPassword&123");
    await page.locator('button:has-text("Confirmer")').click();

    // Attendre un message d'erreur et capturer le contenu de la page
    await page.waitForTimeout(2000); // Attendre 2 secondes pour le rendu
    const pageContent = await page.content();
    console.log(
      "Contenu de la page après tentative de modification :",
      pageContent,
    );

    // Vérifier le message d'erreur réel affiché
    await expect(page.getByText("Erreur 403:")).toBeVisible({ timeout: 15000 });
  });

  test("TC4: should fail to update password with mismatched confirmation", async ({
    page,
  }) => {
    await page.locator('button:has-text("Modifier")').click();
    await page.getByLabel("Ancien mot de passe").fill("Admin&123");
    await page.getByLabel("Nouveau mot de passe").fill("NewPassword&123");
    await page
      .getByLabel("Confirmer le mot de passe")
      .fill("DifferentPassword&123");
    await page.locator('button:has-text("Confirmer")').click();
    await expect(
      page.getByText("Le mot de passe et la confirmation ne correspondent pas"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC5: should fail to update password with invalid new password", async ({
    page,
  }) => {
    await page.locator('button:has-text("Modifier")').click();
    await page.getByLabel("Ancien mot de passe").fill("Admin&123");
    await page.getByLabel("Nouveau mot de passe").fill("weak");
    await page.getByLabel("Confirmer le mot de passe").fill("weak");
    await page.locator('button:has-text("Confirmer")').click();
    await expect(
      page.getByText(
        "Le mot de passe doit contenir au moins 6 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
      ),
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC6: should cancel password update", async ({ page }) => {
    await page.locator('button:has-text("Modifier")').click();
    await page.getByLabel("Ancien mot de passe").fill("Admin&123");
    await page.getByLabel("Nouveau mot de passe").fill("NewPassword&123");
    await page.getByLabel("Confirmer le mot de passe").fill("NewPassword&123");
    await page.locator('button:has-text("Annuler")').click();
    await expect(page.getByLabel("Ancien mot de passe")).not.toBeVisible();
    await expect(page.getByText("Mot de passe : ****")).toBeVisible();
  });

  test("TC7: should toggle password visibility", async ({ page }) => {
    await page.locator('button:has-text("Modifier")').click();
    await expect(page.getByLabel("Ancien mot de passe")).toHaveAttribute(
      "type",
      "password",
    );
    await expect(page.getByLabel("Nouveau mot de passe")).toHaveAttribute(
      "type",
      "password",
    );
    await expect(page.getByLabel("Confirmer le mot de passe")).toHaveAttribute(
      "type",
      "password",
    );
    await page.locator('button[aria-label="Show old password"]').click();
    await page.locator('button[aria-label="Show new password"]').click();
    await page.locator('button[aria-label="Show confirm password"]').click();
    await expect(page.getByLabel("Ancien mot de passe")).toHaveAttribute(
      "type",
      "text",
    );
    await expect(page.getByLabel("Nouveau mot de passe")).toHaveAttribute(
      "type",
      "text",
    );
    await expect(page.getByLabel("Confirmer le mot de passe")).toHaveAttribute(
      "type",
      "text",
    );
  });
});
