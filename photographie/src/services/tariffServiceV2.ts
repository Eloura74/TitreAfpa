import axios from "axios";
import { TariffConfigV2, TariffCategoryV2 } from "../types/tarifConfigV2";

import { API_URL } from "../config/api";

export const tariffServiceV2 = {
  getTariffConfig: async (): Promise<TariffConfigV2> => {
    try {
      // 1. Tenter de charger depuis la config sauvegardée en BDD
      const res = await axios.get(`${API_URL}/api/tarifs/config`, {
        withCredentials: true,
      });

      if (res.data && res.data.categories && res.data.categories.length > 0) {
        return res.data;
      }

      // 2. Si vide, fallback sur le seed Picto (lecture seule)
      console.log("Config DB vide, chargement du seed Picto...");
      const seedRes = await axios.get(`${API_URL}/api/picto/categories`, {
        withCredentials: true,
      });

      // Mapper les données du seed
      const categories: TariffCategoryV2[] = seedRes.data.map((cat: any) => ({
        id: cat._id,
        name: cat.name,
        products: cat.products.map((prod: any) => ({
          id: prod._id,
          name: prod.name,
          description: prod.description,
          supports: prod.supports.map((sup: any) => ({
            id: sup._id,
            name: sup.name,
            description: sup.description,
            technicalSpecs: sup.technicalSpecs,
            formats: sup.formats.map((fmt: any) => ({
              id: fmt._id,
              name: fmt.name,
              width: fmt.width,
              height: fmt.height,
              price: fmt.price,
            })),
          })),
        })),
      }));

      return { categories };
    } catch (error) {
      console.error("Error fetching V2 tariff config:", error);
      return { categories: [] };
    }
  },

  saveTariffConfig: async (config: TariffConfigV2): Promise<TariffConfigV2> => {
    try {
      const res = await axios.post(`${API_URL}/api/tarifs/config`, config, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.error("Error saving V2 tariff config:", error);
      throw error;
    }
  },

  clearConfig: () => {
    console.warn("Clear not implemented for V2 API");
  },
};
