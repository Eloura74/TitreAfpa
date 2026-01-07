// Importations des modules nécessaires
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import galerieData from "../../config/galerie.json";
import { API_URL as BASE_API_URL } from "../../config/api";
import { useToast } from "../../components/Toast";
import {
  ArrowLeft,
  Upload,
  Check,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

const API_URL = `${BASE_API_URL}/api/galerie`;

// --- TYPE PRINCIPAL DU FORMULAIRE ---
interface FormType {
  src: string;
  alt: string;
  titre: string;
  description: string;
  categorie: string;
  tarifs: TarifOeuvre[];
}

// --- TYPE POUR UN TARIF (FORMAT/SUPPORT/PRIX) ---
interface TarifOeuvre {
  id: string;
  format: string;
  support: string;
  prix: number;
}

// --- TYPE POUR UN TARIF PRÉDÉFINI ---
interface TarifPredefini {
  _id: string;
  id: string;
  nom: string;
  type: string;
  format: string;
  prix: number;
  support: string;
  actif: boolean;
}

// --- FORMULAIRE INITIAL AVEC TARIFS VIDE ---
const formInitial: FormType = {
  src: "",
  alt: "",
  titre: "",
  description: "",
  categorie: "",
  tarifs: [],
};

// Interface pour les photos (structure des objets photo)
interface Photo {
  _id?: string;
  src: string;
  alt: string;
  titre: string;
  description: string;
  prix: number;
  categorie: string;
  tarifs: TarifOeuvre[];
}

export default function GalerieForm() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [form, setForm] = useState<FormType>(formInitial);
  const [tarifsPredéfinis, setTarifsPredéfinis] = useState<TarifPredefini[]>(
    []
  );
  const [tarifsSélectionnés, setTarifsSélectionnés] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const [editId, setEditId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resPhotos = await fetch(API_URL);
        const dataPhotos = await resPhotos.json();
        setPhotos(dataPhotos);

        const resTarifs = await fetch(`${BASE_API_URL}/api/tarifs`);
        const dataTarifs = await resTarifs.json();
        setTarifsPredéfinis(dataTarifs.filter((t: TarifPredefini) => t.actif));
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        addToast("Erreur lors du chargement des données", "error");
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "prix" ? parseFloat(value || "0") : value,
    });
  };

  const handleSubmit = async () => {
    if (
      !form.src ||
      !form.titre ||
      !form.alt ||
      !form.description ||
      !form.categorie
    ) {
      addToast("Veuillez remplir tous les champs correctement.", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      if (tarifsSélectionnés.length === 0) {
        addToast(
          "Veuillez sélectionner au moins un tarif pour cette photo.",
          "warning"
        );
        setIsSubmitting(false);
        return;
      }

      const tarifsÀEnvoyer = tarifsSélectionnés
        .map((id) => {
          const tarifTrouvé = tarifsPredéfinis.find(
            (t) => t._id === id || t.id === id
          );

          if (tarifTrouvé) {
            return {
              id: tarifTrouvé._id || tarifTrouvé.id,
              format: tarifTrouvé.format,
              support: tarifTrouvé.support,
              prix: tarifTrouvé.prix,
            };
          }
          return null;
        })
        .filter((t) => t !== null) as TarifOeuvre[];

      const formAvecTarifs = {
        src: form.src,
        alt: form.alt,
        titre: form.titre,
        description: form.description,
        categorie: form.categorie,
        tarifs: tarifsÀEnvoyer,
      };

      try {
        if (editId) {
          const res = await fetch(`${API_URL}/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formAvecTarifs),
          });
          if (!res.ok) {
            const err = await res.text();
            addToast("Erreur serveur: " + err, "error");
            setIsSubmitting(false);
            return;
          }
          const updated = await res.json();
          setPhotos(
            photos.map((photo) => (photo._id === editId ? updated : photo))
          );
          setEditId(null);
          addToast("Photo modifiée avec succès !", "success");
        } else {
          const photoMinimale = {
            src: formAvecTarifs.src,
            alt: formAvecTarifs.alt,
            titre: formAvecTarifs.titre,
            description: formAvecTarifs.description,
            categorie: formAvecTarifs.categorie,
          };

          const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(photoMinimale),
          });

          const responseText = await res.text();

          if (!res.ok) {
            let errorMessage = `Erreur étape 1 - ${res.status}: ${res.statusText}`;
            try {
              const errorJson = JSON.parse(responseText);
              errorMessage += `\n\nDétails: ${JSON.stringify(
                errorJson,
                null,
                2
              )}`;
            } catch {
              errorMessage += `\n\nDétails: ${responseText}`;
            }
            addToast("Erreur lors de la création : " + errorMessage, "error");
            setIsSubmitting(false);
            return;
          }

          let photoCreee = JSON.parse(responseText);

          try {
            if (photoCreee && photoCreee._id) {
              const updateRes = await fetch(`${API_URL}/${photoCreee._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tarifs: formAvecTarifs.tarifs }),
              });

              const updateResponseText = await updateRes.text();

              if (!updateRes.ok) {
                addToast(
                  "Photo créée, mais erreur lors de l'ajout des tarifs.",
                  "warning"
                );
              } else {
                try {
                  photoCreee = JSON.parse(updateResponseText);
                } catch (e) {
                  console.error("Erreur de parsing de la réponse étape 2:", e);
                }
              }
            }
          } catch (updateErr) {
            addToast("Erreur lors de l'ajout des tarifs.", "warning");
          }

          setPhotos((prevPhotos) => [...prevPhotos, photoCreee]);
          addToast("Photo ajoutée avec succès !", "success");
        }
      } catch (err) {
        addToast("Erreur réseau ou serveur: " + err, "error");
        setIsSubmitting(false);
        return;
      }

      setForm(formInitial);
      setTarifsSélectionnés([]);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      addToast("Une erreur inattendue est survenue.", "error");
      setIsSubmitting(false);
    }
  };

  const allCategories = [
    ...new Set([
      ...photos.map((p) => p.categorie),
      ...galerieData.map((p) => p.categorie),
    ]),
  ].sort((a, b) => a.localeCompare(b));

  return (
    <div className="p-8 max-w-4xl mx-auto text-white bg-[#12121a]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl">
      {/* En-tête du formulaire */}
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-serif italic text-[#ffe992] mb-1">
            Gestion de la Galerie
          </h2>
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Ajouter ou modifier une œuvre
          </p>
        </div>
        <button
          onClick={() => navigate("/galerie")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-sm font-medium border border-white/5"
        >
          <ArrowLeft size={16} /> Retour à la galerie
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colonne Gauche : Upload et Infos */}
        <div className="space-y-6">
          {/* Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#ffe992] uppercase tracking-wider">
              Image de l'œuvre
            </label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  try {
                    const signRes = await fetch(
                      `${BASE_API_URL}/api/upload-cloudinary/sign`,
                      { method: "GET", credentials: "include" }
                    );

                    if (!signRes.ok) throw new Error("Erreur signature");

                    const signData = await signRes.json();
                    const {
                      signature,
                      timestamp,
                      cloud_name,
                      api_key,
                      folder,
                    } = signData;

                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("signature", signature);
                    formData.append("timestamp", timestamp.toString());
                    formData.append("api_key", api_key);
                    formData.append("folder", folder);

                    const uploadRes = await fetch(
                      `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
                      { method: "POST", body: formData }
                    );

                    const uploadData = await uploadRes.json();

                    if (uploadData.secure_url) {
                      setForm((prev) => ({
                        ...prev,
                        src: uploadData.secure_url,
                      }));
                      addToast("Image uploadée avec succès !", "success");
                    } else {
                      addToast("L'upload a échoué", "error");
                    }
                  } catch (err) {
                    addToast("Erreur lors de l'envoi de l'image.", "error");
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className={`w-full h-64 rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
                  form.src
                    ? "border-[#ffe992]/50 bg-black/40"
                    : "border-white/10 bg-white/5 hover:border-[#ffe992]/30 hover:bg-white/10"
                }`}
              >
                {form.src ? (
                  <img
                    src={form.src}
                    alt="Aperçu"
                    className="w-full h-full object-contain rounded-lg p-2"
                  />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#ffe992] transition-colors">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm text-gray-400 group-hover:text-white transition-colors">
                      Cliquez ou glissez une image ici
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Champs Texte */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#ffe992] uppercase tracking-wider">
                Titre
              </label>
              <input
                name="titre"
                placeholder="Ex: L'Aube Dorée"
                value={form.titre}
                onChange={handleChange}
                className="w-full bg-[#0a0a10] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none focus:ring-1 focus:ring-[#ffe992]/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#ffe992] uppercase tracking-wider">
                  Catégorie
                </label>
                <input
                  list="categories"
                  name="categorie"
                  placeholder="Ex: Paysage"
                  value={form.categorie}
                  onChange={handleChange}
                  className="w-full bg-[#0a0a10] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none focus:ring-1 focus:ring-[#ffe992]/50 transition-all"
                />
                <datalist id="categories">
                  {allCategories.map((cat, index) => (
                    <option key={index} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#ffe992] uppercase tracking-wider">
                  Alt Text
                </label>
                <input
                  name="alt"
                  placeholder="Description courte pour SEO"
                  value={form.alt}
                  onChange={handleChange}
                  className="w-full bg-[#0a0a10] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none focus:ring-1 focus:ring-[#ffe992]/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#ffe992] uppercase tracking-wider">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Description détaillée de l'œuvre..."
                value={form.description}
                onChange={handleChange}
                className="w-full bg-[#0a0a10] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none focus:ring-1 focus:ring-[#ffe992]/50 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Colonne Droite : Tarifs */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#ffe992] uppercase tracking-wider">
              Tarifs Applicables
            </label>
            <a
              href="/admin/tarifs"
              target="_blank"
              className="text-xs text-gray-400 hover:text-white underline decoration-gray-600 hover:decoration-white transition-all"
            >
              Gérer les tarifs
            </a>
          </div>

          <div className="bg-[#0a0a10] rounded-xl border border-white/10 overflow-hidden h-[600px] overflow-y-auto custom-scrollbar">
            {tarifsPredéfinis.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-3">
                <AlertCircle size={32} />
                <p>Aucun tarif disponible.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {tarifsPredéfinis.map((tarif) => {
                  const isSelected = tarifsSélectionnés.includes(
                    tarif._id || tarif.id
                  );
                  return (
                    <div
                      key={tarif._id || tarif.id}
                      onClick={() => {
                        if (isSelected) {
                          setTarifsSélectionnés(
                            tarifsSélectionnés.filter(
                              (id) => id !== (tarif._id || tarif.id)
                            )
                          );
                        } else {
                          setTarifsSélectionnés([
                            ...tarifsSélectionnés,
                            tarif._id || tarif.id,
                          ]);
                        }
                      }}
                      className={`p-4 cursor-pointer transition-all duration-200 flex items-start gap-4 group ${
                        isSelected
                          ? "bg-[#ffe992]/10 hover:bg-[#ffe992]/20"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div
                        className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-[#ffe992] border-[#ffe992] text-black"
                            : "border-gray-600 group-hover:border-gray-400 bg-transparent"
                        }`}
                      >
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>

                      <div className="flex-1">
                        <div
                          className={`font-medium mb-1 transition-colors ${
                            isSelected ? "text-[#ffe992]" : "text-white"
                          }`}
                        >
                          {tarif.nom}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                            {tarif.format}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                            {tarif.support}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-lg font-bold ${
                            isSelected ? "text-[#ffe992]" : "text-white"
                          }`}
                        >
                          {tarif.prix}€
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bouton de validation */}
      <div className="mt-8 pt-6 border-t border-white/5">
        <button
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            !form.src ||
            !form.titre ||
            !form.alt ||
            !form.description ||
            !form.categorie ||
            tarifsSélectionnés.length === 0
          }
          className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 shadow-lg ${
            isSubmitting ||
            !form.src ||
            !form.titre ||
            !form.alt ||
            !form.description ||
            !form.categorie ||
            tarifsSélectionnés.length === 0
              ? "bg-gray-800 text-gray-500 cursor-not-allowed shadow-none"
              : "bg-[#ffe992] text-black hover:bg-white hover:shadow-[#ffe992]/20 transform hover:-translate-y-1"
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <span className="loading loading-spinner loading-sm"></span>
              Traitement en cours...
            </div>
          ) : editId ? (
            "Enregistrer les modifications"
          ) : (
            "Ajouter à la galerie"
          )}
        </button>

        {/* Messages d'erreur contextuels */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs text-red-400/80 font-mono">
          {!form.src && <span>* Image requise</span>}
          {!form.titre && <span>* Titre requis</span>}
          {tarifsSélectionnés.length === 0 && (
            <span>* Au moins un tarif requis</span>
          )}
        </div>
      </div>
    </div>
  );
}
