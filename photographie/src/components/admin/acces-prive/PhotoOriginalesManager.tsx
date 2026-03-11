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
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">
        Photos originales ({validPhotos.length})
      </h3>

      {validPhotos.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          Aucune photo originale uploadée
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validPhotos.map((photo) => (
            <div
              key={photo._id}
              className="bg-black/40 border border-white/10 rounded-lg overflow-hidden hover:border-yellow-400/50 transition-all shadow-lg"
            >
              {/* Miniature avec bouton supprimer */}
              <div className="relative aspect-video bg-black/60 group">
                {photo.miniature ? (
                  <img
                    src={photo.miniature}
                    alt={photo.nom}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <svg
                      className="w-16 h-16"
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

                {/* Bouton supprimer en haut à droite */}
                <button
                  onClick={() =>
                    photo._id && handleDeletePhoto(photo._id, photo.nom)
                  }
                  disabled={loading}
                  className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-all disabled:opacity-50 opacity-90 hover:opacity-100 hover:scale-110"
                  title="Supprimer cette photo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Informations */}
              <div className="p-4 space-y-4">
                {/* Nom et détails */}
                <div className="space-y-1">
                  <p
                    className="text-white font-semibold text-base truncate"
                    title={photo.nom}
                  >
                    {photo.nom}
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-yellow-400 font-medium">
                      {formatFileSize(photo.taille)}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">{photo.format}</span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    📥 {photo.nbTelechargements || 0} téléchargement(s)
                  </p>
                </div>

                {/* Commentaire */}
                <div className="space-y-2">
                  <p className="text-gray-300 text-xs font-semibold uppercase tracking-wide">
                    Commentaire client
                  </p>
                  {editingCommentId === photo._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Ajouter un commentaire visible par le client..."
                        className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm resize-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none"
                        rows={3}
                        disabled={loading}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            photo._id && handleSaveComment(photo._id)
                          }
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-md"
                        >
                          <Check className="w-4 h-4" />
                          Enregistrer
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-md"
                        >
                          <X className="w-4 h-4" />
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {photo.commentaire ? (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                          <p className="text-blue-300 text-sm leading-relaxed">
                            💬 "{photo.commentaire}"
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm italic">
                          Aucun commentaire
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Bouton modifier commentaire */}
                <button
                  onClick={() =>
                    photo._id && handleEditComment(photo._id, photo.commentaire)
                  }
                  disabled={loading || editingCommentId === photo._id}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  {photo.commentaire
                    ? "Modifier le commentaire"
                    : "Ajouter un commentaire"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
