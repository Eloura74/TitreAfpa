import { useState } from "react";
import axios from "axios";
import { Trash2, MessageSquare, X, Check, RefreshCw } from "lucide-react";
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
  const handleDeletePhoto = async (
    e: React.MouseEvent,
    photoId: string,
    photoNom: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${photoNom}" ?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(
        `${API_URL}/api/ecrin/photo/${accesId}/${photoId}`,
        {
          data: { codeAcces },
          withCredentials: true,
        },
      );

      if (response.data.success) {
        alert("Photo supprimée avec succès");
        await onPhotosUpdate();
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
    e: React.MouseEvent,
    photoId: string,
    currentComment: string | null | undefined,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCommentId(photoId);
    setCommentText(currentComment || "");
  };

  // Sauvegarde du commentaire
  const handleSaveComment = async (e: React.MouseEvent, photoId: string) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      const response = await axios.patch(
        `${API_URL}/api/ecrin/photo/${accesId}/${photoId}/commentaire`,
        {
          codeAcces,
          commentaire: commentText.trim() || null,
        },
        { withCredentials: true },
      );

      if (response.data.success) {
        setEditingCommentId(null);
        setCommentText("");
        await onPhotosUpdate();
      }
    } catch (error) {
      console.error("Erreur mise à jour commentaire:", error);
      alert("Erreur lors de la mise à jour du commentaire");
    } finally {
      setLoading(false);
    }
  };

  // Annulation de l'édition
  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCommentId(null);
    setCommentText("");
  };

  // Régénération de la miniature en HD
  const handleRegenerateThumbnail = async (
    e: React.MouseEvent,
    photoId: string,
    photoNom: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Régénérer la miniature HD pour "${photoNom}" ?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/ecrin/regenerate-thumbnail/${accesId}/${photoId}`,
        { codeAcces },
        { withCredentials: true },
      );

      if (response.data.success) {
        alert("Miniature HD régénérée avec succès !");
        await onPhotosUpdate();
      }
    } catch (error) {
      console.error("Erreur régénération miniature:", error);
      alert("Erreur lors de la régénération de la miniature");
    } finally {
      setLoading(false);
    }
  };

  // Formatage de la taille de fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const validPhotos = photos.filter((p) => p._id);

  return (
    <div className="mt-8 pt-6 border-t border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">
          Photos originales ({validPhotos.length})
        </h3>
      </div>

      {validPhotos.length === 0 ? (
        <div className="bg-black/20 border border-dashed border-white/10 rounded-lg p-8 text-center">
          <p className="text-gray-400">Aucune photo originale uploadée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {validPhotos.map((photo) => (
            <div
              key={photo._id}
              className="bg-black/30 border border-white/10 rounded-lg overflow-hidden hover:border-yellow-400/30 transition-all"
            >
              <div className="p-3">
                <div className="flex items-start gap-3">
                  {/* Miniature */}
                  <div className="w-16 h-16 bg-black/60 rounded flex-shrink-0 overflow-hidden">
                    {photo.miniature ? (
                      <img
                        src={photo.miniature}
                        alt={photo.nom}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <svg
                          className="w-8 h-8"
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
                  <div className="flex-1 min-w-0">
                    <h4
                      className="text-white font-semibold text-sm mb-1.5 break-words leading-tight"
                      title={photo.nom}
                    >
                      {photo.nom}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400 mb-2">
                      <span className="font-medium text-yellow-400">
                        {formatFileSize(photo.taille)}
                      </span>
                      <span>•</span>
                      <span>{photo.format}</span>
                      <span>•</span>
                      <span>{photo.nbTelechargements || 0} DL</span>
                    </div>

                    {/* Commentaire inline */}
                    {photo.commentaire && (
                      <div className="text-[11px] text-blue-300 italic leading-tight">
                        💬 {photo.commentaire}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (photo._id) {
                        handleEditComment(e, photo._id, photo.commentaire);
                      }
                    }}
                    disabled={loading}
                    className="flex-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                    title="Ajouter/Modifier commentaire"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Commentaire</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (photo._id)
                        handleRegenerateThumbnail(e, photo._id, photo.nom);
                    }}
                    disabled={loading}
                    className="flex-1 px-3 py-1.5 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white rounded text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                    title="Régénérer miniature HD (1200x1200)"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>HD</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (photo._id) handleDeletePhoto(e, photo._id, photo.nom);
                    }}
                    disabled={loading}
                    className="flex-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>

              {/* Zone d'édition du commentaire */}
              {editingCommentId === photo._id && (
                <div className="border-t border-white/10 p-4 bg-black/20">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ajouter un commentaire visible par le client..."
                    className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm resize-none focus:border-yellow-400/50 focus:outline-none"
                    rows={2}
                    disabled={loading}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) =>
                        photo._id && handleSaveComment(e, photo._id)
                      }
                      disabled={loading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-all"
                    >
                      <Check className="w-3 h-3" />
                      Enregistrer
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={loading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-medium transition-all"
                    >
                      <X className="w-3 h-3" />
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
