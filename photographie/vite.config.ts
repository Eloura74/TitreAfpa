import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ["**/*.jpg", "**/*.png"],
  server: {
    proxy: {
      "/api": "http://localhost:5001", // Proxy pour toutes les routes API vers le backend
    },
  },
});
