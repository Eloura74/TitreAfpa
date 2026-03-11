import { useState } from "react";
import axios from "axios";
import { Trash2, MessageSquare, X, Check } from "lucide-react";
import { API_URL } from "../../../config/api";

interface PhotoOriginale {
  _id: string;
  nom: string;
  fichierR2: string;
  miniature: string | null;
  taille: number;
  format: string;
  dateUpload: string;
  nbTelechargements: number;
  commentaire: string | null;
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
    currentComment: string | null,
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

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">
        Photos originales ({photos.length})
      </h3>

      {photos.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          Aucune photo originale uploadée
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div
              key={photo._id}
              className="bg-black/40 border border-white/10 rounded-lg overflow-hidden hover:border-yellow-400/50 transition-all"
            >
              {/* Miniature */}
              <div className="relative aspect-video bg-black/60">
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
              </div>

              {/* Informations */}
              <div className="p-4 space-y-3">
                <div>
                  <p
                    className="text-white font-medium truncate"
                    title={photo.nom}
                  >
                    {photo.nom}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {formatFileSize(photo.taille)} • {photo.format}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {photo.nbTelechargements} téléchargement(s)
                  </p>
                </div>

                {/* Commentaire */}
                <div className="space-y-2">
                  {editingCommentId === photo._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Ajouter un commentaire visible par le client..."
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded text-white text-sm resize-none focus:border-yellow-400/50 focus:outline-none"
                        rows={3}
                        disabled={loading}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveComment(photo._id)}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Enregistrer
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {photo.commentaire ? (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                          <p className="text-blue-300 text-sm italic">
                            "{photo.commentaire}"
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

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() =>
                      handleEditComment(photo._id, photo.commentaire)
                    }
                    disabled={loading || editingCommentId === photo._id}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {photo.commentaire ? "Modifier" : "Ajouter"} commentaire
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(photo._id, photo.nom)}
                    disabled={loading}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
