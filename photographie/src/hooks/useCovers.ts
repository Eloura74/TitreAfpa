import { useState, useEffect } from "react";
import { API_URL } from "../config/api";

interface CoverImage {
  _id: string;
  image: string;
  titre: string;
  type: string;
}

export const useCovers = () => {
  const [covers, setCovers] = useState<{
    photographie: string | null;
    graphismeGalerie: string | null;
    graphismeDecouvrir: string | null;
    services: string | null;
    backgroundSite: string | null;
  }>({
    photographie: null,
    graphismeGalerie: null,
    graphismeDecouvrir: null,
    services: null,
    backgroundSite: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCovers = async () => {
      try {
        const types = [
          "photographie",
          "graphisme-galerie",
          "graphisme-decouvrir",
          "services",
          "background-site",
        ];

        const results = await Promise.all(
          types.map(async (type) => {
            try {
              const res = await fetch(`${API_URL}/api/covers/${type}`);
              if (res.ok) {
                const data: CoverImage = await res.json();
                return { type, image: data.image };
              }
              return { type, image: null };
            } catch {
              return { type, image: null };
            }
          })
        );

        const newCovers = {
          photographie: results.find((r) => r.type === "photographie")?.image || null,
          graphismeGalerie: results.find((r) => r.type === "graphisme-galerie")?.image || null,
          graphismeDecouvrir: results.find((r) => r.type === "graphisme-decouvrir")?.image || null,
          services: results.find((r) => r.type === "services")?.image || null,
          backgroundSite: results.find((r) => r.type === "background-site")?.image || null,
        };

        setCovers(newCovers);
      } catch (error) {
        console.error("Erreur chargement couvertures:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCovers();
  }, []);

  return { covers, loading };
};
