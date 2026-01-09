// =============================================================================
// TESTS DES ROUTES ÉVÉNEMENTS (/api/evenements)
// =============================================================================
// Ces tests vérifient les routes publiques et la protection des routes admin.

const request = require("supertest");
const { app } = require("./setup");

// =============================================================================
// SUITE DE TESTS : LECTURE DES ÉVÉNEMENTS (PUBLIC)
// =============================================================================
describe("GET /api/evenements", () => {
  // -------------------------------------------------------------------------
  // TEST 1 : Récupération de tous les événements (route publique)
  // -------------------------------------------------------------------------
  it("devrait retourner un tableau d'événements", async () => {
    const response = await request(app).get("/api/evenements");

    // Vérifie que le serveur répond avec un code 200
    expect(response.status).toBe(200);
    // Vérifie que la réponse est un tableau
    expect(Array.isArray(response.body)).toBe(true);
  });
});

// =============================================================================
// SUITE DE TESTS : ROUTES PROTÉGÉES
// =============================================================================
describe("GET /api/evenements/me (protégé)", () => {
  // -------------------------------------------------------------------------
  // TEST 2 : Accès sans authentification
  // -------------------------------------------------------------------------
  it("devrait refuser l'accès sans token", async () => {
    const response = await request(app).get("/api/evenements/me");

    // Vérifie que le serveur refuse sans authentification
    expect(response.status).toBe(401);
  });
});

describe("POST /api/evenements (protégé admin)", () => {
  // -------------------------------------------------------------------------
  // TEST 3 : Création d'événement sans authentification
  // -------------------------------------------------------------------------
  it("devrait refuser la création sans authentification", async () => {
    const response = await request(app).post("/api/evenements").send({
      titre: "[TEST] Événement test",
      date: new Date().toISOString(),
    });

    // Vérifie que le serveur refuse sans token
    expect(response.status).toBe(401);
  });
});

describe("PUT /api/evenements/:id (protégé admin)", () => {
  // -------------------------------------------------------------------------
  // TEST 4 : Modification sans authentification
  // -------------------------------------------------------------------------
  it("devrait refuser la modification sans authentification", async () => {
    const fakeId = "000000000000000000000000";
    const response = await request(app).put(`/api/evenements/${fakeId}`).send({
      titre: "Modification test",
    });

    // Vérifie que le serveur refuse sans token
    expect(response.status).toBe(401);
  });
});

describe("DELETE /api/evenements/:id (protégé admin)", () => {
  // -------------------------------------------------------------------------
  // TEST 5 : Suppression sans authentification
  // -------------------------------------------------------------------------
  it("devrait refuser la suppression sans authentification", async () => {
    const fakeId = "000000000000000000000000";
    const response = await request(app).delete(`/api/evenements/${fakeId}`);

    // Vérifie que le serveur refuse sans token
    expect(response.status).toBe(401);
  });
});
