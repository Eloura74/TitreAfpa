// =============================================================================
// TESTS DES ROUTES ACCÈS PRIVÉ (/api/acces-prive)
// =============================================================================
// Ces tests vérifient que les routes d'accès privé sont bien protégées.

const request = require("supertest");
const { app } = require("./setup");

// =============================================================================
// SUITE DE TESTS : ROUTES PROTÉGÉES PAR AUTHENTIFICATION
// =============================================================================
describe("GET /api/acces-prive (protégé)", () => {
  // -------------------------------------------------------------------------
  // TEST 1 : Accès à la liste sans authentification
  // -------------------------------------------------------------------------
  it("devrait refuser l'accès sans token", async () => {
    const response = await request(app).get("/api/acces-prive");

    // Vérifie que le serveur refuse sans authentification
    expect(response.status).toBe(401);
  });
});

describe("GET /api/acces-prive/:id (protégé)", () => {
  // -------------------------------------------------------------------------
  // TEST 2 : Accès à un accès privé spécifique sans token
  // -------------------------------------------------------------------------
  it("devrait refuser l'accès sans authentification", async () => {
    const fakeId = "000000000000000000000000";
    const response = await request(app).get(`/api/acces-prive/${fakeId}`);

    // Vérifie que le serveur refuse sans token
    expect(response.status).toBe(401);
  });
});

// =============================================================================
// SUITE DE TESTS : ROUTES ADMIN PROTÉGÉES
// =============================================================================
describe("POST /api/acces-prive (admin)", () => {
  // -------------------------------------------------------------------------
  // TEST 3 : Création d'accès privé sans admin
  // -------------------------------------------------------------------------
  it("devrait refuser la création sans authentification admin", async () => {
    const response = await request(app).post("/api/acces-prive").send({
      nom: "[TEST] Accès privé test",
      client: "000000000000000000000000",
    });

    // Vérifie que le serveur refuse sans token admin
    expect(response.status).toBe(401);
  });
});

describe("PUT /api/acces-prive/:id (admin)", () => {
  // -------------------------------------------------------------------------
  // TEST 4 : Modification sans admin
  // -------------------------------------------------------------------------
  it("devrait refuser la modification sans authentification admin", async () => {
    const fakeId = "000000000000000000000000";
    const response = await request(app).put(`/api/acces-prive/${fakeId}`).send({
      nom: "Modification test",
    });

    // Vérifie que le serveur refuse sans token admin
    expect(response.status).toBe(401);
  });
});

describe("DELETE /api/acces-prive/:id (admin)", () => {
  // -------------------------------------------------------------------------
  // TEST 5 : Suppression sans admin
  // -------------------------------------------------------------------------
  it("devrait refuser la suppression sans authentification admin", async () => {
    const fakeId = "000000000000000000000000";
    const response = await request(app).delete(`/api/acces-prive/${fakeId}`);

    // Vérifie que le serveur refuse sans token admin
    expect(response.status).toBe(401);
  });
});
