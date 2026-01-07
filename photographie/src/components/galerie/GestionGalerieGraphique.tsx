import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../config/api";
import { Edit, Trash2, Plus, Image as ImageIcon } from "lucide-react";

interface OeuvreGraphique {
  _id?: string;
  titre: string;
  image: string;
  prix: number;
  description?: string;
}

export default function GestionGalerieGraphique() {
  const [oeuvres, setOeuvres] = useState<OeuvreGraphique[]>([]);
  const [form, setForm] = useState<OeuvreGraphique>({
    titre: "",
    image: "",
    prix: 0,
    description: "",
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOeuvres();
  }, []);

  async function fetchOeuvres() {
    try {
      const { data } = await axios.get(`${API_URL}/api/oeuvres-graphique`);
      setOeuvres(data);
    } catch {
      setMessage("Erreur lors du chargement des œuvres.");
    }
  }

  async function handleUploadImage(file: File): Promise<string | null> {
    try {
      // 1. Récupérer la signature depuis le backend
      console.log(
        "Fetching signature from:",
        `${API_URL}/api/upload-cloudinary/sign`
      );
      const signRes = await fetch(`${API_URL}/api/upload-cloudinary/sign`, {
        method: "GET",
        credentials: "include",
      });

      if (!signRes.ok) {
        console.error(
          "Signature fetch failed:",
          signRes.status,
          signRes.statusText
        );
        throw new Error("Erreur lors de la récupération de la signature");
      }

      const signData = await signRes.json();
      const { signature, timestamp, cloud_name, api_key, folder } = signData;

      // 2. Préparer le formulaire pour Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", api_key);
      formData.append("folder", folder);

      // 3. Envoyer directement à Cloudinary
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        throw new Error("Erreur lors de l'upload Cloudinary");
      }

      const uploadData = await uploadRes.json();
      return uploadData.secure_url;
    } catch (error) {
      console.error("Erreur upload:", error);
      setMessage("Erreur lors de l’upload de l’image.");
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    let imagePath = form.image;

    if (!editId && !imageFile) {
      setMessage("Merci de sélectionner une image à importer.");
      setLoading(false);
      return;
    }

    if (form.titre.trim() === "") {
      setMessage("Le titre est requis.");
      setLoading(false);
      return;
    }

    if (form.prix <= 0) {
      setMessage("Le prix doit être supérieur à 0.");
      setLoading(false);
      return;
    }

    if (imageFile) {
      const uploaded = await handleUploadImage(imageFile);
      if (!uploaded) {
        setLoading(false);
        return;
      }
      imagePath = uploaded;
    }

    try {
      if (editId) {
        const { data } = await axios.put(
          `${API_URL}/api/oeuvres-graphique/${editId}`,
          { ...form, image: imagePath }
        );
        setOeuvres((prev) => prev.map((o) => (o._id === editId ? data : o)));
        setMessage("Œuvre modifiée !");
        setEditId(null);
      } else {
        const { data } = await axios.post(`${API_URL}/api/oeuvres-graphique`, {
          ...form,
          image: imagePath,
        });
        setOeuvres((prev) => [...prev, data]);
        setMessage("Œuvre ajoutée !");
      }
      setForm({ titre: "", image: "", prix: 0, description: "" });
      setImageFile(null);
    } catch {
      setMessage("Erreur lors de l’enregistrement.");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(oeuvre: OeuvreGraphique) {
    setForm({
      titre: oeuvre.titre,
      image: oeuvre.image,
      prix: oeuvre.prix,
      description: oeuvre.description || "",
    });
    setEditId(oeuvre._id || null);
    setImageFile(null);
    setMessage(null);
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    if (!window.confirm("Supprimer cette œuvre ?")) return;

    try {
      await axios.delete(`${API_URL}/api/oeuvres-graphique/${id}`);
      setOeuvres((prev) => prev.filter((o) => o._id !== id));
      setMessage("Œuvre supprimée !");
    } catch {
      setMessage("Erreur lors de la suppression.");
    }
  }

  return (
    <div className="bg-[#12121a]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-serif italic text-[#ffe992] mb-1">
            Gestion Galerie Graphique
          </h2>
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Créations et designs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLONNE GAUCHE : Formulaire */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0a0a10] rounded-xl border border-white/10 p-6">
            <h3 className="text-sm font-bold text-[#ffe992] uppercase tracking-wider mb-6 flex items-center gap-2">
              {editId ? <Edit size={16} /> : <Plus size={16} />}
              {editId ? "Modifier l'œuvre" : "Ajouter une œuvre"}
            </h3>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Image
                </label>
                <div className="relative group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className={`w-full h-48 rounded-lg border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                      imageFile || form.image
                        ? "border-[#ffe992]/50 bg-black/40"
                        : "border-white/10 bg-white/5 hover:border-[#ffe992]/30 hover:bg-white/10"
                    }`}
                  >
                    {imageFile ? (
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        className="w-full h-full object-contain rounded-md p-2"
                      />
                    ) : form.image ? (
                      <img
                        src={form.image}
                        alt="Current"
                        className="w-full h-full object-contain rounded-md p-2"
                      />
                    ) : (
                      <>
                        <ImageIcon
                          className="text-gray-500 group-hover:text-[#ffe992] transition-colors"
                          size={24}
                        />
                        <span className="text-xs text-gray-500 group-hover:text-white transition-colors">
                          Choisir une image
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Détails
                </label>
                <input
                  type="text"
                  placeholder="Titre de l'œuvre"
                  value={form.titre}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, titre: e.target.value }))
                  }
                  className="w-full bg-[#1a1a20] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none focus:ring-1 focus:ring-[#ffe992]/50 transition-all text-sm"
                  required
                />

                <textarea
                  placeholder="Description (optionnelle)"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="w-full bg-[#1a1a20] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none transition-all text-sm resize-none h-24"
                />

                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 text-sm">
                    €
                  </span>
                  <input
                    type="number"
                    placeholder="Prix"
                    value={form.prix}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, prix: Number(e.target.value) }))
                    }
                    className="w-full bg-[#1a1a20] border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`text-xs p-3 rounded border ${
                    message.includes("Erreur")
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-green-500/10 text-green-400 border-green-500/20"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#ffe992] text-black font-bold uppercase tracking-wider text-sm py-3 rounded-lg hover:bg-white transition-colors shadow-lg shadow-[#ffe992]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    loading ||
                    form.titre.trim() === "" ||
                    (!editId && !imageFile) ||
                    form.prix <= 0
                  }
                >
                  {loading
                    ? "Traitement..."
                    : editId
                    ? "Enregistrer"
                    : "Ajouter"}
                </button>
                {editId && (
                  <button
                    type="button"
                    className="px-4 py-3 bg-white/5 text-white font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-white/10 transition-colors border border-white/5"
                    onClick={() => {
                      setEditId(null);
                      setForm({
                        titre: "",
                        image: "",
                        prix: 0,
                        description: "",
                      });
                      setImageFile(null);
                      setMessage(null);
                    }}
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
                Liste des œuvres ({oeuvres.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {oeuvres.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                  <ImageIcon size={32} className="opacity-20" />
                  <p>Aucune œuvre graphique.</p>
                </div>
              ) : (
                oeuvres.map((oeuvre) => (
                  <div
                    key={oeuvre._id}
                    className="bg-[#1a1a20] p-4 rounded-lg border border-white/5 hover:border-[#ffe992]/30 transition-all group flex gap-4"
                  >
                    <div className="w-24 h-24 rounded-lg bg-black/40 overflow-hidden border border-white/5 flex-shrink-0">
                      <img
                        src={oeuvre.image}
                        alt={oeuvre.titre}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-white group-hover:text-[#ffe992] transition-colors">
                            {oeuvre.titre}
                          </h4>
                          <span className="text-[#ffe992] font-bold">
                            {oeuvre.prix} €
                          </span>
                        </div>
                        {oeuvre.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {oeuvre.description}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="flex items-center gap-1.5 bg-white/5 hover:bg-[#ffe992] hover:text-black text-gray-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 rounded transition-all"
                          onClick={() => handleEdit(oeuvre)}
                        >
                          <Edit size={10} /> Modifier
                        </button>
                        <button
                          className="flex items-center gap-1.5 bg-white/5 hover:bg-red-500 hover:text-white text-gray-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 rounded transition-all"
                          onClick={() => handleDelete(oeuvre._id)}
                        >
                          <Trash2 size={10} /> Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
