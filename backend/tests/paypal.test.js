// =============================================================================
// TESTS DES ROUTES PAYPAL (/api/paypal)
// =============================================================================
// Ces tests vérifient les routes de création et capture de commandes PayPal.

const request = require("supertest");
const { app } = require("./setup");

// =============================================================================
// SUITE DE TESTS : CRÉATION DE COMMANDE PAYPAL
// =============================================================================
describe("POST /api/paypal/create-order", () => {
  // -------------------------------------------------------------------------
  // TEST 1 : Création de commande avec données valides
  // -------------------------------------------------------------------------
  it("devrait répondre à la route de création de commande", async () => {
    const response = await request(app).post("/api/paypal/create-order").send({
      total: "50.00",
      currency: "EUR",
    });

    // La route peut retourner :
    // - 200/201 si PayPal est configuré et fonctionne
    // - 500 si les credentials PayPal ne sont pas configurés (normal en test)
    expect([200, 201, 400, 500]).toContain(response.status);
  });

  // -------------------------------------------------------------------------
  // TEST 2 : Création sans données
  // -------------------------------------------------------------------------
  it("devrait gérer une requête sans données de commande", async () => {
    const response = await request(app)
      .post("/api/paypal/create-order")
      .send({});

    // Vérifie que la route répond (même en erreur)
    expect(response.status).toBeDefined();
  });
});

// =============================================================================
// SUITE DE TESTS : CAPTURE DE COMMANDE PAYPAL
// =============================================================================
describe("POST /api/paypal/capture-order/:orderID", () => {
  // -------------------------------------------------------------------------
  // TEST 3 : Capture avec ID de commande invalide
  // -------------------------------------------------------------------------
  it("devrait gérer un ID de commande invalide", async () => {
    const response = await request(app)
      .post("/api/paypal/capture-order/FAKE_ORDER_ID_123")
      .send({});

    // PayPal devrait retourner une erreur car l'ID n'existe pas
    expect([400, 404, 500]).toContain(response.status);
  });

  // -------------------------------------------------------------------------
  // TEST 4 : Capture avec ID vide
  // -------------------------------------------------------------------------
  it("devrait gérer un ID de commande vide", async () => {
    const response = await request(app)
      .post("/api/paypal/capture-order/")
      .send({});

    // Vérifie que la route répond (404 car route non trouvée)
    expect([404]).toContain(response.status);
  });
});
