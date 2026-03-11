import { useState } from "react";
import axios from "axios";
import { Trash2, MessageSquare, X, Check } from "lucide-react";
import { API_URL } from "../../../config/api";

interface PhotoOriginale {
  _id?: string;
  nom: string;
  fichierR2: string;
  miniature?: string | null;
  taille: number;
  format: string;
  dateUpload?: string;
  nbTelechargements?: number;
  commentaire?: string | null;
}

interface PhotoOriginalesManagerProps {
  accesId: string;
  codeAcces: string;
  photos: PhotoOriginale[];
  onPhotosUpdate: () => void;
}

export default function PhotoOriginalesManager({
  accesId,
  codeAcces,
  photos,
  onPhotosUpdate,
}: PhotoOriginalesManagerProps) {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);

  // Suppression d'une photo
  const handleDeletePhoto = async (photoId: string, photoNom: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${photoNom}" ?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(
        `${API_URL}/api/ecrin/photo/${accesId}/${photoId}`,
        {
          data: { codeAcces },
        },
      );

      if (response.data.success) {
        alert("Photo supprimée avec succès");
        onPhotosUpdate();
      }
    } catch (error) {
      console.error("Erreur suppression photo:", error);
      alert("Erreur lors de la suppression de la photo");
    } finally {
      setLoading(false);
    }
  };

  // Ouverture du mode édition de commentaire
  const handleEditComment = (
    photoId: string,
    currentComment: string | null | undefined,
  ) => {
    setEditingCommentId(photoId);
    setCommentText(currentComment || "");
  };

  // Sauvegarde du commentaire
  const handleSaveComment = async (photoId: string) => {
    setLoading(true);
    try {
      const response = await axios.patch(
        `${API_URL}/api/ecrin/photo/${accesId}/${photoId}/commentaire`,
        {
          codeAcces,
          commentaire: commentText.trim() || null,
        },
      );

      if (response.data.success) {
        setEditingCommentId(null);
        setCommentText("");
        onPhotosUpdate();
      }
    } catch (error) {
      console.error("Erreur mise à jour commentaire:", error);
      alert("Erreur lors de la mise à jour du commentaire");
    } finally {
      setLoading(false);
    }
  };

  // Annulation de l'édition
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setCommentText("");
  };

  // Formatage de la taille de fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const validPhotos = photos.filter((p) => p._id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">
          📸 Photos originales
          <span className="ml-3 text-lg text-yellow-400">
            ({validPhotos.length})
          </span>
        </h3>
      </div>

      {validPhotos.length === 0 ? (
        <div className="bg-black/20 border-2 border-dashed border-white/10 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-lg">
            Aucune photo originale uploadée
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {validPhotos.map((photo) => (
            <div
              key={photo._id}
              className="bg-gradient-to-br from-black/60 to-black/40 border border-white/10 rounded-xl overflow-hidden hover:border-yellow-400/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row">
                {/* Miniature */}
                <div className="relative w-full md:w-64 h-48 md:h-auto bg-black/60 flex-shrink-0">
                  {photo.miniature ? (
                    <img
                      src={photo.miniature}
                      alt={photo.nom}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <svg
                        className="w-20 h-20"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h4
                        className="text-white font-bold text-lg mb-2"
                        title={photo.nom}
                      >
                        {photo.nom}
                      </h4>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full font-semibold">
                          {formatFileSize(photo.taille)}
                        </span>
                        <span className="text-gray-400">{photo.format}</span>
                        <span className="text-gray-500">
                          📥 {photo.nbTelechargements || 0} téléchargements
                        </span>
                      </div>
                    </div>

                    {/* Bouton supprimer */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (photo._id) handleDeletePhoto(photo._id, photo.nom);
                      }}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 hover:scale-105 shadow-lg"
                      title="Supprimer cette photo"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Supprimer</span>
                    </button>
                  </div>

                  {/* Commentaire */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                      <p className="text-blue-400 text-sm font-semibold uppercase tracking-wide">
                        Commentaire client
                      </p>
                    </div>

                    {editingCommentId === photo._id ? (
                      <div className="space-y-3">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Ajouter un commentaire visible par le client..."
                          className="w-full px-4 py-3 bg-black/40 border-2 border-white/20 rounded-lg text-white text-sm resize-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none"
                          rows={3}
                          disabled={loading}
                          autoFocus
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              photo._id && handleSaveComment(photo._id)
                            }
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 shadow-md hover:scale-105"
                          >
                            <Check className="w-4 h-4" />
                            Enregistrer
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 shadow-md hover:scale-105"
                          >
                            <X className="w-4 h-4" />
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {photo.commentaire ? (
                          <div className="bg-blue-500/10 border-l-4 border-blue-500 rounded-lg p-4">
                            <p className="text-blue-200 text-sm leading-relaxed">
                              💬 "{photo.commentaire}"
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm italic py-2">
                            Aucun commentaire
                          </p>
                        )}
                        <button
                          onClick={() =>
                            photo._id &&
                            handleEditComment(photo._id, photo.commentaire)
                          }
                          disabled={loading}
                          className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 hover:scale-105"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {photo.commentaire
                            ? "Modifier"
                            : "Ajouter un commentaire"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
