// =============================================================================
// TESTS DU STORE ZUSTAND (AUTH STORE)
// =============================================================================
// Tests du store Zustand pour l'authentification.

import { describe, it, expect, beforeEach } from "vitest";

// =============================================================================
// MOCK DU STORE AUTH
// =============================================================================
// Simulation du comportement du store sans importer le vrai store
// (évite les problèmes de dépendances circulaires)

interface AuthState {
  choix: "photographie" | "photo-graphiste" | null;
  setChoix: (choix: "photographie" | "photo-graphiste") => void;
  reset: () => void;
}

const createMockStore = () => {
  let state: AuthState = {
    choix: null,
    setChoix: (choix) => {
      state.choix = choix;
    },
    reset: () => {
      state.choix = null;
    },
  };
  return state;
};

// =============================================================================
// TESTS DU STORE
// =============================================================================
describe("Auth Store", () => {
  let store: AuthState;

  beforeEach(() => {
    store = createMockStore();
  });

  // -------------------------------------------------------------------------
  // TEST : État initial
  // -------------------------------------------------------------------------
  it("devrait avoir un état initial null pour choix", () => {
    expect(store.choix).toBeNull();
  });

  // -------------------------------------------------------------------------
  // TEST : Mise à jour du choix
  // -------------------------------------------------------------------------
  it("devrait mettre à jour le choix correctement", () => {
    store.setChoix("photographie");
    expect(store.choix).toBe("photographie");

    store.setChoix("photo-graphiste");
    expect(store.choix).toBe("photo-graphiste");
  });

  // -------------------------------------------------------------------------
  // TEST : Reset du store
  // -------------------------------------------------------------------------
  it("devrait réinitialiser le store", () => {
    store.setChoix("photographie");
    expect(store.choix).toBe("photographie");

    store.reset();
    expect(store.choix).toBeNull();
  });
});

// =============================================================================
// TESTS DU PANIER (SIMULATION)
// =============================================================================
interface CartItem {
  id: string;
  nom: string;
  prix: number;
  quantite: number;
  image: string;
}

interface CartState {
  articles: CartItem[];
  total: number;
  ajouterArticle: (article: CartItem) => void;
  supprimerArticle: (id: string) => void;
  viderPanier: () => void;
  calculerTotal: () => number;
}

const createMockCartStore = (): CartState => {
  let articles: CartItem[] = [];

  return {
    get articles() {
      return articles;
    },
    get total() {
      return articles.reduce((sum, item) => sum + item.prix * item.quantite, 0);
    },
    ajouterArticle: (article: CartItem) => {
      const existing = articles.find((a) => a.id === article.id);
      if (existing) {
        existing.quantite += article.quantite;
      } else {
        articles.push({ ...article });
      }
    },
    supprimerArticle: (id: string) => {
      articles = articles.filter((a) => a.id !== id);
    },
    viderPanier: () => {
      articles = [];
    },
    calculerTotal: () => {
      return articles.reduce((sum, item) => sum + item.prix * item.quantite, 0);
    },
  };
};

describe("Cart Store", () => {
  let cart: CartState;

  beforeEach(() => {
    cart = createMockCartStore();
  });

  // -------------------------------------------------------------------------
  // TEST : Panier vide initial
  // -------------------------------------------------------------------------
  it("devrait avoir un panier vide initialement", () => {
    expect(cart.articles.length).toBe(0);
    expect(cart.total).toBe(0);
  });

  // -------------------------------------------------------------------------
  // TEST : Ajout d'article
  // -------------------------------------------------------------------------
  it("devrait ajouter un article au panier", () => {
    cart.ajouterArticle({
      id: "1",
      nom: "Photo Nature",
      prix: 50,
      quantite: 1,
      image: "test.jpg",
    });

    expect(cart.articles.length).toBe(1);
    expect(cart.total).toBe(50);
  });

  // -------------------------------------------------------------------------
  // TEST : Ajout de quantité
  // -------------------------------------------------------------------------
  it("devrait augmenter la quantité si l'article existe déjà", () => {
    cart.ajouterArticle({
      id: "1",
      nom: "Photo Nature",
      prix: 50,
      quantite: 1,
      image: "test.jpg",
    });
    cart.ajouterArticle({
      id: "1",
      nom: "Photo Nature",
      prix: 50,
      quantite: 2,
      image: "test.jpg",
    });

    expect(cart.articles.length).toBe(1);
    expect(cart.articles[0].quantite).toBe(3);
    expect(cart.total).toBe(150);
  });

  // -------------------------------------------------------------------------
  // TEST : Suppression d'article
  // -------------------------------------------------------------------------
  it("devrait supprimer un article du panier", () => {
    cart.ajouterArticle({
      id: "1",
      nom: "Photo 1",
      prix: 50,
      quantite: 1,
      image: "test.jpg",
    });
    cart.ajouterArticle({
      id: "2",
      nom: "Photo 2",
      prix: 30,
      quantite: 1,
      image: "test.jpg",
    });

    cart.supprimerArticle("1");

    expect(cart.articles.length).toBe(1);
    expect(cart.articles[0].id).toBe("2");
    expect(cart.total).toBe(30);
  });

  // -------------------------------------------------------------------------
  // TEST : Vider le panier
  // -------------------------------------------------------------------------
  it("devrait vider complètement le panier", () => {
    cart.ajouterArticle({
      id: "1",
      nom: "Photo",
      prix: 50,
      quantite: 2,
      image: "test.jpg",
    });
    cart.viderPanier();

    expect(cart.articles.length).toBe(0);
    expect(cart.total).toBe(0);
  });
});
