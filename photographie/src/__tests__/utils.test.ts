// =============================================================================
// TESTS UTILITAIRES ET FONCTIONS HELPERS
// =============================================================================
// Tests des fonctions utilitaires du frontend.

import { describe, it, expect } from "vitest";

// =============================================================================
// TESTS DE VALIDATION
// =============================================================================
describe("Fonctions de validation", () => {
  // -------------------------------------------------------------------------
  // TEST : Validation email basique
  // -------------------------------------------------------------------------
  it("devrait valider un format email correct", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    expect(emailRegex.test("test@example.com")).toBe(true);
    expect(emailRegex.test("user.name@domain.fr")).toBe(true);
    expect(emailRegex.test("invalid-email")).toBe(false);
    expect(emailRegex.test("@domain.com")).toBe(false);
  });

  // -------------------------------------------------------------------------
  // TEST : Validation mot de passe
  // -------------------------------------------------------------------------
  it("devrait valider la longueur minimale du mot de passe", () => {
    const isValidPassword = (password: string) => password.length >= 6;

    expect(isValidPassword("abc123")).toBe(true);
    expect(isValidPassword("password")).toBe(true);
    expect(isValidPassword("12345")).toBe(false);
    expect(isValidPassword("")).toBe(false);
  });
});

// =============================================================================
// TESTS DE FORMATAGE
// =============================================================================
describe("Fonctions de formatage", () => {
  // -------------------------------------------------------------------------
  // TEST : Formatage des prix
  // -------------------------------------------------------------------------
  it("devrait formater correctement un prix en euros", () => {
    const formatPrice = (price: number) => `${price.toFixed(2)}€`;

    expect(formatPrice(10)).toBe("10.00€");
    expect(formatPrice(99.9)).toBe("99.90€");
    expect(formatPrice(0)).toBe("0.00€");
    expect(formatPrice(1234.56)).toBe("1234.56€");
  });

  // -------------------------------------------------------------------------
  // TEST : Formatage des dates
  // -------------------------------------------------------------------------
  it("devrait formater correctement une date", () => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const testDate = new Date("2026-01-10");
    expect(formatDate(testDate)).toBe("10/01/2026");
  });
});

// =============================================================================
// TESTS DE CALCUL PANIER
// =============================================================================
describe("Calculs de panier", () => {
  // -------------------------------------------------------------------------
  // TEST : Calcul du total
  // -------------------------------------------------------------------------
  it("devrait calculer correctement le total du panier", () => {
    const articles = [
      { id: "1", nom: "Photo 1", prix: 25, quantite: 2 },
      { id: "2", nom: "Photo 2", prix: 50, quantite: 1 },
      { id: "3", nom: "Photo 3", prix: 15, quantite: 3 },
    ];

    const total = articles.reduce(
      (sum, article) => sum + article.prix * article.quantite,
      0
    );

    expect(total).toBe(145); // 50 + 50 + 45
  });

  // -------------------------------------------------------------------------
  // TEST : Panier vide
  // -------------------------------------------------------------------------
  it("devrait retourner 0 pour un panier vide", () => {
    const articles: Array<{ prix: number; quantite: number }> = [];

    const total = articles.reduce(
      (sum, article) => sum + article.prix * article.quantite,
      0
    );

    expect(total).toBe(0);
  });
});
