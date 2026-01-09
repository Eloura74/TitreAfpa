// =============================================================================
// TESTS DES ROUTES ALBUMS (/api/albums)
// =============================================================================
// Ces tests vérifient le CRUD complet des albums.

const request = require("supertest");
const { app } = require("./setup");

// Variable pour stocker l'ID de l'album créé pendant les tests
let createdAlbumId = null;

// =============================================================================
// SUITE DE TESTS : LECTURE DES ALBUMS
// =============================================================================
describe("GET /api/albums", () => {
  // -------------------------------------------------------------------------
  // TEST 1 : Récupération de tous les albums
  // -------------------------------------------------------------------------
  it("devrait retourner un tableau d'albums", async () => {
    const response = await request(app).get("/api/albums");

    // Vérifie que le serveur répond avec un code 200
    expect(response.status).toBe(200);
    // Vérifie que la réponse est un tableau
    expect(Array.isArray(response.body)).toBe(true);
  });
});

// =============================================================================
// SUITE DE TESTS : CRÉATION D'ALBUM
// =============================================================================
describe("POST /api/albums", () => {
  // -------------------------------------------------------------------------
  // TEST 2 : Création d'un album avec données valides
  // -------------------------------------------------------------------------
  it("devrait créer un nouvel album", async () => {
    const albumData = {
      titre: "[TEST] Album créé par le test automatique",
      description: "Description de test pour l'album",
      imageCouverture: "https://res.cloudinary.com/test/image/upload/cover.jpg",
    };

    const response = await request(app).post("/api/albums").send(albumData);

    // Vérifie que le serveur répond avec un code 201 (Created)
    expect(response.status).toBe(201);
    expect(response.body.titre).toBe(albumData.titre);
    expect(response.body._id).toBeDefined();

    // Stocke l'ID pour les tests suivants
    createdAlbumId = response.body._id;
  });

  // -------------------------------------------------------------------------
  // TEST 3 : Création avec titre manquant
  // -------------------------------------------------------------------------
  it("devrait refuser une création sans titre", async () => {
    const response = await request(app).post("/api/albums").send({
      description: "Album sans titre",
    });

    // Vérifie que le serveur refuse
    expect(response.status).toBe(400);
    expect(response.body.message).toContain("titre");
  });
});

// =============================================================================
// SUITE DE TESTS : MODIFICATION D'ALBUM
// =============================================================================
describe("PUT /api/albums/:id", () => {
  // -------------------------------------------------------------------------
  // TEST 4 : Modification d'un album existant
  // -------------------------------------------------------------------------
  it("devrait modifier un album existant", async () => {
    // S'assure qu'on a un album à modifier
    if (!createdAlbumId) {
      const createResponse = await request(app).post("/api/albums").send({
        titre: "[TEST] Album à modifier",
      });
      createdAlbumId = createResponse.body._id;
    }

    const updateData = {
      titre: "[TEST] Album modifié par le test",
      description: "Description mise à jour",
    };

    const response = await request(app)
      .put(`/api/albums/${createdAlbumId}`)
      .send(updateData);

    // Vérifie que le serveur répond avec un code 200
    expect(response.status).toBe(200);
    expect(response.body.titre).toBe(updateData.titre);
  });

  // -------------------------------------------------------------------------
  // TEST 5 : Modification d'un album inexistant
  // -------------------------------------------------------------------------
  it("devrait retourner 404 pour un album inexistant", async () => {
    const fakeId = "000000000000000000000000";
    const response = await request(app).put(`/api/albums/${fakeId}`).send({
      titre: "Mise à jour",
    });

    expect(response.status).toBe(404);
  });
});

// =============================================================================
// SUITE DE TESTS : SUPPRESSION D'ALBUM
// =============================================================================
describe("DELETE /api/albums/:id", () => {
  // -------------------------------------------------------------------------
  // TEST 6 : Suppression d'un album existant
  // -------------------------------------------------------------------------
  it("devrait supprimer un album existant", async () => {
    // S'assure qu'on a un album à supprimer
    if (!createdAlbumId) {
      const createResponse = await request(app).post("/api/albums").send({
        titre: "[TEST] Album à supprimer",
      });
      createdAlbumId = createResponse.body._id;
    }

    const response = await request(app).delete(`/api/albums/${createdAlbumId}`);

    // Vérifie que le serveur répond avec un code 200
    expect(response.status).toBe(200);
    expect(response.body.message).toContain("supprimé");
  });

  // -------------------------------------------------------------------------
  // TEST 7 : Suppression d'un album inexistant
  // -------------------------------------------------------------------------
  it("devrait retourner 404 pour un album inexistant", async () => {
    const fakeId = "000000000000000000000000";
    const response = await request(app).delete(`/api/albums/${fakeId}`);

    expect(response.status).toBe(404);
  });
});
