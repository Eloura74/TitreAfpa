// Importations nécessaires depuis React et les bibliothèques tierces
import { StrictMode } from "react"; // Mode strict React pour détecter les erreurs
import { createRoot } from "react-dom/client"; // API React 18 pour monter l'application
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // React Query pour la gestion des données asynchrones
import "./index.css"; // Styles globaux CSS du projet
import "./styles/globals.css"; // Styles additionnels globaux
import App from "./App.tsx"; // Composant principal de l'application

// Création d'une instance de QueryClient qui gère le cache, les requêtes et mutations React Query
const queryClient = new QueryClient();

// Création et montage de l'application React dans l'élément HTML avec id "root"
createRoot(document.getElementById("root")!).render(
  // StrictMode active des contrôles supplémentaires en développement pour améliorer la qualité du code
  <StrictMode>
    {/* QueryClientProvider fournit le client React Query à toute l'application,
        ce qui permet d'utiliser les hooks useQuery, useMutation, etc. partout */}
    <QueryClientProvider client={queryClient}>
      {/* Composant racine de l'application */}
      <App />
    </QueryClientProvider>
  </StrictMode>
);
