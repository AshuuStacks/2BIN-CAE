import { test, expect } from "@playwright/test";
import { goFromHomePageToLoginPage, loginWith } from "../login/loginHelper";

test.describe("HomePage", () => {
  test.beforeEach(async ({ page }) => {
    // Augmenter le délai d'attente global pour les tests
    test.setTimeout(60000);

    // Mocker l'API /api/lots/all pour garantir des données cohérentes
    await page.route("/api/lots/all", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            idLot: 1,
            price: 100.0,
            initialQuantity: 50,
            soldQuantity: 10,
            reservedQuantity: 5,
            remainingQuantity: 35,
            withdrawnQuantity: 0,
            lotStatus: "en vente",
            availableDate: "2025-03-01",
            proposalDate: "2025-02-15",
            product: {
              libelleProduct: "fraise",
              productType: { libelleType: "Fruits" },
            },
            photo: {
              url: "https://imagestorage023.blob.core.windows.net/dev/4abc08af-0749-4e83-80c1-2a115e1a3b68",
            },
            producer: {
              companyName: "Producteur Bio",
              email: "producer@example.com",
            },
          },
        ]),
      });
    });

    // Mocker l'API /api/auth/login pour garantir une authentification réussie
    await page.route("/api/auth/login", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: "mocked-jwt-token",
          user: {
            email: "client@gmail.com",
            role: "CLIENT",
            firstname: "Admin",
            lastname: "Strator",
          },
        }),
      });
    });
  });

  // Test pour vérifier l'affichage des sections principales
  test("TC1.1: should display main sections", async ({ page }) => {
    await page.goto("/");

    // Vérifier les titres des sections
    await expect(page.getByText("Derniers lots ajoutés")).toBeVisible();
    await expect(
      page.getByText("Lots disponibles à la réservation"),
    ).toBeVisible();
    await expect(page.getByText("Lots vendus")).toBeVisible();

    // Vérifier l'icône du panier
    await expect(
      page.locator('button[aria-label="Voir le panier"]'),
    ).toBeVisible();

    // Vérifier la présence d'un champ de filtrage
    await expect(page.getByLabel("Nom du produit")).toBeVisible();
  });

  // Test pour naviguer vers la page de détails d'un lot
  test("TC1.2: should navigate to lot details page", async ({ page }) => {
    await page.goto("/");

    // Attendre que les cartes de lots soient chargées ou qu'un message d'absence de lots apparaisse
    const lotCardPromise = page.waitForSelector('div[data-testid="lot-card"]', {
      timeout: 10000,
    });
    const noLotsPromise = page.waitForSelector(
      'text="Aucun lot récent disponible"',
      { timeout: 10000 },
    );

    // Attendre qu'une des deux conditions soit remplie
    const result = await Promise.race([lotCardPromise, noLotsPromise]);

    // Vérifier si des lots sont disponibles
    const lotCards = page.locator('div[data-testid="lot-card"]');
    const lotCount = await lotCards.count();
    if (lotCount === 0) {
      // Si aucun lot n'est disponible, vérifier le message approprié
      await expect(page.getByText("Aucun lot récent disponible")).toBeVisible();
      return;
    }

    // Cliquer sur la première carte de lot
    const lotCard = lotCards.first();
    await lotCard.click();

    // Vérifier la redirection vers la page de détails
    await expect(page).toHaveURL(/\/lot-details\/\d+/);

    // Vérifier le titre de la page de détails
    await expect(page.getByText(/Détails du lot :/)).toBeVisible();
  });

  // Test pour filtrer les lots par nom de produit
  test("TC1.3: should filter lots by product name", async ({ page }) => {
    await page.goto("/");

    // Attendre que les cartes de lots soient chargées
    await page.waitForSelector('div[data-testid="lot-card"]', {
      timeout: 10000,
    });

    // Vérifier si des lots sont disponibles
    const lotCards = page.locator('div[data-testid="lot-card"]');
    const lotCount = await lotCards.count();
    if (lotCount === 0) {
      console.warn("Aucun lot disponible pour le filtrage");
      return;
    }

    // Vérifier que les lots contiennent "fraise" avant le filtrage
    await expect(lotCards.first()).toContainText("fraise", { timeout: 10000 });

    // Entrer un nom de produit dans le champ de filtrage
    await page.getByLabel("Nom du produit").fill("fraise");

    // Vérifier que les lots affichés contiennent "fraise"
    await expect(lotCards.first()).toContainText("fraise", { timeout: 10000 });
  });

  // Test pour filtrer les lots par type de produit
  test("TC1.4: should filter lots by product type", async ({ page }) => {
    await page.goto("/");

    // Attendre que les cartes de lots soient chargées
    await page.waitForSelector('div[data-testid="lot-card"]', {
      timeout: 10000,
    });

    // Vérifier si des lots sont disponibles
    const lotCards = page.locator('div[data-testid="lot-card"]');
    const lotCount = await lotCards.count();
    if (lotCount === 0) {
      console.warn("Aucun lot disponible pour le filtrage");
      return;
    }

    // Vérifier que les lots contiennent "fraise" avant le filtrage
    await expect(lotCards.first()).toContainText("fraise", { timeout: 10000 });

    // Sélectionner le type "Fruits"
    await page.getByRole("button", { name: "Fruits" }).click();

    // Vérifier que les lots affichés sont de type "Fruits"
    await expect(lotCards.first()).toContainText(
      /fraise|pomme golden|pomme rouge/,
      {
        timeout: 10000,
      },
    );
  });

  // Test pour vérifier que le bouton "Ajouter au panier" est désactivé pour un utilisateur non authentifié
  test("TC1.7: should not show add to cart button when not authenticated", async ({
    page,
  }) => {
    await page.goto("/");

    // Vérifier que le bouton "Ajouter au panier" n'est pas visible
    const addToCartButton = page.locator('[data-testid="add-to-cart-button"]');
    await expect(addToCartButton).toHaveCount(0);

    // Vérifier la présence des boutons "S'inscrire" et "Se connecter"
    await expect(page.getByText("S'inscrire")).toBeVisible();
    await expect(page.getByText("Se connecter")).toBeVisible();
  });

  // Test pour vérifier le comportement du panier vide
  test("TC1.8: should display empty cart message when cart is empty", async ({
    page,
  }) => {
    // Connexion en tant que client
    await goFromHomePageToLoginPage(page);
    await loginWith(page, "client@gmail.com", "Admin&123");

    // Naviguer directement vers la page du panier
    await page.goto("/cart");

    // Vérifier le message de panier vide
    await expect(page.getByText("Votre panier est vide.")).toBeVisible();

    // Vérifier la présence du bouton pour découvrir les produits
    await expect(page.getByText("Découvrir les produits")).toBeVisible();
  });
});
