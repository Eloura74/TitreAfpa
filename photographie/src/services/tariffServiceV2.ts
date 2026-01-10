import axios from "axios";
import { TariffConfigV2, TariffCategoryV2 } from "../types/tarifConfigV2";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const tariffServiceV2 = {
  getTariffConfig: async (): Promise<TariffConfigV2> => {
    try {
      const res = await axios.get(`${API_URL}/api/picto/categories`, {
        withCredentials: true,
      });

      // Mapper les données de la BD (MongoDB _id) vers le format attendu par le front (id string)
      const categories: TariffCategoryV2[] = res.data.map((cat: any) => ({
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
      console.error("Error fetching V2 tariff config from API:", error);
      return { categories: [] };
    }
  },

  // Note: Pour l'instant, on ne sauvegarde pas vers l'API Picto (lecture seule depuis le seed)
  // Si on veut éditer, il faudra implémenter les routes PUT/POST côté backend
  saveTariffConfig: async (config: TariffConfigV2): Promise<TariffConfigV2> => {
    console.warn("Save not implemented for Picto V2 API yet (Read-only)");
    return config;
  },

  clearConfig: () => {
    console.warn("Clear not implemented for Picto V2 API");
  },
};
