// =============================================================================
// TESTS DES ROUTES PAIEMENTS (/api/paiements)
// =============================================================================
// Ces tests vérifient que les routes de paiement sont bien protégées.

const request = require("supertest");
const { app } = require("./setup");

// =============================================================================
// SUITE DE TESTS : ROUTES PROTÉGÉES PAR AUTHENTIFICATION
// =============================================================================
describe("GET /api/paiements/me (protégé)", () => {
  // -------------------------------------------------------------------------
  // TEST 1 : Accès à l'historique des paiements sans authentification
  // -------------------------------------------------------------------------
  it("devrait refuser l'accès sans token", async () => {
    const response = await request(app).get("/api/paiements/me");

    // Vérifie que le serveur refuse sans authentification
    expect(response.status).toBe(401);
  });
});

// =============================================================================
// SUITE DE TESTS : ROUTES ADMIN PROTÉGÉES
// =============================================================================
describe("GET /api/paiements (admin)", () => {
  // -------------------------------------------------------------------------
  // TEST 2 : Liste des paiements sans admin
  // -------------------------------------------------------------------------
  it("devrait refuser l'accès à la liste sans authentification", async () => {
    const response = await request(app).get("/api/paiements");

    // Vérifie que le serveur refuse sans token admin
    expect(response.status).toBe(401);
  });
});

describe("POST /api/paiements (admin)", () => {
  // -------------------------------------------------------------------------
  // TEST 3 : Création de paiement sans admin
  // -------------------------------------------------------------------------
  it("devrait refuser la création sans authentification admin", async () => {
    const response = await request(app).post("/api/paiements").send({
      montant: 100,
      utilisateur: "000000000000000000000000",
      statut: "en_attente",
    });

    // Vérifie que le serveur refuse sans token admin
    expect(response.status).toBe(401);
  });
});

describe("PUT /api/paiements/:id (admin)", () => {
  // -------------------------------------------------------------------------
  // TEST 4 : Modification sans admin
  // -------------------------------------------------------------------------
  it("devrait refuser la modification sans authentification admin", async () => {
    const fakeId = "000000000000000000000000";
    const response = await request(app)
      .put(`/api/paiements/${fakeId}`)
      .send({ statut: "confirmé" });

    // Vérifie que le serveur refuse sans token admin
    expect(response.status).toBe(401);
  });
});

describe("DELETE /api/paiements/:id (admin)", () => {
  // -------------------------------------------------------------------------
  // TEST 5 : Suppression sans admin
  // -------------------------------------------------------------------------
  it("devrait refuser la suppression sans authentification admin", async () => {
    const fakeId = "000000000000000000000000";
    const response = await request(app).delete(`/api/paiements/${fakeId}`);

    // Vérifie que le serveur refuse sans token admin
    expect(response.status).toBe(401);
  });
});
