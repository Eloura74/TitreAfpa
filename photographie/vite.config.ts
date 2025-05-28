// Import des fonctions nécessaires depuis Vite et ses plugins
import { defineConfig } from "vite"; // Fonction pour définir la config Vite
import react from "@vitejs/plugin-react"; // Plugin officiel React pour Vite
import tailwindcss from "@tailwindcss/vite"; // Plugin Tailwind CSS pour Vite

// Export de la configuration Vite
export default defineConfig({
  // Liste des plugins utilisés par Vite
  plugins: [
    react(), // Active le support React (JSX, Fast Refresh...)
    tailwindcss(), // Intègre Tailwind CSS dans le build
  ],

  // Inclusion spécifique des types d'assets dans le build
  // Ici on autorise les images JPG et PNG à être traitées comme assets
  assetsInclude: ["**/*.jpg", "**/*.png"],

  // Configuration du serveur de développement
  server: {
    port: 5173, // Port local utilisé pour lancer le serveur Vite (par défaut 5173)

    // Configuration du proxy pour rediriger les appels API vers le backend local
    proxy: {
      // Toutes les requêtes commençant par /api seront redirigées vers le backend
      "/api": {
        target: "http://localhost:5001", // Adresse du serveur backend local

        // Permet de changer l'origine de la requête HTTP (utile pour éviter les problèmes CORS)
        changeOrigin: true,

        // Fonction de réécriture d'URL : ici on ne modifie pas le chemin (/api reste /api)
        rewrite: (path) => path.replace(/^\/api/, "/api"),

        // Désactive la vérification SSL (utile si backend utilise un certificat non valide)
        secure: false,
      },
    },
  },
});
