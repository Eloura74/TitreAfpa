// =============================================================================
// TESTS DES ROUTES SERVICES (/api/services)
// =============================================================================
// Ces tests vérifient le CRUD des services (prestations).

const request = require("supertest");
const { app } = require("./setup");

// Variable pour stocker l'ID du service créé pendant les tests
let createdServiceId = null;

// =============================================================================
// SUITE DE TESTS : LECTURE DES SERVICES
// =============================================================================
describe("GET /api/services", () => {
  // -------------------------------------------------------------------------
  // TEST 1 : Récupération de tous les services
  // -------------------------------------------------------------------------
  it("devrait retourner un tableau de services", async () => {
    const response = await request(app).get("/api/services");

    // Vérifie que le serveur répond avec un code 200
    expect(response.status).toBe(200);
    // Vérifie que la réponse est un tableau
    expect(Array.isArray(response.body)).toBe(true);
  });
});

// =============================================================================
// SUITE DE TESTS : CRÉATION DE SERVICE
// =============================================================================
describe("POST /api/services", () => {
  // -------------------------------------------------------------------------
  // TEST 2 : Création d'un service avec données valides
  // -------------------------------------------------------------------------
  it("devrait créer un nouveau service", async () => {
    const serviceData = {
      titre: "[TEST] Service créé par le test automatique",
      description: "Description du service de test",
      prix: 150,
      image: "https://res.cloudinary.com/test/image/upload/service.jpg",
    };

    const response = await request(app).post("/api/services").send(serviceData);

    // Vérifie que le serveur répond avec un code 201 (Created)
    expect(response.status).toBe(201);
    expect(response.body._id).toBeDefined();

    // Stocke l'ID pour les tests suivants
    createdServiceId = response.body._id;
  });
});

// =============================================================================
// SUITE DE TESTS : MODIFICATION DE SERVICE
// =============================================================================
describe("PUT /api/services/:id", () => {
  // -------------------------------------------------------------------------
  // TEST 3 : Modification d'un service existant
  // -------------------------------------------------------------------------
  it("devrait modifier un service existant", async () => {
    // S'assure qu'on a un service à modifier
    if (!createdServiceId) {
      const createResponse = await request(app).post("/api/services").send({
        titre: "[TEST] Service à modifier",
        description: "Description",
        prix: 100,
      });
      createdServiceId = createResponse.body._id;
    }

    const updateData = {
      titre: "[TEST] Service modifié par le test",
      prix: 200,
    };

    const response = await request(app)
      .put(`/api/services/${createdServiceId}`)
      .send(updateData);

    // Vérifie que le serveur répond avec un code 200
    expect(response.status).toBe(200);
  });
});

// =============================================================================
// SUITE DE TESTS : SUPPRESSION DE SERVICE
// =============================================================================
describe("DELETE /api/services/:id", () => {
  // -------------------------------------------------------------------------
  // TEST 4 : Suppression d'un service existant
  // -------------------------------------------------------------------------
  it("devrait supprimer un service existant", async () => {
    // S'assure qu'on a un service à supprimer
    if (!createdServiceId) {
      const createResponse = await request(app).post("/api/services").send({
        titre: "[TEST] Service à supprimer",
        description: "Description",
        prix: 100,
      });
      createdServiceId = createResponse.body._id;
    }

    const response = await request(app).delete(
      `/api/services/${createdServiceId}`
    );

    // Vérifie que le serveur répond avec un code 200 ou 204
    expect([200, 204]).toContain(response.status);
  });
});
