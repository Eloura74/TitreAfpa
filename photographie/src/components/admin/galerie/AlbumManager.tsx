import { useState, useEffect } from "react";
import { API_URL as BASE_API_URL } from "../../../config/api";
import { albumService, Album } from "../../../services/albumService";
import { useToast } from "../../../components/Toast";
import { Trash2, Edit2, Plus, Image as ImageIcon } from "lucide-react";

export default function AlbumManager() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAlbum, setEditingAlbum] = useState<Partial<Album> | null>(null);
  const { addToast } = useToast();

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const data = await albumService.getAlbums();
      setAlbums(data);
    } catch (error) {
      console.error("Erreur chargement albums:", error);
      addToast("Erreur lors du chargement des albums", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleSave = async () => {
    if (!editingAlbum?.titre) {
      addToast("Le titre est obligatoire", "warning");
      return;
    }

    try {
      if (editingAlbum._id) {
        await albumService.updateAlbum(editingAlbum._id, editingAlbum);
        addToast("Album modifié", "success");
      } else {
        await albumService.createAlbum(editingAlbum);
        addToast("Album créé", "success");
      }
      setEditingAlbum(null);
      fetchAlbums();
    } catch (error) {
      console.error("Erreur sauvegarde album:", error);
      addToast("Erreur lors de la sauvegarde", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet album ?"))
      return;
    try {
      await albumService.deleteAlbum(id);
      addToast("Album supprimé", "success");
      fetchAlbums();
    } catch (error) {
      console.error("Erreur suppression album:", error);
      addToast("Erreur lors de la suppression", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#ffe992]">Mes Albums</h3>
        <button
          onClick={() => setEditingAlbum({ titre: "", description: "" })}
          className="flex items-center gap-2 px-4 py-2 bg-[#ffe992] text-black rounded-lg font-bold hover:bg-white transition-colors"
        >
          <Plus size={18} /> Nouvel Album
        </button>
      </div>

      {editingAlbum && (
        <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
          <h4 className="text-lg font-bold text-white mb-4">
            {editingAlbum._id ? "Modifier l'album" : "Créer un album"}
          </h4>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#ffe992] uppercase">
              Titre
            </label>
            <input
              value={editingAlbum.titre || ""}
              onChange={(e) =>
                setEditingAlbum({ ...editingAlbum, titre: e.target.value })
              }
              className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white"
              placeholder="Nom de l'album"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#ffe992] uppercase">
              Description
            </label>
            <textarea
              value={editingAlbum.description || ""}
              onChange={(e) =>
                setEditingAlbum({
                  ...editingAlbum,
                  description: e.target.value,
                })
              }
              className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white"
              placeholder="Description (optionnel)"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#ffe992] uppercase">
              Image de couverture
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
                      setEditingAlbum({
                        ...editingAlbum,
                        imageCouverture: uploadData.secure_url,
                      });
                      addToast("Image uploadée avec succès !", "success");
                    } else {
                      addToast("L'upload a échoué", "error");
                    }
                  } catch (err) {
                    console.error(err);
                    addToast("Erreur lors de l'envoi de l'image.", "error");
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className={`w-full h-32 rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
                  editingAlbum.imageCouverture
                    ? "border-[#ffe992]/50 bg-black/40"
                    : "border-white/10 bg-white/5 hover:border-[#ffe992]/30 hover:bg-white/10"
                }`}
              >
                {editingAlbum.imageCouverture ? (
                  <img
                    src={editingAlbum.imageCouverture}
                    alt="Aperçu"
                    className="w-full h-full object-contain rounded-lg p-2"
                  />
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#ffe992] transition-colors">
                      <ImageIcon size={16} />
                    </div>
                    <p className="text-xs text-gray-400 group-hover:text-white transition-colors">
                      Cliquez ou glissez une image
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setEditingAlbum(null)}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#ffe992] text-black rounded font-bold hover:bg-white"
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/5 rounded-xl h-48 animate-pulse border border-white/10"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map((album) => (
            <div
              key={album._id}
              className="group relative bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-[#ffe992]/50 transition-all"
            >
              <div className="aspect-video bg-black/50 relative">
                {album.imageCouverture ? (
                  <img
                    src={album.imageCouverture}
                    alt={album.titre}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <ImageIcon size={48} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingAlbum(album)}
                    className="p-2 bg-black/50 rounded-full text-white hover:bg-[#ffe992] hover:text-black"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(album._id)}
                    className="p-2 bg-black/50 rounded-full text-red-400 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-white truncate">{album.titre}</h4>
                <p className="text-sm text-gray-400 truncate">
                  {album.description || "Aucune description"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
