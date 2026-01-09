// =============================================================================
// TESTS DES ROUTES PANIER (/api/paniers)
// =============================================================================
// Ces tests vérifient que les routes panier sont bien protégées.

const request = require("supertest");
const { app } = require("./setup");

// =============================================================================
// SUITE DE TESTS : ROUTES PROTÉGÉES PAR AUTHENTIFICATION
// =============================================================================
describe("GET /api/paniers/me (protégé)", () => {
  // -------------------------------------------------------------------------
  // TEST 1 : Accès au panier sans authentification
  // -------------------------------------------------------------------------
  it("devrait refuser l'accès sans token", async () => {
    const response = await request(app).get("/api/paniers/me");

    // Vérifie que le serveur refuse sans authentification
    expect(response.status).toBe(401);
  });
});

describe("POST /api/paniers/me (protégé)", () => {
  // -------------------------------------------------------------------------
  // TEST 2 : Sauvegarde du panier sans authentification
  // -------------------------------------------------------------------------
  it("devrait refuser la sauvegarde sans authentification", async () => {
    const response = await request(app).post("/api/paniers/me").send({
      articles: [],
    });

    // Vérifie que le serveur refuse sans token
    expect(response.status).toBe(401);
  });
});

// =============================================================================
// SUITE DE TESTS : ROUTES ADMIN PROTÉGÉES
// =============================================================================
describe("GET /api/paniers (admin)", () => {
  // -------------------------------------------------------------------------
  // TEST 3 : Liste des paniers sans admin
  // -------------------------------------------------------------------------
  it("devrait refuser l'accès à la liste sans authentification", async () => {
    const response = await request(app).get("/api/paniers");

    // Vérifie que le serveur refuse sans token admin
    expect(response.status).toBe(401);
  });
});

describe("POST /api/paniers (admin)", () => {
  // -------------------------------------------------------------------------
  // TEST 4 : Création de panier sans admin
  // -------------------------------------------------------------------------
  it("devrait refuser la création sans authentification admin", async () => {
    const response = await request(app).post("/api/paniers").send({
      utilisateur: "000000000000000000000000",
      articles: [],
    });

    // Vérifie que le serveur refuse sans token admin
    expect(response.status).toBe(401);
  });
});

describe("DELETE /api/paniers/:id (admin)", () => {
  // -------------------------------------------------------------------------
  // TEST 5 : Suppression sans admin
  // -------------------------------------------------------------------------
  it("devrait refuser la suppression sans authentification admin", async () => {
    const fakeId = "000000000000000000000000";
    const response = await request(app).delete(`/api/paniers/${fakeId}`);

    // Vérifie que le serveur refuse sans token admin
    expect(response.status).toBe(401);
  });
});
