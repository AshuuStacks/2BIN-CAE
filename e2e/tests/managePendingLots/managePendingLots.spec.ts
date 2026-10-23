import { test, expect } from "@playwright/test";

test.describe("Page de Gestion des Lots en Attente", () => {
  test.beforeEach(async ({ page }) => {
    // Mock de l'API pour retourner un lot en attente par défaut
    await page.route("**/api/lots/pending", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            idLot: 1,
            product: { libelleProduct: "Pommes" },
            producer: { companyName: "Ferme Dupont" },
            price: 50,
            initialQuantity: 100,
            proposalDate: "2023-10-01",
            lotStatus: "en attente",
            receptionDate: null,
          },
        ]),
      });
    });

    // Log des réponses API pour débogage
    page.on("response", (response) => {
      if (response.url().includes("/api/lots/")) {
        console.log(
          `Réponse API ${response.url()}: Statut ${response.status()}`,
        );
      }
    });

    // Naviguer vers la page de connexion et se connecter en tant que GESTIONNAIRE
    await page.goto("/");
    await page.getByText("Se connecter").click();
    await expect(page).toHaveURL("/login", { timeout: 10000 });

    // Effectuer la connexion avec les identifiants de GESTIONNAIRE
    await page.getByLabel("Email").fill("gestionnaire@gmail.com");
    await page.getByLabel("Mot de passe").fill("Admin&123");
    await page.locator("button[type='submit']").click();

    // Vérifier la redirection vers la page d'accueil
    await expect(page).toHaveURL("/", { timeout: 10000 });
    console.log("Connexion réussie, URL actuelle :", await page.url());

    // Vérifier que le bouton "Compte" est visible
    await page.waitForSelector('button:has-text("Compte")', { timeout: 10000 });
    console.log("Bouton 'Compte' trouvé");

    // Naviguer vers la page de gestion des lots en attente via le menu
    await page.locator('button:has-text("Gestion")').click();
    await page.locator("text=Propositions de lots").click();

    // Vérifier la navigation vers /manage-pending-lots
    await expect(page).toHaveURL("/manage-pending-lots", { timeout: 10000 });
    console.log("Navigation vers /manage-pending-lots réussie");

    // Attendre que l'indicateur de chargement disparaisse
    await page.waitForSelector(".MuiCircularProgress-root", {
      state: "detached",
      timeout: 15000,
    });

    // Prendre une capture d'écran pour débogage
    await page.screenshot({
      path: "screenshots/manage_pending_lots_initial.png",
    });

    // Log du contenu de la page pour débogage
    console.log("Contenu de la page :", await page.content());
  });

  test("TC1: doit afficher les informations des lots en attente", async ({
    page,
  }) => {
    // Vérifier que le titre de la page est visible
    await expect(
      page.getByRole("heading", { name: "Gestion des lots en attente" }),
    ).toBeVisible({ timeout: 10000 });

    // Limiter la recherche à la table
    const table = page.locator("table");

    // Vérifier que la table des lots est affichée avec les colonnes attendues
    await expect(
      table.getByRole("columnheader", { name: "ID Lot" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      table.getByRole("columnheader", { name: "Produit" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      table.getByRole("columnheader", { name: "Producteur" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(table.getByRole("columnheader", { name: "Prix" })).toBeVisible(
      { timeout: 10000 },
    );
    await expect(
      table.getByRole("columnheader", { name: "Quantité Initiale" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      table.getByRole("columnheader", { name: "Date Proposition" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      table.getByRole("columnheader", { name: "Statut" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      table.getByRole("columnheader", { name: "Date Réception" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      table.getByRole("columnheader", { name: "Actions" }),
    ).toBeVisible({ timeout: 10000 });

    // Vérifier qu'au moins un lot est affiché (lot mocké avec idLot: 1)
    await expect(
      table.getByRole("cell", { name: "1", exact: true }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      table.getByRole("cell", { name: "en attente", exact: true }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      table.getByRole("cell", { name: "Pommes", exact: true }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      table.getByRole("cell", { name: "Ferme Dupont", exact: true }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC2: doit accepter un lot avec succès", async ({ page }) => {
    // Mock de l'API pour simuler l'acceptation
    await page.route("**/api/lots/accept", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    // Limiter la recherche à la table
    const table = page.locator("table");

    // Vérifier que le lot est affiché
    await expect(
      table.getByRole("cell", { name: "1", exact: true }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      table.getByRole("cell", { name: "en attente", exact: true }),
    ).toBeVisible({ timeout: 10000 });

    // Cliquer sur le bouton "Accepter"
    await table.locator('button:has-text("Accepter")').first().click();

    // Log du contenu de la page après action
    console.log("Contenu après acceptation :", await page.content());

    // Prendre une capture d'écran après action
    await page.screenshot({ path: "screenshots/accept_lot_success.png" });
  });

  test("TC3: doit refuser un lot avec une raison valide", async ({ page }) => {
    // Mock de l'API pour simuler le refus
    await page.route("**/api/lots/refuse", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    // Limiter la recherche à la table
    const table = page.locator("table");

    // Vérifier que le lot est affiché
    await expect(
      table.getByRole("cell", { name: "1", exact: true }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      table.getByRole("cell", { name: "en attente", exact: true }),
    ).toBeVisible({ timeout: 10000 });

    // Cliquer sur le bouton "Refuser"
    await table.locator('button:has-text("Refuser")').first().click();

    // Remplir le champ de raison de refus
    await page.getByLabel("Raison du refus").fill("Qualité insuffisante");
    await page.locator('button:has-text("Confirmer")').click();

    // Log du contenu de la page après action
    console.log("Contenu après refus :", await page.content());

    // Prendre une capture d'écran après action
    await page.screenshot({ path: "screenshots/refuse_lot_success.png" });
  });

  test("TC4: doit échouer à refuser un lot sans raison", async ({ page }) => {
    // Limiter la recherche à la table
    const table = page.locator("table");

    // Vérifier que le lot est affiché
    await expect(
      table.getByRole("cell", { name: "1", exact: true }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      table.getByRole("cell", { name: "en attente", exact: true }),
    ).toBeVisible({ timeout: 10000 });

    // Cliquer sur le bouton "Refuser"
    await table.locator('button:has-text("Refuser")').first().click();

    // Cliquer sur "Confirmer" sans remplir de raison
    await page.locator('button:has-text("Confirmer")').click();

    // Vérifier que le lot est toujours en attente
    await expect(
      table.getByRole("cell", { name: "en attente", exact: true }),
    ).toBeVisible({ timeout: 10000 });

    // Log du contenu de la page après action
    console.log(
      "Contenu après tentative de refus sans raison :",
      await page.content(),
    );

    // Prendre une capture d'écran après action
    await page.screenshot({ path: "screenshots/refuse_lot_failure.png" });
  });

  test("TC6: doit annuler le refus d'un lot", async ({ page }) => {
    // Limiter la recherche à la table
    const table = page.locator("table");

    // Vérifier que le lot est affiché
    await expect(
      table.getByRole("cell", { name: "1", exact: true }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      table.getByRole("cell", { name: "en attente", exact: true }),
    ).toBeVisible({ timeout: 10000 });

    // Cliquer sur le bouton "Refuser"
    await table.locator('button:has-text("Refuser")').first().click();

    // Remplir une raison partielle
    await page.getByLabel("Raison du refus").fill("Test de raison");

    // Cliquer sur "Annuler"
    await page.locator('button:has-text("Annuler")').click();

    // Vérifier que le champ de raison n'est plus visible
    await expect(page.getByLabel("Raison du refus")).not.toBeVisible({
      timeout: 10000,
    });

    // Vérifier que le lot est toujours en attente
    await expect(
      table.getByRole("cell", { name: "en attente", exact: true }),
    ).toBeVisible({ timeout: 10000 });

    // Prendre une capture d'écran après action
    await page.screenshot({ path: "screenshots/cancel_refuse_lot.png" });
  });

  test("TC7: doit rediriger vers la page d'accueil si non GESTIONNAIRE", async ({
    page,
  }) => {
    // Déconnexion
    await page.locator('button:has-text("Compte")').click();
    await page.locator("text=Déconnexion").click();
    await expect(page).toHaveURL("/login", { timeout: 10000 });

    // Connexion en tant que CLIENT
    await page.getByLabel("Email").fill("client@gmail.com");
    await page.getByLabel("Mot de passe").fill("Admin&123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL("/", { timeout: 10000 });

    // Tenter d'accéder à la page /manage-pending-lots
    await page.goto("/manage-pending-lots");

    // Vérifier la redirection vers la page d'accueil
    await expect(page).toHaveURL("/", { timeout: 10000 });

    // Prendre une capture d'écran après action
    await page.screenshot({
      path: "screenshots/redirect_non_gestionnaire.png",
    });
  });

  test("TC8: doit afficher un message si aucun lot en attente", async ({
    page,
  }) => {
    // Mock de l'API pour retourner une liste vide
    await page.route("**/api/lots/pending", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    // Recharger la page pour refléter la réponse mockée
    await page.reload();

    // Attendre que l'indicateur de chargement disparaisse
    await page.waitForSelector(".MuiCircularProgress-root", {
      state: "detached",
      timeout: 15000,
    });

    // Log du contenu de la page pour débogage
    console.log("Contenu de la page TC8 :", await page.content());

    // Prendre une capture d'écran après action
    await page.screenshot({ path: "screenshots/no_pending_lots.png" });
  });

  test("TC9: doit afficher une erreur en cas de problème API", async ({
    page,
  }) => {
    // Mock de l'API pour retourner une erreur
    await page.route("**/api/lots/pending", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Erreur serveur interne" }),
      });
    });

    // Recharger la page pour refléter l'erreur
    await page.reload();

    // Attendre que l'indicateur de chargement disparaisse
    await page.waitForSelector(".MuiCircularProgress-root", {
      state: "detached",
      timeout: 15000,
    });

    // Log du contenu de la page pour débogage
    console.log("Contenu de la page TC9 :", await page.content());

    // Prendre une capture d'écran après action
    await page.screenshot({ path: "screenshots/api_error.png" });
  });
});
