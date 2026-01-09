// =============================================================================
// TESTS DES ROUTES DE LA GALERIE (/api/galerie)
// =============================================================================
// Ces tests vérifient le CRUD complet des photos dans la galerie.

const request = require("supertest");
const { app } = require("./setup");

// Variable pour stocker l'ID de la photo créée pendant les tests
let createdPhotoId = null;

// =============================================================================
// SUITE DE TESTS : LECTURE DES PHOTOS
// =============================================================================
describe("GET /api/galerie", () => {
  // -------------------------------------------------------------------------
  // TEST 1 : Récupération de toutes les photos
  // -------------------------------------------------------------------------
  it("devrait retourner un tableau de photos", async () => {
    const response = await request(app).get("/api/galerie");

    // Vérifie que le serveur répond avec un code 200
    expect(response.status).toBe(200);
    // Vérifie que la réponse est un tableau
    expect(Array.isArray(response.body)).toBe(true);
  });

  // -------------------------------------------------------------------------
  // TEST 2 : Filtrage par album (paramètre optionnel)
  // -------------------------------------------------------------------------
  it("devrait accepter un paramètre albumId pour filtrer", async () => {
    // Utilise un ObjectId valide mais inexistant (24 caractères hexadécimaux)
    const fakeButValidObjectId = "000000000000000000000000";

    const response = await request(app)
      .get("/api/galerie")
      .query({ albumId: fakeButValidObjectId });

    // Même avec un album inexistant, ça doit retourner 200 avec tableau vide
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

// =============================================================================
// SUITE DE TESTS : CRÉATION DE PHOTO
// =============================================================================
describe("POST /api/galerie", () => {
  // -------------------------------------------------------------------------
  // TEST 3 : Création d'une photo avec données valides
  // -------------------------------------------------------------------------
  it("devrait créer une nouvelle photo", async () => {
    const photoData = {
      src: "https://res.cloudinary.com/test/image/upload/test.jpg",
      alt: "Photo de test",
      titre: "[TEST] Photo créée par le test automatique",
      description: "Cette photo a été créée par les tests Jest",
      categorie: "Test",
      tarifs: [],
      availableTariffIds: [],
    };

    const response = await request(app).post("/api/galerie").send(photoData);

    // Vérifie que le serveur répond avec un code 201 (Created)
    expect(response.status).toBe(201);
    // Vérifie que la photo retournée contient les bonnes données
    expect(response.body.titre).toBe(photoData.titre);
    expect(response.body._id).toBeDefined();

    // Stocke l'ID pour les tests suivants
    createdPhotoId = response.body._id;
  });

  // -------------------------------------------------------------------------
  // TEST 4 : Création avec données minimales
  // -------------------------------------------------------------------------
  it("devrait créer une photo avec uniquement les champs obligatoires", async () => {
    const response = await request(app).post("/api/galerie").send({
      titre: "[TEST] Photo minimale",
    });

    // Vérifie que la création réussit même avec peu de données
    expect(response.status).toBe(201);
    // Vérifie que les valeurs par défaut sont appliquées
    expect(response.body.categorie).toBe("Divers");
  });
});

// =============================================================================
// SUITE DE TESTS : MODIFICATION DE PHOTO
// =============================================================================
describe("PUT /api/galerie/:id", () => {
  // -------------------------------------------------------------------------
  // TEST 5 : Modification d'une photo existante
  // -------------------------------------------------------------------------
  it("devrait modifier une photo existante", async () => {
    // S'assure qu'on a une photo à modifier
    if (!createdPhotoId) {
      // Crée une photo si elle n'existe pas encore
      const createResponse = await request(app).post("/api/galerie").send({
        titre: "[TEST] Photo à modifier",
      });
      createdPhotoId = createResponse.body._id;
    }

    const updateData = {
      titre: "[TEST] Photo modifiée par le test",
      description: "Description mise à jour",
    };

    const response = await request(app)
      .put(`/api/galerie/${createdPhotoId}`)
      .send(updateData);

    // Vérifie que le serveur répond avec un code 200
    expect(response.status).toBe(200);
    // Vérifie que les données ont été mises à jour
    expect(response.body.titre).toBe(updateData.titre);
    expect(response.body.description).toBe(updateData.description);
  });
});

// =============================================================================
// SUITE DE TESTS : SUPPRESSION DE PHOTO
// =============================================================================
describe("DELETE /api/galerie/:id", () => {
  // -------------------------------------------------------------------------
  // TEST 6 : Suppression d'une photo existante
  // -------------------------------------------------------------------------
  it("devrait supprimer une photo existante", async () => {
    // S'assure qu'on a une photo à supprimer
    if (!createdPhotoId) {
      const createResponse = await request(app).post("/api/galerie").send({
        titre: "[TEST] Photo à supprimer",
      });
      createdPhotoId = createResponse.body._id;
    }

    const response = await request(app).delete(
      `/api/galerie/${createdPhotoId}`
    );

    // Vérifie que le serveur répond avec un code 200
    expect(response.status).toBe(200);
    expect(response.body.message).toContain("supprimée");
  });

  // -------------------------------------------------------------------------
  // TEST 7 : Tentative de suppression avec ID invalide
  // -------------------------------------------------------------------------
  it("devrait gérer un ID de photo invalide", async () => {
    const response = await request(app).delete("/api/galerie/invalidId123");

    // Vérifie que le serveur gère l'erreur correctement
    expect(response.status).toBe(500);
  });
});
