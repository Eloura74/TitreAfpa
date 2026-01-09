// =============================================================================
// TESTS DES COMPOSANTS REACT
// =============================================================================
// Tests des composants UI avec React Testing Library.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

// =============================================================================
// HELPER : Wrapper pour les composants qui utilisent React Router
// =============================================================================
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

// =============================================================================
// TESTS DE RENDU BASIQUE
// =============================================================================
describe("Tests de rendu basique", () => {
  // -------------------------------------------------------------------------
  // TEST : Rendu d'un bouton simple
  // -------------------------------------------------------------------------
  it("devrait rendre un bouton avec le bon texte", () => {
    render(<button>Ajouter au panier</button>);

    expect(screen.getByText("Ajouter au panier")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // TEST : Rendu d'un lien avec React Router
  // -------------------------------------------------------------------------
  it("devrait rendre un lien de navigation", () => {
    const { container } = render(
      <RouterWrapper>
        <a href="/galerie">Voir la galerie</a>
      </RouterWrapper>
    );

    expect(container.querySelector('a[href="/galerie"]')).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // TEST : Rendu conditionnel
  // -------------------------------------------------------------------------
  it("devrait gérer le rendu conditionnel", () => {
    const isLoggedIn = true;

    render(
      <div>{isLoggedIn ? <span>Bienvenue</span> : <span>Connexion</span>}</div>
    );

    expect(screen.getByText("Bienvenue")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // TEST : Rendu d'une liste
  // -------------------------------------------------------------------------
  it("devrait rendre une liste d'éléments", () => {
    const items = ["Photo 1", "Photo 2", "Photo 3"];

    render(
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );

    expect(screen.getByText("Photo 1")).toBeDefined();
    expect(screen.getByText("Photo 2")).toBeDefined();
    expect(screen.getByText("Photo 3")).toBeDefined();
  });
});

// =============================================================================
// TESTS D'ACCESSIBILITÉ
// =============================================================================
describe("Tests d'accessibilité", () => {
  // -------------------------------------------------------------------------
  // TEST : Attributs ARIA
  // -------------------------------------------------------------------------
  it("devrait avoir les attributs ARIA appropriés", () => {
    render(
      <button aria-label="Fermer la fenêtre" aria-pressed="false">
        ✕
      </button>
    );

    const button = screen.getByRole("button", { name: "Fermer la fenêtre" });
    expect(button).toBeDefined();
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  // -------------------------------------------------------------------------
  // TEST : Labels de formulaire
  // -------------------------------------------------------------------------
  it("devrait lier correctement les labels aux inputs", () => {
    render(
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" />
      </div>
    );

    const input = screen.getByLabelText("Email");
    expect(input).toBeDefined();
    expect(input.getAttribute("type")).toBe("email");
  });
});

// =============================================================================
// TESTS D'ÉTAT
// =============================================================================
describe("Tests d'état", () => {
  // -------------------------------------------------------------------------
  // TEST : État initial
  // -------------------------------------------------------------------------
  it("devrait afficher l'état initial correctement", () => {
    const cartCount = 0;

    render(
      <span data-testid="cart-count">
        {cartCount === 0 ? "Panier vide" : `${cartCount} articles`}
      </span>
    );

    expect(screen.getByTestId("cart-count").textContent).toBe("Panier vide");
  });

  // -------------------------------------------------------------------------
  // TEST : État avec données
  // -------------------------------------------------------------------------
  it("devrait afficher le compteur avec des articles", () => {
    const cartCount = 3;

    render(
      <span data-testid="cart-count">
        {cartCount === 0 ? "Panier vide" : `${cartCount} articles`}
      </span>
    );

    expect(screen.getByTestId("cart-count").textContent).toBe("3 articles");
  });
});
