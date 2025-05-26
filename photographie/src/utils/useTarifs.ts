import { useQuery } from "@tanstack/react-query";
// import inutilisé supprimé : import { Tarif } from "../types/tarif";

export function useTarifs() {
  return useQuery({
    queryKey: ["tarifs"],
    queryFn: async () => {
      const res = await fetch("/api/tarifs");
      if (!res.ok) throw new Error("Erreur lors du chargement des tarifs");
      return res.json();
    },
  });
}
