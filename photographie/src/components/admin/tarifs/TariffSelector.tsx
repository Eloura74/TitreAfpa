// Importations des modules nécessaires pour le composant de sélection de tarifs
import { useState, useMemo, useEffect } from "react";
import {
  Folder,
  Image,
  Maximize,
  FileText,
  Framer,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  Search,
  ChevronsUpDown,
  Euro,
} from "lucide-react";
import { TariffConfig, TariffSize } from "../../../types/tarifConfig";

// --- INTERFACES ---
// Props du composant principal de sélection de tarifs et de gestion des états
interface TariffSelectorProps {
  config: TariffConfig;
  selectedIds: string[];
  onToggle: (ids: string[], checked: boolean) => void;
}

// --- COMPOSANT PRINCIPAL ---
// Affiche une interface de sélection de tarifs avec :
// - Header avec compteur et actions rapides
// - Recherche/filtre
// - Arborescence des tarifs avec cases à cocher
export default function TariffSelector({
  config,
  selectedIds,
  onToggle,
}: TariffSelectorProps) {
  // État pour la recherche
  const [searchQuery, setSearchQuery] = useState("");
  // État pour contrôler l'expansion globale de l'arbre
  const [allExpanded, setAllExpanded] = useState(true);

  // Collecte tous les IDs disponibles pour le compteur et les actions "tout sélectionner"
  const allIds = useMemo(() => {
    const ids: string[] = [];
    // Fonction récursive pour parcourir l'arborescence
    const traverse = (node: any) => {
      ids.push(node.id);
      // Parcours des finitions (Brillant, Mat, etc.)
      if (node.finishes) node.finishes.forEach((c: any) => traverse(c));
      // Parcours des tailles (10x15, A4, etc.)
      if (node.sizes) node.sizes.forEach((c: any) => traverse(c));
      // Parcours des papiers (Photo, Art, etc.)
      if (node.papers) node.papers.forEach((c: any) => traverse(c));
      // Parcours des cadres (Bois, Noir, etc.)
      if (node.frames) node.frames.forEach((c: any) => traverse(c));
    };
    // Parcourt chaque catégorie
    config.categories?.forEach((cat) => traverse(cat));
    return ids;
  }, [config]);

  // --- GESTION: Affichage si aucun tarif configuré ---
  if (!config.categories || config.categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Euro size={24} className="text-gray-500" />
        </div>
        <p className="text-sm text-gray-400 mb-2">Aucun tarif configuré</p>
        <a
          href="/admin/gestion-galerie"
          className="text-xs text-[#ffe992] hover:underline"
          onClick={(e) => {
            e.preventDefault();
            // Scroll vers l'onglet Tarifs
            const tabButtons = document.querySelectorAll("button");
            tabButtons.forEach((btn) => {
              if (btn.textContent?.includes("Tarifs")) {
                btn.click();
              }
            });
          }}
        >
          Configurer les tarifs →
        </a>
      </div>
    );
  }

  // Compte le nombre de tarifs sélectionnés
  const selectedCount = selectedIds.length;
  const totalCount = allIds.length;

  // --- HANDLERS ---
  // Gère la sélection/désélection de tous les tarifs
  const handleSelectAll = () => {
    // Si tous sont sélectionnés, on désélectionne tout
    if (selectedCount === totalCount) {
      onToggle(allIds, false);
    } else {
      // Sinon on sélectionne tout
      onToggle(allIds, true);
    }
  };

  // Filtre les catégories selon la recherche
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return config.categories;

    const query = searchQuery.toLowerCase();
    // Filtre récursivement l'arborescence
    const filterNode = (node: any): any | null => {
      // Vérifie si le nom du nœud correspond à la recherche
      const nameMatches = node.name?.toLowerCase().includes(query);

      // Filtre récursivement les enfants
      const filteredFinishes = node.finishes?.map(filterNode).filter(Boolean);
      const filteredSizes = node.sizes?.map(filterNode).filter(Boolean);
      const filteredPapers = node.papers?.map(filterNode).filter(Boolean);
      const filteredFrames = node.frames?.map(filterNode).filter(Boolean);

      // Vérifie si des enfants matchent
      const hasMatchingChildren =
        (filteredFinishes?.length ?? 0) > 0 ||
        (filteredSizes?.length ?? 0) > 0 ||
        (filteredPapers?.length ?? 0) > 0 ||
        (filteredFrames?.length ?? 0) > 0;

      // Retourne le nœud si lui ou ses enfants matchent
      if (nameMatches || hasMatchingChildren) {
        return {
          ...node,
          finishes: filteredFinishes,
          sizes: filteredSizes,
          papers: filteredPapers,
          frames: filteredFrames,
        };
      }
      return null;
    };

    return config.categories.map(filterNode).filter(Boolean);
  }, [config.categories, searchQuery]);

  return (
    <div className="space-y-4">
      {/* --- HEADER: Compteur et Actions Rapides --- */}
      <div className="flex flex-col gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
        {/* Compteur de sélection avec indicateur visuel */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                selectedCount > 0 ? "bg-[#ffe992]" : "bg-gray-600"
              }`}
            />
            <span className="text-sm font-medium text-white">
              {selectedCount}{" "}
              <span className="text-gray-400">/ {totalCount}</span>
            </span>
            <span className="text-xs text-gray-500">tarifs sélectionnés</span>
          </div>

          {/* Bouton pour tout déplier/replier */}
          <button
            type="button"
            onClick={() => setAllExpanded(!allExpanded)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
            title={allExpanded ? "Tout replier" : "Tout déplier"}
          >
            <ChevronsUpDown size={14} />
            {allExpanded ? "Replier" : "Déplier"}
          </button>
        </div>

        {/* Boutons d'action rapide */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              selectedCount === totalCount
                ? "bg-[#ffe992] text-black hover:bg-[#fff5c4]"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {selectedCount === totalCount ? (
              <>
                <Square size={14} />
                Tout désélectionner
              </>
            ) : (
              <>
                <CheckSquare size={14} />
                Tout sélectionner
              </>
            )}
          </button>
        </div>

        {/* Champ de recherche */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Rechercher un tarif..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-[#ffe992]/50 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* --- ARBORESCENCE DES TARIFS --- */}
      <div className="space-y-1">
        {filteredCategories?.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">
            Aucun résultat pour "{searchQuery}"
          </p>
        ) : (
          filteredCategories?.map((cat: any) => (
            <TariffTreeItem
              key={cat.id}
              node={cat}
              type="category"
              selectedIds={selectedIds}
              onToggle={onToggle}
              defaultExpanded={allExpanded}
              searchQuery={searchQuery}
            />
          ))
        )}
      </div>
    </div>
  );
}

// --- COMPOSANT RÉCURSIF: Affiche un élément de l'arbre des tarifs ---
// Gère l'affichage hiérarchique avec expansion/réduction
function TariffTreeItem({
  node,
  type,
  selectedIds,
  onToggle,
  defaultExpanded,
  searchQuery,
}: any) {
  // État d'expansion local, initialisé selon le prop defaultExpanded
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Met à jour l'état d'expansion quand le prop change (action globale)
  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  // Collecte récursivement tous les IDs descendants de ce nœud
  // Utilisé pour la sélection en cascade (parent → enfants)
  const descendantIds = useMemo(() => {
    const ids: string[] = [node.id];
    const traverse = (n: any) => {
      if (n.finishes)
        n.finishes.forEach((c: any) => {
          ids.push(c.id);
          traverse(c);
        });
      if (n.sizes)
        n.sizes.forEach((c: any) => {
          ids.push(c.id);
          traverse(c);
        });
      if (n.papers)
        n.papers.forEach((c: any) => {
          ids.push(c.id);
          traverse(c);
        });
      if (n.frames)
        n.frames.forEach((c: any) => {
          ids.push(c.id);
          traverse(c);
        });
    };
    traverse(node);
    return ids;
  }, [node]);

  // Vérifie si ce nœud est sélectionné
  const isChecked = selectedIds.includes(node.id);
  // Vérifie si ce nœud a des enfants (pour afficher la flèche d'expansion)
  const hasChildren = node.finishes || node.sizes || node.papers || node.frames;

  // Calcul de l'état "partiellement sélectionné" (indeterminate)
  // Affiche vert partiel si certains enfants sont sélectionnés mais pas tous
  const partiallySelected = useMemo(() => {
    if (!hasChildren) return false;
    const selectedDescendants = descendantIds.filter(
      (id) => selectedIds.includes(id) && id !== node.id
    );
    return (
      selectedDescendants.length > 0 &&
      selectedDescendants.length < descendantIds.length - 1
    );
  }, [hasChildren, descendantIds, selectedIds, node.id]);

  // Sélection de l'icône selon le type de nœud
  const Icon =
    type === "category"
      ? Folder
      : type === "finish"
      ? Image
      : type === "size"
      ? Maximize
      : type === "paper"
      ? FileText
      : Framer;

  // Couleur de l'icône selon le type
  const iconColor =
    type === "category"
      ? "text-[#ffe992]"
      : type === "finish"
      ? "text-blue-400"
      : type === "size"
      ? "text-green-400"
      : type === "paper"
      ? "text-purple-400"
      : "text-orange-400";

  // Gère le toggle de la checkbox
  const handleToggle = (e: any) => {
    e.stopPropagation();
    // Sélectionne/désélectionne ce nœud ET tous ses descendants
    onToggle(descendantIds, !isChecked);
  };

  // Vérifie si c'est un nœud "taille" (pour afficher le prix)
  const isSize =
    type === "size" && (node as TariffSize).basePrice !== undefined;

  // Met en surbrillance le texte recherché
  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-[#ffe992]/30 text-white rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="pl-1">
      {/* Ligne de l'élément */}
      <div
        className={`flex items-center gap-2 p-1.5 rounded-lg transition-all cursor-pointer group ${
          isChecked
            ? "bg-[#ffe992]/10 border border-[#ffe992]/20"
            : partiallySelected
            ? "bg-blue-500/5 border border-blue-500/10"
            : "hover:bg-white/5 border border-transparent"
        }`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Bouton d'expansion (flèche) */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5 text-gray-500 hover:text-white transition-colors"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Checkbox stylisée */}
        <div
          className={`relative w-4 h-4 rounded border-2 transition-all cursor-pointer ${
            isChecked
              ? "bg-[#ffe992] border-[#ffe992]"
              : partiallySelected
              ? "bg-blue-400/50 border-blue-400"
              : "border-gray-600 hover:border-gray-400"
          }`}
          onClick={handleToggle}
        >
          {isChecked && (
            <svg
              className="absolute inset-0 w-full h-full text-black"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {partiallySelected && !isChecked && (
            <div className="absolute inset-1 bg-blue-400 rounded-sm" />
          )}
        </div>

        {/* Icône du type */}
        <Icon size={14} className={iconColor} />

        {/* Nom de l'élément */}
        <span
          className={`text-sm flex-1 truncate ${
            isChecked ? "text-white font-medium" : "text-gray-300"
          }`}
        >
          {highlightText(node.name)}
        </span>

        {/* Badge prix pour les tailles */}
        {isSize && (
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-green-500/10 text-green-400 border border-green-500/20">
            {(node as TariffSize).basePrice}€
          </span>
        )}

        {/* Badge de sélection */}
        {isChecked && !hasChildren && (
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#ffe992]/20 text-[#ffe992] font-medium">
            ✓
          </span>
        )}
      </div>

      {/* Enfants (affichés si expanded) */}
      {expanded && hasChildren && (
        <div className="pl-4 ml-2 border-l border-white/10">
          {node.finishes?.map((child: any) => (
            <TariffTreeItem
              key={child.id}
              node={child}
              type="finish"
              selectedIds={selectedIds}
              onToggle={onToggle}
              defaultExpanded={defaultExpanded}
              searchQuery={searchQuery}
            />
          ))}
          {node.sizes?.map((child: any) => (
            <TariffTreeItem
              key={child.id}
              node={child}
              type="size"
              selectedIds={selectedIds}
              onToggle={onToggle}
              defaultExpanded={defaultExpanded}
              searchQuery={searchQuery}
            />
          ))}
          {node.papers?.map((child: any) => (
            <TariffTreeItem
              key={child.id}
              node={child}
              type="paper"
              selectedIds={selectedIds}
              onToggle={onToggle}
              defaultExpanded={defaultExpanded}
              searchQuery={searchQuery}
            />
          ))}
          {node.frames?.map((child: any) => (
            <TariffTreeItem
              key={child.id}
              node={child}
              type="frame"
              selectedIds={selectedIds}
              onToggle={onToggle}
              defaultExpanded={defaultExpanded}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}
