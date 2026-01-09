// =============================================================================
// TESTS DES ROUTES TARIFS (/api/tarifs)
// =============================================================================
// Ces tests vérifient la lecture des tarifs (publique) et la config.

const request = require("supertest");
const { app } = require("./setup");

// =============================================================================
// SUITE DE TESTS : LECTURE DES TARIFS (PUBLIC)
// =============================================================================
describe("GET /api/tarifs", () => {
  // -------------------------------------------------------------------------
  // TEST 1 : Récupération des tarifs actifs
  // -------------------------------------------------------------------------
  it("devrait retourner un tableau de tarifs actifs", async () => {
    const response = await request(app).get("/api/tarifs");

    // Vérifie que le serveur répond avec un code 200
    expect(response.status).toBe(200);
    // Vérifie que la réponse est un tableau
    expect(Array.isArray(response.body)).toBe(true);
  });
});

// =============================================================================
// SUITE DE TESTS : CONFIGURATION DES TARIFS
// =============================================================================
describe("GET /api/tarifs/config", () => {
  // -------------------------------------------------------------------------
  // TEST 2 : Récupération de la configuration hiérarchique
  // -------------------------------------------------------------------------
  it("devrait retourner la configuration des tarifs", async () => {
    const response = await request(app).get("/api/tarifs/config");

    // Vérifie que le serveur répond avec un code 200
    expect(response.status).toBe(200);
    // Vérifie que l'objet contient une propriété categories
    expect(response.body).toHaveProperty("categories");
  });
});

// =============================================================================
// SUITE DE TESTS : ROUTES PROTÉGÉES (ADMIN)
// =============================================================================
describe("POST /api/tarifs (protégé admin)", () => {
  // -------------------------------------------------------------------------
  // TEST 3 : Création de tarif sans authentification
  // -------------------------------------------------------------------------
  it("devrait refuser la création sans authentification", async () => {
    const response = await request(app).post("/api/tarifs").send({
      nom: "[TEST] Tarif test",
      prix: 50,
      actif: true,
    });

    // Vérifie que le serveur refuse sans token
    expect(response.status).toBe(401);
  });
});
