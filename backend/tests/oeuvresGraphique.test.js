// =============================================================================
// TESTS DES ROUTES ŒUVRES GRAPHIQUES (/api/oeuvres-graphique)
// =============================================================================
// Ces tests vérifient le CRUD complet des œuvres graphiques.

const request = require("supertest");
const { app } = require("./setup");

// Variable pour stocker l'ID de l'œuvre créée pendant les tests
let createdOeuvreId = null;

// =============================================================================
// SUITE DE TESTS : LECTURE DES ŒUVRES
// =============================================================================
describe("GET /api/oeuvres-graphique", () => {
  // -------------------------------------------------------------------------
  // TEST 1 : Récupération de toutes les œuvres
  // -------------------------------------------------------------------------
  it("devrait retourner un tableau d'œuvres graphiques", async () => {
    const response = await request(app).get("/api/oeuvres-graphique");

    // Vérifie que le serveur répond avec un code 200
    expect(response.status).toBe(200);
    // Vérifie que la réponse est un tableau
    expect(Array.isArray(response.body)).toBe(true);
  });
});

// =============================================================================
// SUITE DE TESTS : CRÉATION D'ŒUVRE
// =============================================================================
describe("POST /api/oeuvres-graphique", () => {
  // -------------------------------------------------------------------------
  // TEST 2 : Création d'une œuvre avec données valides
  // -------------------------------------------------------------------------
  it("devrait créer une nouvelle œuvre graphique", async () => {
    const oeuvreData = {
      titre: "[TEST] Œuvre créée par le test automatique",
      image: "https://res.cloudinary.com/test/image/upload/test-oeuvre.jpg",
      prix: 250,
      description: "Description de test",
    };

    const response = await request(app)
      .post("/api/oeuvres-graphique")
      .send(oeuvreData);

    // Vérifie que le serveur répond avec un code 201 (Created)
    expect(response.status).toBe(201);
    expect(response.body.titre).toBe(oeuvreData.titre);
    expect(response.body._id).toBeDefined();

    // Stocke l'ID pour les tests suivants
    createdOeuvreId = response.body._id;
  });

  // -------------------------------------------------------------------------
  // TEST 3 : Création avec champs obligatoires manquants
  // -------------------------------------------------------------------------
  it("devrait refuser une création avec champs manquants", async () => {
    const response = await request(app).post("/api/oeuvres-graphique").send({
      titre: "[TEST] Œuvre incomplète",
      // image et prix manquants
    });

    // Vérifie que le serveur refuse
    expect(response.status).toBe(400);
    expect(response.body.message).toContain("requis");
  });
});

// =============================================================================
// SUITE DE TESTS : MODIFICATION D'ŒUVRE
// =============================================================================
describe("PUT /api/oeuvres-graphique/:id", () => {
  // -------------------------------------------------------------------------
  // TEST 4 : Modification d'une œuvre existante
  // -------------------------------------------------------------------------
  it("devrait modifier une œuvre existante", async () => {
    // S'assure qu'on a une œuvre à modifier
    if (!createdOeuvreId) {
      const createResponse = await request(app)
        .post("/api/oeuvres-graphique")
        .send({
          titre: "[TEST] Œuvre à modifier",
          image: "https://test.com/image.jpg",
          prix: 100,
        });
      createdOeuvreId = createResponse.body._id;
    }

    const updateData = {
      titre: "[TEST] Œuvre modifiée par le test",
      prix: 300,
    };

    const response = await request(app)
      .put(`/api/oeuvres-graphique/${createdOeuvreId}`)
      .send(updateData);

    // Vérifie que le serveur répond avec un code 200
    expect(response.status).toBe(200);
    expect(response.body.titre).toBe(updateData.titre);
    expect(response.body.prix).toBe(updateData.prix);
  });
});

// =============================================================================
// SUITE DE TESTS : SUPPRESSION D'ŒUVRE
// =============================================================================
describe("DELETE /api/oeuvres-graphique/:id", () => {
  // -------------------------------------------------------------------------
  // TEST 5 : Suppression d'une œuvre existante
  // -------------------------------------------------------------------------
  it("devrait supprimer une œuvre existante", async () => {
    // S'assure qu'on a une œuvre à supprimer
    if (!createdOeuvreId) {
      const createResponse = await request(app)
        .post("/api/oeuvres-graphique")
        .send({
          titre: "[TEST] Œuvre à supprimer",
          image: "https://test.com/image.jpg",
          prix: 100,
        });
      createdOeuvreId = createResponse.body._id;
    }

    const response = await request(app).delete(
      `/api/oeuvres-graphique/${createdOeuvreId}`
    );

    // Vérifie que le serveur répond avec un code 200
    expect(response.status).toBe(200);
    expect(response.body.message).toContain("supprimée");
  });
});
