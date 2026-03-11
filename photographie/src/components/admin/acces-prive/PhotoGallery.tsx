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
  return (
    <div className="mt-8 pt-6 border-t border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">
        Photos de la galerie privée
      </h3>

      {/* Liste des photos */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-[#ffe992]">
          Photos existantes ({photos?.length || 0})
        </h4>

        {photos && photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div
                key={photo._id || photo.id}
                className="bg-[#232336] p-2 rounded border border-white/10 group relative hover:border-[#ffe992]/30 transition-colors"
              >
                {/* Image Thumbnail */}
                <div className="aspect-square w-full mb-2 overflow-hidden rounded bg-black/50">
                  <img
                    src={photo.src}
                    alt={photo.alt || "Photo galerie"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Infos Photo */}
                <p className="text-xs text-white font-bold truncate">
                  {photo.titre || "Sans titre"}
                </p>
                <p className="text-[10px] text-gray-400 truncate mb-2">
                  {photo.description || "Aucune description"}
                </p>

                {/* Actions (Modifier / Supprimer) */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
