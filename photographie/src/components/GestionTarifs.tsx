// Import des hooks react-query pour la gestion des données asynchrones (fetch / mutation / cache)
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Type Tarif centralisé dans un fichier de types partagés
import { Tarif } from "../types/tarif";

// Import de React Hook Form pour la gestion de formulaire réactive
import { useForm } from "react-hook-form";

// Intégration de Zod pour la validation de schéma de formulaire
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Hook pour gérer l'état d'édition
import { useState } from "react";

/* -------------------------------------------------------------------------
   📦 Définition du schéma de validation avec Zod
------------------------------------------------------------------------- */
const tarifSchema = z.object({
  nom: z.string().min(2), // Nom requis (au moins 2 caractères)
  type: z.enum(["tirage", "poster", "toile", "cadeau", "textile"]), // Choix parmi une liste fermée
  format: z.string().min(2), // Format requis
  prix: z.number().positive(), // Prix positif obligatoire
  support: z.string().min(2), // Support requis
  actif: z.boolean(), // Booléen actif/inactif
  imageUrl: z.string().url().optional().or(z.literal("")), // URL optionnelle ou vide
});

// Typage TypeScript généré automatiquement à partir du schéma
type TarifForm = z.infer<typeof tarifSchema> & { id?: string }; // Ajout optionnel de l'ID pour édition

/* -------------------------------------------------------------------------
   🎯 Composant principal : gestion des tarifs
------------------------------------------------------------------------- */
export default function GestionTarifs() {
  // Accès au cache client de React Query
  const queryClient = useQueryClient();

  /* -------------------------------------------------------------------------
     🔁 useQuery : Récupération des tarifs depuis l'API
  ------------------------------------------------------------------------- */
  const { data: tarifs, isLoading } = useQuery({
    queryKey: ["tarifs"],
    queryFn: async () => {
      const res = await fetch("/api/tarifs");
      return res.json();
    },
  });

  // État local pour savoir si on est en mode édition
  const [edit, setEdit] = useState<TarifForm | null>(null);

  /* -------------------------------------------------------------------------
     ✅ useMutation : Création / mise à jour des tarifs
  ------------------------------------------------------------------------- */
  const mutation = useMutation({
    mutationFn: async (data: TarifForm) => {
      const method = data.id ? "PUT" : "POST";
      const url = data.id ? `/api/tarifs/${data.id}` : "/api/tarifs";
      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarifs"] }); // Rafraîchit les données après mutation
      setEdit(null); // Sortie du mode édition
      reset(); // Réinitialise le formulaire
    },
  });

  /* -------------------------------------------------------------------------
     ❌ useMutation : Suppression d’un tarif
  ------------------------------------------------------------------------- */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      await fetch(`/api/tarifs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tarifs"] }), // Rafraîchit après suppression
  });

  /* -------------------------------------------------------------------------
     📋 Initialisation du formulaire React Hook Form + Zod
  ------------------------------------------------------------------------- */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TarifForm>({
    resolver: zodResolver(tarifSchema), // Validation avec Zod
    defaultValues: {
      nom: "",
      type: "tirage",
      format: "",
      prix: 0,
      support: "",
      actif: true,
      imageUrl: "",
    },
  });

  // Lorsqu'on clique sur "Éditer", on charge les données dans le formulaire
  function handleEdit(tarif: Tarif) {
    setEdit({ ...tarif });
    reset({ ...tarif });
  }

  // Lorsqu'on clique sur "Annuler"
  function handleCancel() {
    setEdit(null);
    reset();
  }

  /* -------------------------------------------------------------------------
     🎨 Rendu HTML / JSX
  ------------------------------------------------------------------------- */
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Gestion des tarifs</h2>

      {/* Formulaire d'ajout / modification */}
      <form
        onSubmit={handleSubmit((data) =>
          mutation.mutate({ ...data, id: edit?.id })
        )}
        className="grid md:grid-cols-3 gap-4 mb-6"
      >
        <input
          {...register("nom")}
          placeholder="Nom"
          className="input input-bordered"
        />
        <select {...register("type")} className="select select-bordered">
          <option value="tirage">Tirage</option>
          <option value="poster">Poster</option>
          <option value="toile">Toile</option>
          <option value="cadeau">Cadeau</option>
          <option value="textile">Textile</option>
        </select>
        <input
          {...register("format")}
          placeholder="Format"
          className="input input-bordered"
        />
        <input
          {...register("prix", { valueAsNumber: true })}
          type="number"
          placeholder="Prix"
          className="input input-bordered"
        />
        <input
          {...register("support")}
          placeholder="Support"
          className="input input-bordered"
        />
        <input
          {...register("imageUrl")}
          placeholder="URL image (optionnel)"
          className="input input-bordered"
        />

        {/* Champ case à cocher */}
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("actif")} /> Actif
        </label>

        {/* Boutons */}
        <div className="md:col-span-3 flex gap-2">
          <button type="submit" className="btn btn-primary">
            {edit ? "Modifier" : "Ajouter"}
          </button>
          {edit && (
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* Affichage des erreurs de validation */}
      <div className="text-red-500 mb-2">
        {Object.values(errors).map((e) => (
          <div key={e.message}>{e.message}</div>
        ))}
      </div>

      {/* Tableau des tarifs existants */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Type</th>
              <th>Format</th>
              <th>Prix</th>
              <th>Support</th>
              <th>Actif</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7}>Chargement...</td>
              </tr>
            ) : tarifs?.length ? (
              tarifs.map((tarif: Tarif) => (
                <tr key={tarif.id}>
                  <td>{tarif.nom}</td>
                  <td>{tarif.type}</td>
                  <td>{tarif.format}</td>
                  <td>{tarif.prix} €</td>
                  <td>{tarif.support}</td>
                  <td>{tarif.actif ? "Oui" : "Non"}</td>
                  <td className="flex gap-2">
                    <button
                      className="btn btn-xs btn-secondary"
                      onClick={() => handleEdit(tarif)}
                    >
                      Éditer
                    </button>
                    <button
                      className="btn btn-xs btn-error"
                      onClick={() => deleteMutation.mutate(tarif.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>Aucun tarif enregistré.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
