import { test, expect, Page } from "@playwright/test";
import { loginWith, goFromHomePageToLoginPage } from "../login/loginHelper";

test.describe("MyReservationsPage E2E Tests", () => {
  // Fonction utilitaire pour naviguer vers la page des réservations
  const goToReservationsPage = async (page: Page) => {
    await page.goto("/my-reservations");
    await expect(page).toHaveURL("/my-reservations");
  };

  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page de connexion et se connecter en tant que client
    await goFromHomePageToLoginPage(page);
    await loginWith(page, "client@gmail.com", "Admin&123");
    await expect(page).toHaveURL("/", { timeout: 10000 });

    // Vérifier que le bouton "Déconnexion" est visible
    await expect(page.locator('button:has-text("Compte")')).toBeVisible();
  });

  test("TC1: should display current and past reservations for a logged-in client", async ({
    page,
  }) => {
    await goToReservationsPage(page);

    // Vérifier le titre de la section "Mes Réservations" avec un sélecteur précis
    await expect(
      page.getByRole("heading", { name: "Mes Réservations", exact: true }),
    ).toBeVisible();

    // Vérifier l'absence de réservations en cours
    await expect(
      page.locator(
        "text=Vous n'avez aucune réservation en cours pour le moment.",
      ),
    ).toBeVisible();

    // Vérifier le titre de la section "Mes Réservations Passées"
    await expect(
      page.getByRole("heading", { name: "Mes Réservations Passées" }),
    ).toBeVisible();
  });

  test("TC3: should display an error message when there are no reservations", async ({
    page,
  }) => {
    await goToReservationsPage(page);

    // Vérifier le message d'erreur lorsque aucune réservation n'est trouvée
    await expect(
      page.locator(
        "text=Vous n'avez aucune réservation en cours pour le moment.",
      ),
    ).toBeVisible();
  });
});
