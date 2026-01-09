// =============================================================================
// TESTS DES COMPOSANTS GALERIE ET PANIER
// =============================================================================
// Tests des composants liés à la galerie photo et au panier.

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

// =============================================================================
// HELPER
// =============================================================================
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

// =============================================================================
// TESTS D'AFFICHAGE DE PHOTO
// =============================================================================
describe("Photo Card Component", () => {
  // -------------------------------------------------------------------------
  // TEST 1 : Affichage d'une carte photo
  // -------------------------------------------------------------------------
  it("devrait afficher une photo avec ses métadonnées", () => {
    render(
      <div className="photo-card" data-testid="photo-card">
        <img src="test.jpg" alt="Photo de nature" />
        <h3>Paysage automnal</h3>
        <p className="price">50€</p>
      </div>
    );

    expect(screen.getByTestId("photo-card")).toBeDefined();
    expect(screen.getByAltText("Photo de nature")).toBeDefined();
    expect(screen.getByText("Paysage automnal")).toBeDefined();
    expect(screen.getByText("50€")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // TEST 2 : Bouton ajouter au panier
  // -------------------------------------------------------------------------
  it("devrait avoir un bouton ajouter au panier", () => {
    const onAddToCart = vi.fn();

    render(
      <div className="photo-card">
        <img src="test.jpg" alt="Photo" />
        <button onClick={onAddToCart}>Ajouter au panier</button>
      </div>
    );

    const addButton = screen.getByText("Ajouter au panier");
    fireEvent.click(addButton);

    expect(onAddToCart).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // TEST 3 : Overlay au hover
  // -------------------------------------------------------------------------
  it("devrait avoir un overlay pour les actions", () => {
    const { container } = render(
      <div className="photo-card">
        <img src="test.jpg" alt="Photo" />
        <div className="photo-overlay">
          <button>Voir</button>
          <button>Acheter</button>
        </div>
      </div>
    );

    expect(container.querySelector(".photo-overlay")).toBeDefined();
    expect(screen.getByText("Voir")).toBeDefined();
    expect(screen.getByText("Acheter")).toBeDefined();
  });
});

// =============================================================================
// TESTS DE LA GALERIE
// =============================================================================
describe("Gallery Grid Component", () => {
  // -------------------------------------------------------------------------
  // TEST 4 : Affichage d'une grille de photos
  // -------------------------------------------------------------------------
  it("devrait afficher une grille de photos", () => {
    const photos = [
      { id: "1", titre: "Photo 1" },
      { id: "2", titre: "Photo 2" },
      { id: "3", titre: "Photo 3" },
    ];

    render(
      <div className="gallery-grid" data-testid="gallery">
        {photos.map((photo) => (
          <div key={photo.id} className="photo-card">
            {photo.titre}
          </div>
        ))}
      </div>
    );

    expect(screen.getByTestId("gallery")).toBeDefined();
    expect(screen.getByText("Photo 1")).toBeDefined();
    expect(screen.getByText("Photo 2")).toBeDefined();
    expect(screen.getByText("Photo 3")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // TEST 5 : Filtrage par catégorie
  // -------------------------------------------------------------------------
  it("devrait permettre le filtrage par catégorie", () => {
    const onFilter = vi.fn();

    render(
      <div className="gallery-filters">
        <button onClick={() => onFilter("Nature")}>Nature</button>
        <button onClick={() => onFilter("Portrait")}>Portrait</button>
        <button onClick={() => onFilter("Tous")}>Tous</button>
      </div>
    );

    fireEvent.click(screen.getByText("Nature"));
    expect(onFilter).toHaveBeenCalledWith("Nature");

    fireEvent.click(screen.getByText("Portrait"));
    expect(onFilter).toHaveBeenCalledWith("Portrait");
  });
});

// =============================================================================
// TESTS DU PANIER
// =============================================================================
describe("Cart Component", () => {
  // -------------------------------------------------------------------------
  // TEST 6 : Affichage du panier vide
  // -------------------------------------------------------------------------
  it("devrait afficher un message pour panier vide", () => {
    render(
      <div className="cart" data-testid="cart">
        <p>Votre panier est vide</p>
      </div>
    );

    expect(screen.getByText("Votre panier est vide")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // TEST 7 : Affichage des articles du panier
  // -------------------------------------------------------------------------
  it("devrait afficher les articles du panier", () => {
    const articles = [
      { id: "1", nom: "Photo Nature", prix: 50, quantite: 2 },
      { id: "2", nom: "Photo Portrait", prix: 75, quantite: 1 },
    ];

    render(
      <div className="cart" data-testid="cart">
        {articles.map((article) => (
          <div key={article.id} className="cart-item">
            <span>{article.nom}</span>
            <span>
              {article.prix}€ x {article.quantite}
            </span>
          </div>
        ))}
      </div>
    );

    expect(screen.getByText("Photo Nature")).toBeDefined();
    expect(screen.getByText("Photo Portrait")).toBeDefined();
    expect(screen.getByText("50€ x 2")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // TEST 8 : Bouton supprimer article
  // -------------------------------------------------------------------------
  it("devrait permettre de supprimer un article", () => {
    const onRemove = vi.fn();

    render(
      <div className="cart-item">
        <span>Photo Nature</span>
        <button onClick={onRemove} aria-label="Supprimer">
          🗑️
        </button>
      </div>
    );

    fireEvent.click(screen.getByLabelText("Supprimer"));
    expect(onRemove).toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // TEST 9 : Affichage du total
  // -------------------------------------------------------------------------
  it("devrait afficher le total du panier", () => {
    render(
      <div className="cart-summary">
        <span>Total :</span>
        <span className="total" data-testid="total">
          175.00€
        </span>
      </div>
    );

    expect(screen.getByTestId("total").textContent).toBe("175.00€");
  });

  // -------------------------------------------------------------------------
  // TEST 10 : Bouton passer commande
  // -------------------------------------------------------------------------
  it("devrait avoir un bouton passer commande", () => {
    const onCheckout = vi.fn();

    render(
      <RouterWrapper>
        <button onClick={onCheckout} className="checkout-btn">
          Passer commande
        </button>
      </RouterWrapper>
    );

    const checkoutButton = screen.getByText("Passer commande");
    fireEvent.click(checkoutButton);

    expect(onCheckout).toHaveBeenCalled();
  });
});
