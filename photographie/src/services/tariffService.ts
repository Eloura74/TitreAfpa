import axios from "axios";
import { API_URL } from "../config/api";
import { TariffConfig } from "../types/tarifConfig";

export const tariffService = {
  getTariffConfig: async (): Promise<TariffConfig> => {
    try {
      const res = await axios.get(`${API_URL}/api/tarifs/config`, {
        withCredentials: true,
      });
      // Vérification de sécurité : s'assurer que la réponse a la bonne structure
      if (res.data && typeof res.data === "object") {
        return {
          categories: Array.isArray(res.data.categories)
            ? res.data.categories
            : [],
        };
      }
      return { categories: [] };
    } catch (error) {
      console.error("Error fetching tariff config:", error);
      return { categories: [] };
    }
  },

  saveTariffConfig: async (config: TariffConfig): Promise<TariffConfig> => {
    const res = await axios.post(`${API_URL}/api/tarifs/config`, config, {
      withCredentials: true,
    });
    return res.data;
  },
};
