// ===================================================
// 🔌 Importations des librairies et hooks nécessaires
// ===================================================
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Gestion de cache / API
import { Tarif } from "../types/tarif"; // Type centralisé du tarif
import { useForm } from "react-hook-form"; // Hook de formulaire réactif
import { zodResolver } from "@hookform/resolvers/zod"; // Liaison Zod <-> RHF
import { z } from "zod"; // Validation de schéma
import { useState } from "react"; // Hook local d’édition

/* -------------------------------------------------------------------------
   🧩 Schéma de validation Zod (formulaire tarif)
------------------------------------------------------------------------- */
const tarifSchema = z.object({
  nom: z.string().min(2),
  type: z.enum(["tirage", "poster", "toile", "cadeau", "textile"]),
  format: z.string().min(2),
  prix: z.number().positive(),
  support: z.string().min(2),
  actif: z.boolean(),
  imageUrl: z.string().url().optional().or(z.literal("")), // Permet "" ou une URL valide
});

// 🧠 Typage TypeScript du formulaire
type TarifForm = z.infer<typeof tarifSchema> & { id?: string };

// =====================================================================
// 📦 Composant principal : CRUD des tarifs avec React Query
// =====================================================================
export default function GestionTarifs() {
  const queryClient = useQueryClient(); // Accès au cache de requêtes React Query

  // 🖊️ Mode édition (si rempli, le formulaire modifie un tarif existant)
  const [edit, setEdit] = useState<TarifForm | null>(null);

  /* -------------------------------------------------------------------------
     📥 Récupération des tarifs (GET) via React Query
  ------------------------------------------------------------------------- */
  const { data: tarifs, isLoading } = useQuery({
    queryKey: ["tarifs"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tarifs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!res.ok) {
        throw new Error(`Erreur API: ${res.status}`);
      }
      
      return res.json();
    },
  });

  /* -------------------------------------------------------------------------
     🔄 Création ou mise à jour d’un tarif (POST ou PUT)
  ------------------------------------------------------------------------- */
  const mutation = useMutation({
    mutationFn: async (data: TarifForm) => {
      const method = data.id ? "PUT" : "POST";
      const url = data.id
        ? `${import.meta.env.VITE_API_URL}/api/tarifs/${data.id}`
        : `${import.meta.env.VITE_API_URL}/api/tarifs`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarifs"] }); // 🔁 Rechargement des tarifs
      setEdit(null); // Fin de l’édition
      reset(); // Réinitialisation du formulaire
    },
  });

  /* -------------------------------------------------------------------------
     ❌ Suppression d’un tarif via son ID
  ------------------------------------------------------------------------- */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`${import.meta.env.VITE_API_URL}/api/tarifs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarifs"] }); // 🔁 Rafraîchit la liste
    },
  });

  /* -------------------------------------------------------------------------
     📝 Gestion du formulaire avec React Hook Form et validation Zod
  ------------------------------------------------------------------------- */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TarifForm>({
    resolver: zodResolver(tarifSchema),
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

  // ✏️ Active le mode édition et préremplit le formulaire
  function handleEdit(tarif: Tarif) {
    setEdit({ ...tarif });
    reset({ ...tarif });
  }

  // 🔄 Annule l’édition et réinitialise le formulaire
  function handleCancel() {
    setEdit(null);
    reset();
  }

  /* -------------------------------------------------------------------------
     🎨 Rendu JSX
  ------------------------------------------------------------------------- */
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Gestion des tarifs</h2>

      {/* FORMULAIRE : Ajout ou modification */}
      <form
        onSubmit={handleSubmit((data) =>
          mutation.mutate({ ...data, id: edit?.id })
        )}
        className="grid md:grid-cols-3 gap-4 mb-6"
      >
        {/* Champs texte */}
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

        {/* Case à cocher */}
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("actif")} /> Actif
        </label>

        {/* Boutons : soumettre / annuler */}
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

      {/* Affichage des erreurs */}
      <div className="text-red-500 mb-2">
        {Object.values(errors).map((e) => (
          <div key={e.message}>{e.message}</div>
        ))}
      </div>

      {/* TABLEAU : Liste des tarifs */}
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
