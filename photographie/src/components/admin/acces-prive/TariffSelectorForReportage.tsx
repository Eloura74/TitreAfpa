import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Search,
} from "lucide-react";
import { TariffConfigV2, TariffFormatV2 } from "../../../types/tarifConfigV2";

interface TariffSelectorForReportageProps {
  config: TariffConfigV2;
  selectedIds: string[];
  onToggle: (ids: string[], checked: boolean) => void;
}

export default function TariffSelectorForReportage({
  config,
  selectedIds,
  onToggle,
}: TariffSelectorForReportageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [allExpanded, setAllExpanded] = useState(true);

  const handleSelectAll = () => {
    const allIds: string[] = [];
    config.categories.forEach((cat) => {
      cat.products.forEach((prod) => {
        prod.supports.forEach((supp) => {
          supp.formats.forEach((fmt) => {
            allIds.push(fmt.id);
          });
        });
      });
    });
    onToggle(allIds, true);
  };

  const handleDeselectAll = () => {
    onToggle([], false);
  };

  const toggleFormat = (formatId: string) => {
    const isSelected = selectedIds.includes(formatId);
    if (isSelected) {
      onToggle(
        selectedIds.filter((id) => id !== formatId),
        false
      );
    } else {
      onToggle([...selectedIds, formatId], true);
    }
  };

  const filterFormats = (formats: TariffFormatV2[]) => {
    if (!searchQuery) return formats;
    return formats.filter((fmt) =>
      fmt.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs px-3 py-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors border border-green-500/30"
          >
            Tout sélectionner
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="text-xs px-3 py-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors border border-red-500/30"
          >
            Tout désélectionner
          </button>
        </div>
        <span className="text-xs text-gray-400">
          {selectedIds.length} format(s) sélectionné(s)
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input
          type="text"
          placeholder="Rechercher un format..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#232336] border border-white/10 rounded pl-10 pr-4 py-2 text-white text-sm placeholder-gray-500 focus:border-[#ffe992] outline-none transition-colors"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAllExpanded(!allExpanded)}
          className="text-xs text-gray-400 hover:text-[#ffe992] transition-colors flex items-center gap-1"
        >
          {allExpanded ? (
            <>
              <ChevronUp size={14} />
              Tout réduire
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              Tout développer
            </>
          )}
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {config.categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            selectedIds={selectedIds}
            toggleFormat={toggleFormat}
            filterFormats={filterFormats}
            allExpanded={allExpanded}
          />
        ))}
      </div>
    </div>
  );
}

interface CategorySectionProps {
  category: any;
  selectedIds: string[];
  toggleFormat: (id: string) => void;
  filterFormats: (formats: TariffFormatV2[]) => TariffFormatV2[];
  allExpanded: boolean;
}

function CategorySection({
  category,
  selectedIds,
  toggleFormat,
  filterFormats,
  allExpanded,
}: CategorySectionProps) {
  const [expanded, setExpanded] = useState(allExpanded);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-[#232336]/50">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold text-white text-sm">{category.name}</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="p-3 space-y-3 border-t border-white/10">
          {category.products.map((product: any) => (
            <div key={product.id} className="space-y-2">
              <div className="text-xs font-medium text-[#ffe992]">{product.name}</div>
              {product.supports.map((support: any) => {
                const filteredFormats = filterFormats(support.formats);
                if (filteredFormats.length === 0) return null;

                return (
                  <div key={support.id} className="ml-3 space-y-1">
                    <div className="text-xs text-gray-400">{support.name}</div>
                    <div className="grid grid-cols-2 gap-2 ml-3">
                      {filteredFormats.map((format) => {
                        const isSelected = selectedIds.includes(format.id);
                        return (
                          <button
                            key={format.id}
                            type="button"
                            onClick={() => toggleFormat(format.id)}
                            className={`flex items-center gap-2 p-2 rounded text-xs transition-all ${
                              isSelected
                                ? "bg-[#ffe992]/20 border border-[#ffe992]/50 text-white"
                                : "bg-black/20 border border-white/5 text-gray-400 hover:bg-white/5"
                            }`}
                          >
                            {isSelected ? (
                              <CheckSquare size={14} className="text-[#ffe992]" />
                            ) : (
                              <Square size={14} />
                            )}
                            <span className="flex-1 text-left">{format.name}</span>
                            <span className="text-[10px] opacity-70">{format.price}€</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
