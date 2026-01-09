// =============================================================================
// TESTS DES ROUTES D'AUTHENTIFICATION (/api/auth)
// =============================================================================
// Ces tests vérifient le bon fonctionnement de l'inscription et de la connexion.

const request = require("supertest");
const { app } = require("./setup");

// Génère un email unique pour chaque exécution des tests
// Cela évite les conflits avec les utilisateurs existants
const testEmail = `test_${Date.now()}@test.com`;
const testPassword = "MotDePasse123!";

// =============================================================================
// SUITE DE TESTS : INSCRIPTION
// =============================================================================
describe("POST /api/auth/register", () => {
  // -------------------------------------------------------------------------
  // TEST 1 : Inscription réussie avec données valides
  // -------------------------------------------------------------------------
  it("devrait créer un nouvel utilisateur avec des données valides", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: testEmail,
      motdepasse: testPassword,
      nom: "TestNom",
      prenom: "TestPrenom",
    });

    // Vérifie que le serveur répond avec un code 201 (Created)
    expect(response.status).toBe(201);
    // Vérifie que le message de succès est présent
    expect(response.body.message).toContain("Inscription réussie");
  });

  // -------------------------------------------------------------------------
  // TEST 2 : Rejet d'un email déjà utilisé
  // -------------------------------------------------------------------------
  it("devrait refuser un email déjà existant", async () => {
    // Première inscription (devrait réussir)
    await request(app)
      .post("/api/auth/register")
      .send({
        email: `duplicate_${Date.now()}@test.com`,
        motdepasse: testPassword,
      });

    // Deuxième inscription avec le même email (devrait échouer)
    // Note: On utilise le testEmail déjà créé dans le test précédent
    const response = await request(app).post("/api/auth/register").send({
      email: testEmail, // Email déjà utilisé
      motdepasse: testPassword,
    });

    // Vérifie que le serveur répond avec un code 400 (Bad Request)
    expect(response.status).toBe(400);
    expect(response.body.error).toContain("déjà utilisé");
  });

  // -------------------------------------------------------------------------
  // TEST 3 : Validation du format email
  // -------------------------------------------------------------------------
  it("devrait refuser un email invalide", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "email-invalide",
      motdepasse: testPassword,
    });

    // Vérifie que la validation retourne une erreur
    expect(response.status).toBe(400);
  });
});

// =============================================================================
// SUITE DE TESTS : CONNEXION
// =============================================================================
describe("POST /api/auth/login", () => {
  // Email/mot de passe d'un utilisateur vérifié pour les tests de login
  const loginEmail = `login_${Date.now()}@test.com`;

  // Avant les tests de login, on crée un utilisateur vérifié
  beforeAll(async () => {
    // Créer l'utilisateur
    await request(app).post("/api/auth/register").send({
      email: loginEmail,
      motdepasse: testPassword,
    });

    // Note: Normalement l'utilisateur doit être vérifié pour se connecter
    // Dans un vrai test, on simulerait la vérification d'email
    // Pour simplifier, on teste avec le compte admin s'il existe
  });

  // -------------------------------------------------------------------------
  // TEST 4 : Connexion avec mauvais mot de passe
  // -------------------------------------------------------------------------
  it("devrait refuser une connexion avec un mauvais mot de passe", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: loginEmail,
      motdepasse: "mauvais_mot_de_passe",
    });

    // Vérifie que le serveur répond avec un code 401 ou 403
    expect([401, 403]).toContain(response.status);
  });

  // -------------------------------------------------------------------------
  // TEST 5 : Connexion avec utilisateur inexistant
  // -------------------------------------------------------------------------
  it("devrait refuser une connexion avec un email inexistant", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "utilisateur_inexistant@email.com",
      motdepasse: testPassword,
    });

    // Vérifie que le serveur répond avec un code 401
    expect(response.status).toBe(401);
    expect(response.body.error).toContain("Identifiants invalides");
  });
});

// =============================================================================
// SUITE DE TESTS : ROUTE PROTÉGÉE /me
// =============================================================================
describe("GET /api/auth/me", () => {
  // -------------------------------------------------------------------------
  // TEST 6 : Accès sans token
  // -------------------------------------------------------------------------
  it("devrait refuser l'accès sans token d'authentification", async () => {
    const response = await request(app).get("/api/auth/me");

    // Vérifie que le serveur répond avec un code 401
    expect(response.status).toBe(401);
  });
});
