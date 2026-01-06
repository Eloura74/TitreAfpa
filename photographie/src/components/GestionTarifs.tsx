// ===================================================
// 🔌 Importations des librairies et hooks nécessaires
// ===================================================
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Gestion de cache / API
import { Tarif } from "../types/tarif"; // Type centralisé du tarif
import { useForm } from "react-hook-form"; // Hook de formulaire réactif
import { zodResolver } from "@hookform/resolvers/zod"; // Liaison Zod <-> RHF
import { z } from "zod"; // Validation de schéma
import { useState } from "react"; // Hook local d’édition
import { API_URL } from "../config/api";

/* -------------------------------------------------------------------------
   🧩 Schéma de validation Zod (formulaire tarif)
------------------------------------------------------------------------- */
const tarifSchema = z.object({
  nom: z.string().min(2),
  type: z.string().min(2), // Autorise tout type de chaîne (min 2 chars)
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
      const res = await fetch(`${API_URL}/api/tarifs`);
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
        ? `${API_URL}/api/tarifs/${data.id}`
        : `${API_URL}/api/tarifs`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Cookie HttpOnly
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
      await fetch(`${API_URL}/api/tarifs/${id}`, {
        method: "DELETE",
        credentials: "include", // Cookie HttpOnly
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
      type: "",
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
    <div className="space-y-8">
      {/* EN-TÊTE DE SECTION */}
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-yellow-400">
            Gestion des Tarifs
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Définissez ici les formats et prix disponibles pour vos photos.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            Total tarifs
          </span>
          <div className="text-xl font-bold text-white">
            {tarifs?.length || 0}
          </div>
        </div>
      </div>

      {/* FORMULAIRE : CARTE D'ÉDITION/AJOUT */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
        <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            {edit ? (
              <>
                <span className="text-blue-400">✏️</span> Modifier un tarif
              </>
            ) : (
              <>
                <span className="text-green-400">➕</span> Ajouter un nouveau
                tarif
              </>
            )}
          </h3>
          {edit && (
            <button
              onClick={handleCancel}
              className="text-xs text-gray-400 hover:text-white underline"
            >
              Annuler l'édition
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit((data) =>
            mutation.mutate({ ...data, id: edit?.id })
          )}
          className="p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* COLONNE 1 : Informations Principales */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Informations
              </h4>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-gray-300">Nom interne</span>
                </label>
                <input
                  {...register("nom")}
                  placeholder="Ex: Portrait A4"
                  className={`input input-bordered w-full bg-gray-900 ${
                    errors.nom ? "input-error" : ""
                  }`}
                />
                {errors.nom && (
                  <span className="text-error text-xs mt-1">
                    {errors.nom.message}
                  </span>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-gray-300">Type</span>
                </label>
                <input
                  {...register("type")}
                  list="types-list"
                  placeholder="Ex: Tirage Papier, Album..."
                  className={`input input-bordered w-full bg-gray-900 ${
                    errors.type ? "input-error" : ""
                  }`}
                />
                <datalist id="types-list">
                  <option value="Tirage Papier" />
                  <option value="Poster" />
                  <option value="Toile" />
                  <option value="Objet Cadeau" />
                  <option value="Textile" />
                  <option value="Album" />
                  <option value="Fichier Numérique" />
                </datalist>
                {errors.type && (
                  <span className="text-error text-xs mt-1">
                    {errors.type.message}
                  </span>
                )}
              </div>
            </div>

            {/* COLONNE 2 : Détails Techniques */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Détails
              </h4>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-gray-300">Format</span>
                </label>
                <input
                  {...register("format")}
                  placeholder="Ex: 21x29.7 cm"
                  className={`input input-bordered w-full bg-gray-900 ${
                    errors.format ? "input-error" : ""
                  }`}
                />
                {errors.format && (
                  <span className="text-error text-xs mt-1">
                    {errors.format.message}
                  </span>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-gray-300">Support</span>
                </label>
                <input
                  {...register("support")}
                  placeholder="Ex: Papier Glacé"
                  className={`input input-bordered w-full bg-gray-900 ${
                    errors.support ? "input-error" : ""
                  }`}
                />
                {errors.support && (
                  <span className="text-error text-xs mt-1">
                    {errors.support.message}
                  </span>
                )}
              </div>
            </div>

            {/* COLONNE 3 : Prix et Options */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Vente
              </h4>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-gray-300">Prix (€)</span>
                </label>
                <div className="relative">
                  <input
                    {...register("prix", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`input input-bordered w-full bg-gray-900 pr-8 ${
                      errors.prix ? "input-error" : ""
                    }`}
                  />
                  <span className="absolute right-3 top-3 text-gray-500">
                    €
                  </span>
                </div>
                {errors.prix && (
                  <span className="text-error text-xs mt-1">
                    {errors.prix.message}
                  </span>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label cursor-pointer justify-start gap-4 mt-4">
                  <input
                    type="checkbox"
                    {...register("actif")}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text text-white">Tarif Actif</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 pl-1">
                  Si décoché, ce tarif ne sera pas proposé aux clients.
                </p>
              </div>
            </div>
          </div>

          {/* Actions du formulaire */}
          <div className="mt-8 flex justify-end gap-3 border-t border-gray-700 pt-4">
            {edit && (
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-ghost hover:bg-gray-700"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              className={`btn ${
                edit
                  ? "btn-warning text-black hover:bg-yellow-500"
                  : "btn-primary hover:bg-blue-700"
              } px-8`}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <span className="loading loading-spinner"></span>
              ) : edit ? (
                "Mettre à jour"
              ) : (
                "Ajouter ce tarif"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* TABLEAU : LISTE DES TARIFS */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            {/* En-tête du tableau */}
            <thead className="bg-gray-900 text-gray-400 uppercase text-xs font-bold">
              <tr>
                <th className="py-4 pl-6">Nom & Type</th>
                <th>Format & Support</th>
                <th>Prix</th>
                <th>Statut</th>
                <th className="text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                    <span className="loading loading-spinner loading-lg mb-2"></span>
                    <p>Chargement des tarifs...</p>
                  </td>
                </tr>
              ) : tarifs?.length ? (
                tarifs.map((tarif: Tarif) => (
                  <tr
                    key={tarif._id || tarif.id}
                    className="hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="pl-6">
                      <div className="font-bold text-white text-base">
                        {tarif.nom}
                      </div>
                      <div className="text-xs text-gray-500 badge badge-ghost badge-sm mt-1">
                        {tarif.type}
                      </div>
                    </td>
                    <td>
                      <div className="text-gray-300">{tarif.format}</div>
                      <div className="text-xs text-gray-500 italic">
                        {tarif.support}
                      </div>
                    </td>
                    <td>
                      <div className="font-bold text-yellow-400 text-lg">
                        {tarif.prix} €
                      </div>
                    </td>
                    <td>
                      {tarif.actif ? (
                        <div className="badge badge-success gap-1 text-xs font-semibold">
                          Actif
                        </div>
                      ) : (
                        <div className="badge badge-error gap-1 text-xs font-semibold">
                          Inactif
                        </div>
                      )}
                    </td>
                    <td className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <button
                          className="btn btn-sm btn-square btn-ghost hover:bg-blue-900/30 text-blue-400"
                          onClick={() => handleEdit(tarif)}
                          title="Éditer"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-square btn-ghost hover:bg-red-900/30 text-red-400"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Êtes-vous sûr de vouloir supprimer ce tarif ?"
                              )
                            ) {
                              deleteMutation.mutate(tarif._id || tarif.id);
                            }
                          }}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <div className="flex flex-col items-center text-gray-500">
                      <span className="text-4xl mb-2">📭</span>
                      <p>Aucun tarif enregistré pour le moment.</p>
                      <p className="text-sm">
                        Utilisez le formulaire ci-dessus pour en ajouter un.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
