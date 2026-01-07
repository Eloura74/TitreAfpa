import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tarif } from "../types/tarif";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { API_URL } from "../config/api";
import { Edit, Trash2, Plus, Tag } from "lucide-react";

const tarifSchema = z.object({
  nom: z.string().min(2),
  type: z.string().min(2),
  format: z.string().min(2),
  prix: z.number().positive(),
  support: z.string().min(2),
  actif: z.boolean(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

type TarifForm = z.infer<typeof tarifSchema> & { id?: string };

export default function GestionTarifs() {
  const queryClient = useQueryClient();
  const [edit, setEdit] = useState<TarifForm | null>(null);

  const { data: tarifs, isLoading } = useQuery({
    queryKey: ["tarifs"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/tarifs`);
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: TarifForm) => {
      const method = data.id ? "PUT" : "POST";
      const url = data.id
        ? `${API_URL}/api/tarifs/${data.id}`
        : `${API_URL}/api/tarifs`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarifs"] });
      setEdit(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`${API_URL}/api/tarifs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarifs"] });
    },
  });

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

  function handleEdit(tarif: Tarif) {
    setEdit({ ...tarif });
    reset({ ...tarif });
  }

  function handleCancel() {
    setEdit(null);
    reset();
  }

  return (
    <div className="bg-[#12121a]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-serif italic text-[#ffe992] mb-1">
            Gestion des Tarifs
          </h2>
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Prix et formats
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
            Total tarifs
          </span>
          <span className="text-xl font-bold text-white">
            {tarifs?.length || 0}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLONNE GAUCHE : Formulaire */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0a0a10] rounded-xl border border-white/10 p-6">
            <h3 className="text-sm font-bold text-[#ffe992] uppercase tracking-wider mb-6 flex items-center gap-2">
              {edit ? <Edit size={16} /> : <Plus size={16} />}
              {edit ? "Modifier le tarif" : "Ajouter un tarif"}
            </h3>

            <form
              onSubmit={handleSubmit((data) =>
                mutation.mutate({ ...data, id: edit?.id })
              )}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Informations
                </label>
                <input
                  {...register("nom")}
                  placeholder="Nom interne (ex: Portrait A4)"
                  className={`w-full bg-[#1a1a20] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none focus:ring-1 focus:ring-[#ffe992]/50 transition-all text-sm ${
                    errors.nom ? "border-red-500/50" : ""
                  }`}
                />
                {errors.nom && (
                  <span className="text-red-400 text-xs">
                    {errors.nom.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Type
                </label>
                <div className="relative">
                  <input
                    {...register("type")}
                    list="types-list"
                    placeholder="Type (ex: Tirage Papier)"
                    className={`w-full bg-[#1a1a20] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none transition-all text-sm ${
                      errors.type ? "border-red-500/50" : ""
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
                </div>
                {errors.type && (
                  <span className="text-red-400 text-xs">
                    {errors.type.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Format
                  </label>
                  <input
                    {...register("format")}
                    placeholder="Ex: 21x29.7 cm"
                    className={`w-full bg-[#1a1a20] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none transition-all text-sm ${
                      errors.format ? "border-red-500/50" : ""
                    }`}
                  />
                  {errors.format && (
                    <span className="text-red-400 text-xs">
                      {errors.format.message}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Support
                  </label>
                  <input
                    {...register("support")}
                    placeholder="Ex: Papier Glacé"
                    className={`w-full bg-[#1a1a20] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none transition-all text-sm ${
                      errors.support ? "border-red-500/50" : ""
                    }`}
                  />
                  {errors.support && (
                    <span className="text-red-400 text-xs">
                      {errors.support.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Prix
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 text-sm">
                    €
                  </span>
                  <input
                    {...register("prix", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`w-full bg-[#1a1a20] border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none transition-all text-sm ${
                      errors.prix ? "border-red-500/50" : ""
                    }`}
                  />
                </div>
                {errors.prix && (
                  <span className="text-red-400 text-xs">
                    {errors.prix.message}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  {...register("actif")}
                  className="rounded border-gray-600 bg-black/50 text-[#ffe992] focus:ring-[#ffe992]"
                  id="actif-check"
                />
                <label
                  htmlFor="actif-check"
                  className="text-sm text-gray-300 cursor-pointer select-none"
                >
                  Tarif Actif (visible par les clients)
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  className="flex-1 bg-[#ffe992] text-black font-bold uppercase tracking-wider text-sm py-3 rounded-lg hover:bg-white transition-colors shadow-lg shadow-[#ffe992]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending
                    ? "Traitement..."
                    : edit
                    ? "Mettre à jour"
                    : "Ajouter"}
                </button>
                {edit && (
                  <button
                    type="button"
                    className="px-4 py-3 bg-white/5 text-white font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-white/10 transition-colors border border-white/5"
                    onClick={handleCancel}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* COLONNE DROITE : Liste */}
        <div className="lg:col-span-7">
          <div className="bg-[#0a0a10] rounded-xl border border-white/10 overflow-hidden flex flex-col h-[800px]">
            <div className="p-4 border-b border-white/5 bg-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Liste des tarifs
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500 gap-2">
                  <span className="loading loading-spinner loading-sm"></span>{" "}
                  Chargement...
                </div>
              ) : tarifs?.length ? (
                tarifs.map((tarif: Tarif) => (
                  <div
                    key={tarif._id || tarif.id}
                    className="bg-[#1a1a20] p-4 rounded-lg border border-white/5 hover:border-[#ffe992]/30 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#ffe992] to-[#c9b36f] opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-white text-lg group-hover:text-[#ffe992] transition-colors">
                          {tarif.nom}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <Tag size={12} /> {tarif.type}
                          <span>•</span>
                          <span>{tarif.format}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[#ffe992] font-bold text-lg block">
                          {tarif.prix} €
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            tarif.actif
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {tarif.actif ? "Actif" : "Inactif"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                      <span className="text-xs text-gray-500 italic">
                        {tarif.support}
                      </span>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="flex items-center gap-1.5 bg-white/5 hover:bg-[#ffe992] hover:text-black text-gray-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all"
                          onClick={() => handleEdit(tarif)}
                        >
                          <Edit size={12} /> Modifier
                        </button>
                        <button
                          className="flex items-center gap-1.5 bg-white/5 hover:bg-red-500 hover:text-white text-gray-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Êtes-vous sûr de vouloir supprimer ce tarif ?"
                              )
                            ) {
                              deleteMutation.mutate(tarif._id || tarif.id);
                            }
                          }}
                        >
                          <Trash2 size={12} /> Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                  <Tag size={32} className="opacity-20" />
                  <p>Aucun tarif trouvé.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
