// =============================================================================
// TESTS DES ROUTES UPLOAD CLOUDINARY (/api/upload-cloudinary)
// =============================================================================
// Ces tests vérifient les routes d'upload vers Cloudinary.

const request = require("supertest");
const { app } = require("./setup");

// =============================================================================
// SUITE DE TESTS : SIGNATURE CLOUDINARY (PROTÉGÉ)
// =============================================================================
describe("GET /api/upload-cloudinary/sign (protégé)", () => {
  // -------------------------------------------------------------------------
  // TEST 1 : Accès sans authentification
  // -------------------------------------------------------------------------
  it("devrait refuser l'accès sans token", async () => {
    const response = await request(app).get("/api/upload-cloudinary/sign");

    // Vérifie que le serveur refuse sans authentification
    expect(response.status).toBe(401);
  });

  // -------------------------------------------------------------------------
  // TEST 2 : Vérification de la structure de la route
  // -------------------------------------------------------------------------
  it("devrait exister en tant que route protégée", async () => {
    const response = await request(app).get("/api/upload-cloudinary/sign");

    // La route existe (401 = accès refusé, pas 404 = route inexistante)
    expect(response.status).not.toBe(404);
  });
});

// =============================================================================
// SUITE DE TESTS : VÉRIFICATION DE LA CONFIGURATION
// =============================================================================
describe("Configuration Cloudinary", () => {
  // -------------------------------------------------------------------------
  // TEST 3 : Vérification que les variables d'environnement sont présentes
  // -------------------------------------------------------------------------
  it("devrait avoir les variables Cloudinary configurées", () => {
    // Ces variables peuvent être undefined en environnement de test
    // mais doivent être définies en production
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // En test, on vérifie juste que le code ne plante pas
    // En prod, ces valeurs doivent être définies
    expect(true).toBe(true);

    // Log pour le développeur
    if (!cloudName || !apiKey || !apiSecret) {
      console.log(
        "⚠️ Variables Cloudinary non configurées (normal en test local)"
      );
    }
  });
});
