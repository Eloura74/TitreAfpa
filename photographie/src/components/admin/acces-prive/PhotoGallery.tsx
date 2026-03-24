import { useState, useMemo } from "react";
import PhotoSortControls, {
  SortOption,
  ViewMode,
} from "../../common/PhotoSortControls";

// ==========================================
// 📝 Interface des Props
// ==========================================
interface PhotoGalleryProps {
  photos: any[]; // On pourrait typer plus strictement avec une interface Photo
  onEdit: (photo: any) => void;
  onDelete: (photoId: string) => void;
}

// ==========================================
// 🖼️ Composant PhotoGallery
// ==========================================
// Affiche la grille des photos existantes pour un événement donné.
// Permet de déclencher l'édition ou la suppression d'une photo.
export default function PhotoGallery({
  photos,
  onEdit,
  onDelete,
}: PhotoGalleryProps) {
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [displayMode, setDisplayMode] = useState<ViewMode>("grid");

  // Tri des photos
  const sortedPhotos = useMemo(() => {
    if (!photos || photos.length === 0) return [];

    return [...photos].sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (b._id || "").localeCompare(a._id || "");
        case "date-asc":
          return (a._id || "").localeCompare(b._id || "");
        case "name-asc":
          return (a.titre || "").localeCompare(b.titre || "");
        case "name-desc":
          return (b.titre || "").localeCompare(a.titre || "");
        default:
          return 0;
      }
    });
  }, [photos, sortBy]);

  return (
    <div className="mt-8 pt-6 border-t border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Photos de la galerie privée
        </h3>
      </div>

      {/* Liste des photos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-[#ffe992]">
            Photos existantes ({photos?.length || 0})
          </h4>

          {photos && photos.length > 0 && (
            <PhotoSortControls
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={displayMode}
              onViewModeChange={setDisplayMode}
              className=""
            />
          )}
        </div>

        {photos && photos.length > 0 ? (
          <div
            className={
              displayMode === "list"
                ? "space-y-3"
                : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            }
          >
            {sortedPhotos.map((photo) => (
              <div
                key={photo._id || photo.id}
                className={
                  displayMode === "list"
                    ? "bg-[#232336] p-3 rounded border border-white/10 group relative hover:border-[#ffe992]/30 transition-colors flex items-center gap-4"
                    : "bg-[#232336] p-2 rounded border border-white/10 group relative hover:border-[#ffe992]/30 transition-colors"
                }
              >
                {/* Image Thumbnail */}
                <div
                  className={
                    displayMode === "list"
                      ? "w-24 h-24 flex-shrink-0 overflow-hidden rounded bg-black/50"
                      : "aspect-square w-full mb-2 overflow-hidden rounded bg-black/50"
                  }
                >
                  <img
                    src={photo.src}
                    alt={photo.alt || "Photo galerie"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Infos Photo */}
                <div className={displayMode === "list" ? "flex-1 min-w-0" : ""}>
                  <p className="text-xs text-white font-bold truncate">
                    {photo.titre || "Sans titre"}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate mb-2">
                    {photo.description || "Aucune description"}
                  </p>
                </div>

                {/* Actions (Modifier / Supprimer) */}
                <div
                  className={
                    displayMode === "list"
                      ? "flex gap-1 flex-shrink-0"
                      : "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  }
                >
                  <button
                    type="button"
                    onClick={() => onEdit(photo)}
                    className="flex-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white text-xs py-1 rounded transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      let photoId: string;

                      if (typeof photo === "string") {
                        photoId = photo;
                      } else if (photo._id) {
                        photoId = photo._id;
                      } else if (photo.id) {
                        photoId = photo.id;
                      } else {
                        alert("Impossible de supprimer : ID de photo manquant");
                        console.error("Photo sans ID:", photo);
                        return;
                      }

                      if (window.confirm("Supprimer cette photo ?")) {
                        onDelete(photoId);
                      }
                    }}
                    className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-2 rounded transition-colors"
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-sm text-center py-8 border border-dashed border-white/10 rounded">
            Aucune photo pour le moment. Utilisez le formulaire ci-dessus pour
            en ajouter.
          </p>
        )}
      </div>
    </div>
  );
}
