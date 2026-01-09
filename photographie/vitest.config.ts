// =============================================================================
// CONFIGURATION VITEST POUR LES TESTS FRONTEND
// =============================================================================

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // Environnement de test (simule un navigateur)
    environment: "jsdom",

    // Fichier de configuration exécuté avant chaque test
    setupFiles: ["./src/__tests__/setup.ts"],

    // Pattern pour trouver les fichiers de test
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],

    // Exclure node_modules
    exclude: ["node_modules", "dist"],

    // Affichage détaillé des résultats
    reporters: ["verbose"],

    // Timeout pour les tests
    testTimeout: 10000,

    // Génère un rapport de couverture
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["node_modules", "src/__tests__"],
    },
  },
});
