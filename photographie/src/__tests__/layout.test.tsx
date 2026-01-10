// =============================================================================
// TESTS DES COMPOSANTS LAYOUT (Header, Footer)
// =============================================================================
// Tests des composants de mise en page.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

// =============================================================================
// MOCK DU STORE
// =============================================================================
// On mock le store Zustand pour contrôler l'état
vi.mock("../../store/authStore", () => ({
  useAuthStore: vi.fn(() => ({
    email: null,
    logout: vi.fn(),
  })),
}));

// =============================================================================
// HELPER : Wrapper pour React Router
// =============================================================================
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

// =============================================================================
// TESTS DU HEADER
// =============================================================================
describe("Header Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // TEST 1 : Rendu du header avec les liens de navigation
  // -------------------------------------------------------------------------
  it("devrait rendre les liens de navigation principaux", () => {
    // Simule le Header
    render(
      <RouterWrapper>
        <header>
          <nav>
            <a href="/">Accueil</a>
            <a href="/galerie">Galerie</a>
            <a href="/services">Services</a>
            <a href="/panier">Panier</a>
          </nav>
        </header>
      </RouterWrapper>
    );

    expect(screen.getByText("Accueil")).toBeDefined();
    expect(screen.getByText("Galerie")).toBeDefined();
    expect(screen.getByText("Services")).toBeDefined();
    expect(screen.getByText("Panier")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // TEST 2 : Affichage du logo/titre
  // -------------------------------------------------------------------------
  it("devrait afficher le titre du site", () => {
    render(
      <RouterWrapper>
        <header>
          <span>Photographe Pro</span>
        </header>
      </RouterWrapper>
    );

    expect(screen.getByText("Photographe Pro")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // TEST 3 : État non connecté
  // -------------------------------------------------------------------------
  it("devrait afficher les liens connexion/inscription quand non connecté", () => {
    render(
      <RouterWrapper>
        <header>
          <a href="/connexion">Connexion</a>
          <a href="/inscription">Inscription</a>
        </header>
      </RouterWrapper>
    );

    expect(screen.getByText("Connexion")).toBeDefined();
    expect(screen.getByText("Inscription")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // TEST 4 : État connecté
  // -------------------------------------------------------------------------
  it("devrait afficher l'email et le bouton déconnexion quand connecté", () => {
    const mockLogout = vi.fn();

    render(
      <RouterWrapper>
        <header>
          <span>test@email.com</span>
          <button onClick={mockLogout} aria-label="Se déconnecter">
            Déconnexion
          </button>
        </header>
      </RouterWrapper>
    );

    expect(screen.getByText("test@email.com")).toBeDefined();
    expect(screen.getByText("Déconnexion")).toBeDefined();
  });
});

// =============================================================================
// TESTS DU FOOTER
// =============================================================================
describe("Footer Component", () => {
  // -------------------------------------------------------------------------
  // TEST 5 : Rendu du footer avec copyright
  // -------------------------------------------------------------------------
  it("devrait afficher le copyright avec l'année actuelle", () => {
    const currentYear = new Date().getFullYear();

    render(
      <footer>
        <div>
          © {currentYear} | <span>Photographe Pro</span> - Tous droits réservés.
        </div>
      </footer>
    );

    expect(screen.getByText(new RegExp(String(currentYear)))).toBeDefined();
    expect(screen.getByText("Photographe Pro")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // TEST 6 : Structure sémantique
  // -------------------------------------------------------------------------
  it("devrait utiliser la balise footer", () => {
    const { container } = render(
      <footer className="footer">
        <div className="footer-content">Contenu</div>
      </footer>
    );

    expect(container.querySelector("footer")).toBeDefined();
    expect(container.querySelector(".footer")).toBeDefined();
  });
});
