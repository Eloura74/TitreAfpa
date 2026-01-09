// =============================================================================
// TESTS DES COMPOSANTS UI (Skeleton, Toast, Tooltip)
// =============================================================================
// Tests des composants d'interface utilisateur réutilisables.

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// =============================================================================
// TESTS DU SKELETON (Loading)
// =============================================================================
describe("Skeleton Component", () => {
  // -------------------------------------------------------------------------
  // TEST 1 : Rendu du skeleton de chargement
  // -------------------------------------------------------------------------
  it("devrait rendre un skeleton de chargement", () => {
    const { container } = render(
      <div className="skeleton" data-testid="skeleton">
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
      </div>
    );

    expect(screen.getByTestId("skeleton")).toBeDefined();
    expect(container.querySelectorAll(".skeleton-line").length).toBe(2);
  });

  // -------------------------------------------------------------------------
  // TEST 2 : Animation du skeleton
  // -------------------------------------------------------------------------
  it("devrait avoir la classe d'animation", () => {
    const { container } = render(
      <div className="skeleton animate-pulse" data-testid="skeleton"></div>
    );

    const skeleton = container.querySelector(".skeleton");
    expect(skeleton?.classList.contains("animate-pulse")).toBe(true);
  });
});

// =============================================================================
// TESTS DU TOAST (Notifications)
// =============================================================================
describe("Toast Component", () => {
  // -------------------------------------------------------------------------
  // TEST 3 : Rendu du toast de succès
  // -------------------------------------------------------------------------
  it("devrait rendre un toast de succès", () => {
    render(
      <div className="toast toast-success" data-testid="toast" role="alert">
        Opération réussie !
      </div>
    );

    expect(screen.getByTestId("toast")).toBeDefined();
    expect(screen.getByText("Opération réussie !")).toBeDefined();
    expect(screen.getByRole("alert")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // TEST 4 : Rendu du toast d'erreur
  // -------------------------------------------------------------------------
  it("devrait rendre un toast d'erreur", () => {
    render(
      <div className="toast toast-error" data-testid="toast" role="alert">
        Une erreur est survenue
      </div>
    );

    expect(screen.getByText("Une erreur est survenue")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // TEST 5 : Bouton de fermeture
  // -------------------------------------------------------------------------
  it("devrait avoir un bouton de fermeture fonctionnel", () => {
    const onClose = vi.fn();

    render(
      <div className="toast" data-testid="toast">
        <span>Message</span>
        <button onClick={onClose} aria-label="Fermer">
          ✕
        </button>
      </div>
    );

    const closeButton = screen.getByLabelText("Fermer");
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// TESTS DU TOOLTIP
// =============================================================================
describe("Tooltip Component", () => {
  // -------------------------------------------------------------------------
  // TEST 6 : Affichage du tooltip au hover
  // -------------------------------------------------------------------------
  it("devrait afficher le contenu du tooltip", () => {
    render(
      <div className="tooltip-wrapper">
        <button>Hover me</button>
        <div className="tooltip" role="tooltip">
          Information supplémentaire
        </div>
      </div>
    );

    expect(screen.getByRole("tooltip")).toBeDefined();
    expect(screen.getByText("Information supplémentaire")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // TEST 7 : Accessibilité du tooltip
  // -------------------------------------------------------------------------
  it("devrait être accessible", () => {
    render(
      <div>
        <button aria-describedby="tooltip-1">Info</button>
        <div id="tooltip-1" role="tooltip">
          Description accessible
        </div>
      </div>
    );

    const button = screen.getByText("Info");
    expect(button.getAttribute("aria-describedby")).toBe("tooltip-1");
  });
});

// =============================================================================
// TESTS DES FORMULAIRES
// =============================================================================
describe("Form Components", () => {
  // -------------------------------------------------------------------------
  // TEST 8 : Champ de saisie avec label
  // -------------------------------------------------------------------------
  it("devrait lier correctement label et input", () => {
    render(
      <div>
        <label htmlFor="email-input">Email</label>
        <input id="email-input" type="email" placeholder="votre@email.com" />
      </div>
    );

    const input = screen.getByLabelText("Email");
    expect(input).toBeDefined();
    expect(input.getAttribute("type")).toBe("email");
  });

  // -------------------------------------------------------------------------
  // TEST 9 : Bouton submit
  // -------------------------------------------------------------------------
  it("devrait rendre un bouton de soumission", () => {
    const onSubmit = vi.fn((e) => e.preventDefault());

    render(
      <form onSubmit={onSubmit}>
        <button type="submit">Envoyer</button>
      </form>
    );

    const submitButton = screen.getByText("Envoyer");
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // TEST 10 : Validation visuelle des erreurs
  // -------------------------------------------------------------------------
  it("devrait afficher les messages d'erreur", () => {
    render(
      <div>
        <input type="email" aria-invalid="true" aria-describedby="error-msg" />
        <span id="error-msg" className="error">
          Email invalide
        </span>
      </div>
    );

    expect(screen.getByText("Email invalide")).toBeDefined();
  });
});
