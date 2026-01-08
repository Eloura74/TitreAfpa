import { useState } from "react";
import { Evenement } from "../../../types/evenement";
import { ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";

// ==========================================
// 📝 Interface des Props
// ==========================================
interface PrivateAccessListProps {
  evenements: Evenement[];
  loading: boolean;
  selectedId: string | null; // Pour mettre en surbrillance l'élément sélectionné
  onEdit: (event: Evenement) => void;
  onDelete: (id: string) => void;
}

// ==========================================
// 📋 Composant PrivateAccessList
// ==========================================
// Affiche la liste latérale des événements privés existants.
// Permet de sélectionner un événement pour l'éditer ou de le supprimer.
export default function PrivateAccessList({
  evenements,
  loading,
  selectedId,
  onEdit,
  onDelete,
}: PrivateAccessListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };
  return (
    <div className="border-l border-white/10 pl-8 h-full flex flex-col">
      <h3 className="text-xl font-semibold text-white mb-4 sticky top-0 bg-[#181824] z-10 py-2">
        Accès Privés Existants
      </h3>

      {loading && !selectedId ? (
        <div className="text-center text-gray-400 py-8 animate-pulse">
          Chargement des accès...
        </div>
      ) : evenements.length === 0 ? (
        <div className="text-center text-gray-500 py-8 border border-dashed border-white/10 rounded">
          Aucun accès privé trouvé.
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {evenements.map((event) => {
            const isSelected = (event.id || event._id) === selectedId;
            return (
              <div
                key={event.id || event._id}
                className={`p-4 rounded border transition-all duration-200 group relative
                  ${
                    isSelected
                      ? "bg-[#232336] border-[#ffe992] shadow-[0_0_10px_rgba(255,233,146,0.1)]"
                      : "bg-[#232336]/50 border-white/5 hover:border-[#ffe992]/30 hover:bg-[#232336]"
                  }
                `}
              >
                {/* En-tête Card */}
                <div className="flex justify-between items-start mb-2">
                  <h4
                    className={`font-bold ${
                      isSelected
                        ? "text-[#ffe992]"
                        : "text-gray-200 group-hover:text-[#ffe992]"
                    }`}
                  >
                    {event.titre}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/20">
                    Privé
                  </span>
                </div>

                {/* Bouton Expand */}
                <span className="absolute top-3 right-28 text-gray-400 hover:text-white transition-colors">
                  Voir Images
                </span>
                <button
                  onClick={(e) => toggleExpand(event.id || event._id || "", e)}
                  className="absolute top-3 right-18 text-gray-400 hover:text-white transition-colors"
                >
                  {expandedId === (event.id || event._id) ? (
                    <ChevronUp size={26} />
                  ) : (
                    <ChevronDown size={26} />
                  )}
                </button>

                {/* Infos Client */}
                <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                  {typeof event.client === "object" && event.client?.email
                    ? event.client.email
                    : event.clientEmail || "Aucun client assigné"}
                </p>

                {/* Date */}
                <p className="text-xs text-gray-500 mb-3 ml-3.5">
                  {new Date(event.dateDebut).toLocaleDateString()}
                  {" - "}
                  {new Date(event.dateFin).toLocaleDateString()}
                </p>

                {/* Thumbnails Grid */}
                {expandedId === (event.id || event._id) && (
                  <div className="mt-3 mb-3 grid grid-cols-4 gap-2 bg-black/20 p-2 rounded">
                    {event.photos && event.photos.length > 0 ? (
                      event.photos.map((photo: any, idx: number) => (
                        <div
                          key={idx}
                          className="aspect-square rounded overflow-hidden border border-white/5"
                        >
                          <img
                            src={photo.src || photo}
                            alt="miniature"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-4 text-center text-xs text-gray-500 py-2 flex items-center justify-center gap-2">
                        <ImageIcon size={12} /> Aucune photo
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div
                  className={`flex justify-end gap-2 mt-3 transition-opacity duration-200 ${
                    isSelected
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <button
                    className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black text-xs px-3 py-1.5 rounded transition-colors font-medium"
                    onClick={() => onEdit(event)}
                  >
                    Gérer
                  </button>
                  <button
                    className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs px-3 py-1.5 rounded transition-colors font-medium"
                    onClick={(e) => {
                      e.stopPropagation(); // Évite de déclencher le onEdit si on clique sur supprimer
                      const idToDelete = event.id || event._id;
                      if (idToDelete) onDelete(idToDelete);
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
