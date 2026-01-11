// ==============================
//   Importations des modules et ressources
// ==============================

// React : Importation des fonctions nécessaires pour créer un contexte et gérer l'état
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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

  // State pour suivre si le panier a été restauré depuis la BDD
  const [isRestored, setIsRestored] = useState(false);

  // ==============================
  //   Synchronisation avec la BDD (Utilisateurs connectés)
  // ==============================

  // 1. Au chargement ou changement d'utilisateur : on récupère le panier en BDD
  useEffect(() => {
    if (email) {
      setIsRestored(false); // On bloque la sauvegarde tant que la restauration n'est pas finie

      axios
        .get(`${API_URL}/api/paniers/me`, {
          withCredentials: true,
        })
        .then((res) => {
          const dbArticles = res.data.articles || [];

          setArticles((prevArticles) => {
            // Logique de fusion : on prend les articles de la BDD et on fusionne avec le local
            // Si un article existe en local ET en BDD, on additionne les quantités ?
            // Ou on priorise la BDD ? Ici on va fusionner intelligemment.

            const merged = [...prevArticles];
            const dbFormatted = dbArticles
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((item: any) => item && item.photo)
              .map((item: any) => ({
                id: item.photo?._id || item.photo,
                nom: item.photo?.nom || item.photo?.titre || "Photo",
                prix: item.photo?.prix || 0,
                image: item.photo?.image || item.photo?.src || "",
                format: item.format || "Standard",
                quantite: item.quantite || 1,
                photoId: item.photo?._id || item.photo,
                support: item.support || "Papier", // Ajout du support
              }));

            dbFormatted.forEach((dbItem: ArticlePanierType) => {
              const existingIndex = merged.findIndex(
                (a) =>
                  a.id === dbItem.id &&
                  a.format === dbItem.format &&
                  a.support === dbItem.support
              );

              if (existingIndex >= 0) {
                // Si l'article existe déjà, on prend la version BDD ou on additionne ?
                // Pour éviter les doublons fantômes, on peut dire que la BDD gagne
                // ou on additionne si on veut être gentil.
                // Ici : on remplace par la version BDD (source de vérité) + local si on veut
                // Mais pour simplifier et éviter des quantités énormes : BDD + Local
                // Attention : si le local était vide, c'est juste BDD.
                // Si le local avait des items "guest", ils sont ajoutés.
                // Si le local avait le MÊME item que BDD (cas rare si on vient de se loguer),
                // on peut additionner.
                merged[existingIndex].quantite = Math.max(
                  merged[existingIndex].quantite,
                  dbItem.quantite
                );
              } else {
                merged.push(dbItem);
              }
            });

            return merged;
          });

          setIsRestored(true); // Restauration terminée, on autorise les sauvegardes
        })
        .catch((err) => {
          console.error("Erreur chargement panier BDD:", err);
          setIsRestored(true); // En cas d'erreur, on débloque quand même pour ne pas figer le panier
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            useAuthStore.getState().logout();
          }
        });
    } else {
      setIsRestored(true); // Si pas connecté, on est "restauré" (mode local)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // 2. Fonction pour sauvegarder en BDD
  const saveToDb = (currentArticles: ArticlePanierType[]) => {
    if (!email) return;

    const payload = currentArticles.map((a) => {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(a.id);
      return {
        photo: isValidObjectId ? a.id : null,
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
        { withCredentials: true }
      )
      .catch((err) => {
        console.error("Erreur sauvegarde panier BDD:", err);
      });
  };

  // 3. À chaque changement du panier local, on sauvegarde en BDD si connecté ET restauré
  useEffect(() => {
    if (email && isRestored) {
      saveToDb(articles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles, email, isRestored]);

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
