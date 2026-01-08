import axios from "axios";
import { API_URL } from "../config/api";
import { TariffConfig } from "../types/tarifConfig";

export const tariffService = {
  getTariffConfig: async (): Promise<TariffConfig> => {
    try {
      const res = await axios.get(`${API_URL}/api/tarifs/config`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching tariff config:", error);
      return { categories: [] };
    }
  },

  saveTariffConfig: async (config: TariffConfig): Promise<TariffConfig> => {
    // Strip system fields to avoid duplicate key errors on backend
    const { _id, createdAt, updatedAt, __v, ...cleanConfig } = config as any;

    const res = await axios.post(`${API_URL}/api/tarifs/config`, cleanConfig, {
      withCredentials: true,
    });
    return res.data;
  },
};
