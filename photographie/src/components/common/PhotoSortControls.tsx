import { Grid, List, ArrowUpDown } from "lucide-react";

export type SortOption = "date-desc" | "date-asc" | "name-asc" | "name-desc";
export type ViewMode = "grid" | "list";

interface PhotoSortControlsProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export default function PhotoSortControls({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  className = "",
}: PhotoSortControlsProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Tri */}
      <div className="flex items-center gap-2">
        <ArrowUpDown size={16} className="text-gray-400" />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#ffe992] transition-colors outline-none cursor-pointer"
        >
          <option value="date-desc">Date (récent → ancien)</option>
          <option value="date-asc">Date (ancien → récent)</option>
          <option value="name-asc">Nom (A → Z)</option>
          <option value="name-desc">Nom (Z → A)</option>
        </select>
      </div>

      {/* Toggle Affichage */}
      <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg p-1">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`p-2 rounded transition-all ${
            viewMode === "grid"
              ? "bg-[#ffe992] text-black"
              : "text-gray-400 hover:text-white"
          }`}
          title="Affichage grille"
        >
          <Grid size={18} />
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={`p-2 rounded transition-all ${
            viewMode === "list"
              ? "bg-[#ffe992] text-black"
              : "text-gray-400 hover:text-white"
          }`}
          title="Affichage liste"
        >
          <List size={18} />
        </button>
      </div>
    </div>
  );
}
