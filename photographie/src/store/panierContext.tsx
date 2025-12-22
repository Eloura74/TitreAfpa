// ==============================
//   Importations des modules et ressources
// ==============================

// React : Importation des fonctions nécessaires pour créer un contexte et gérer l'état
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Importation du type TypeScript pour définir la structure d'un article dans le panier
import { ArticlePanierType } from "../types/panier";

// ==============================
//   Définition de l'interface du Contexte Panier
// ==============================
// Cette interface décrit les données et fonctions disponibles dans le contexte
interface PanierContextType {
  articles: ArticlePanierType[]; // Liste des articles présents dans le panier
  total: number; // Montant total du panier
  ajouterArticle: (article: ArticlePanierType) => void; // Fonction pour ajouter un article
  retirerArticle: (id: string) => void; // Fonction pour retirer un article par son ID
  viderPanier: () => void; // Fonction pour vider complètement le panier
}

// ==============================
//   Création du Contexte Panier
// ==============================
// On initialise le contexte avec "undefined" pour forcer l'utilisation via le Provider
const PanierContext = createContext<PanierContextType | undefined>(undefined);

// ==============================
//   Hook personnalisé : usePanier
// ==============================
// Permet d'accéder facilement au contexte Panier dans les composants enfants
export const usePanier = () => {
  const context = useContext(PanierContext);
  if (!context) {
    // Sécurisation : empêche l'utilisation du hook en dehors du Provider
    throw new Error("usePanier doit être utilisé dans un PanierProvider");
  }
  return context;
};

// ==============================
//   Provider : PanierProvider
// ==============================
// Ce composant englobe toute l'application (ou une partie) pour fournir l'accès global au panier
import axios from "axios";
import { useAuthStore } from "./authStore";
import { API_URL } from "../config/api";

// ==============================
//   Provider : PanierProvider
// ==============================
// Ce composant englobe toute l'application (ou une partie) pour fournir l'accès global au panier
export const PanierProvider = ({ children }: { children: ReactNode }) => {
  const { email } = useAuthStore(); // On récupère l'état de connexion

  // State local pour stocker les articles du panier
  // Initialisation lazy : on lit le localStorage au démarrage
  const [articles, setArticles] = useState<ArticlePanierType[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("panier");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Sauvegarde automatique dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem("panier", JSON.stringify(articles));
  }, [articles]);

  // ==============================
  //   Synchronisation avec la BDD (Utilisateurs connectés)
  // ==============================
  
  // 1. Au chargement ou changement d'utilisateur : on récupère le panier en BDD
  useEffect(() => {
    if (email) {
      const token = localStorage.getItem("token");
      if (!token) return;

      axios
        .get(`${API_URL}/api/paniers/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const dbArticles = res.data.articles;
          // Si le panier BDD n'est pas vide, on l'utilise (source de vérité)
          if (dbArticles && dbArticles.length > 0) {
            // On mappe pour s'assurer du format (notamment si 'photo' est peuplé)
            const formatted = dbArticles
              .filter((item: any) => item.photo) // Filtre les items dont la photo a été supprimée
              .map((item: any) => ({
                id: item.photo._id || item.photo, // Gère le cas populé ou non
                nom: item.photo.nom || "Photo",
                prix: item.photo.prix || 0,
                image: item.photo.image || "",
                format: item.photo.format || "Standard", // À adapter selon votre modèle
                quantite: item.quantite,
              }));
            setArticles(formatted);
          } else if (articles.length > 0) {
            // Si BDD vide mais local non vide, on envoie le local vers la BDD
            saveToDb(articles);
          }
        })
        .catch((err) => console.error("Erreur chargement panier BDD:", err));
    }
  }, [email]);

  // 2. Fonction pour sauvegarder en BDD
  const saveToDb = (currentArticles: ArticlePanierType[]) => {
    const token = localStorage.getItem("token");
    if (!email || !token) return;

    // On garde les infos complètes pour l'envoi
    const payload = currentArticles.map((a) => {
      // Vérification basique d'un ObjectId MongoDB (24 char hex)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(a.id);
      
      return {
        photo: isValidObjectId ? a.id : null, // Envoie l'ID seulement s'il est valide
        quantite: a.quantite,
        format: a.format,
        support: a.support,
        prixUnitaire: a.prix,
        titre: a.nom,
        image: a.image,
      };
    });

    axios
      .post(
        `${API_URL}/api/paniers/me`,
        { articles: payload },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .catch((err) => {
        console.error("Erreur sauvegarde panier BDD:", err);
        if (axios.isAxiosError(err) && err.response) {
          console.error("Détails erreur 400:", err.response.data);
        }
      });
  };

  // 3. À chaque changement du panier local, on sauvegarde en BDD si connecté
  useEffect(() => {
    if (email) {
      // Debounce ou sauvegarde directe ? Directe pour l'instant (attention au trafic)
      saveToDb(articles);
    }
  }, [articles, email]);

  // ==============================
  //   Calcul dynamique du total du panier
  // ==============================
  const total = articles.reduce(
    (acc, article) => acc + article.prix * article.quantite,
    0
  );

  // ==============================
  //   Ajouter un article au panier
  // ==============================
  const ajouterArticle = (nouvelArticle: ArticlePanierType) => {
    setArticles((prev) => {
      // Vérifie si l'article existe déjà dans le panier
      const existant = prev.find((a) => a.id === nouvelArticle.id);

      if (existant) {
        // Si l'article existe, on incrémente simplement la quantité
        return prev.map(
          (a) =>
            a.id === nouvelArticle.id // Si l'article existe, on incrémente la quantité
              ? { ...a, quantite: a.quantite + nouvelArticle.quantite } // Incrémente la quantité
              : a // Sinon, on retourne l'article tel qu'il est
        );
      }

      // Si l'article n'existe pas, on l'ajoute au tableau
      return [...prev, nouvelArticle];
    });
  };

  // ==============================
  //   Retirer un article du panier par son ID
  // ==============================
  const retirerArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  // ==============================
  //   Vider complètement le panier
  // ==============================
  const viderPanier = () => {
    setArticles([]); // Réinitialise le tableau des articles
  };

  // ==============================
  //  Fourniture du contexte aux composants enfants
  // ==============================
  return (
    <PanierContext.Provider
      value={{ articles, total, ajouterArticle, retirerArticle, viderPanier }}
    >
      {children} {/* Tous les composants enfants auront accès au contexte */}
    </PanierContext.Provider>
  );
};
