import { useState, useMemo, useEffect } from "react";
import {
  Folder,
  Image,
  Maximize,
  Layers,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  Search,
  ChevronsUpDown,
  Euro,
} from "lucide-react";
import { TariffConfigV2, TariffFormatV2 } from "../../../types/tarifConfigV2";

interface TariffSelectorV2Props {
  config: TariffConfigV2;
  selectedIds: string[];
  onToggle: (ids: string[], checked: boolean) => void;
}

export default function TariffSelectorV2({
  config,
  selectedIds,
  onToggle,
}: TariffSelectorV2Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [allExpanded, setAllExpanded] = useState(true);

  const allIds = useMemo(() => {
    const ids: string[] = [];
    const traverse = (node: any) => {
      ids.push(node.id);
      if (node.products) node.products.forEach((c: any) => traverse(c));
      if (node.supports) node.supports.forEach((c: any) => traverse(c));
      if (node.formats) node.formats.forEach((c: any) => traverse(c));
    };
    config.categories?.forEach((cat) => traverse(cat));
    return ids;
  }, [config]);

  const filteredCategories = useMemo(() => {
    if (!config.categories) return [];
    if (!searchQuery.trim()) return config.categories;

    const query = searchQuery.toLowerCase();
    const filterNode = (node: any): any | null => {
      const nameMatches = node.name?.toLowerCase().includes(query);

      const filteredProducts = node.products?.map(filterNode).filter(Boolean);
      const filteredSupports = node.supports?.map(filterNode).filter(Boolean);
      const filteredFormats = node.formats?.map(filterNode).filter(Boolean);

      const hasMatchingChildren =
        (filteredProducts?.length ?? 0) > 0 ||
        (filteredSupports?.length ?? 0) > 0 ||
        (filteredFormats?.length ?? 0) > 0;

      if (nameMatches || hasMatchingChildren) {
        return {
          ...node,
          products: filteredProducts,
          supports: filteredSupports,
          formats: filteredFormats,
        };
      }
      return null;
    };

    return config.categories.map(filterNode).filter(Boolean);
  }, [config.categories, searchQuery]);

  const selectedCount = selectedIds.length;
  const totalCount = allIds.length;

  if (!config.categories || config.categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Euro size={24} className="text-gray-500" />
        </div>
        <p className="text-sm text-gray-400 mb-2">Aucun tarif V2 configuré</p>
      </div>
    );
  }

  const handleSelectAll = () => {
    if (selectedCount === totalCount) {
      onToggle(allIds, false);
    } else {
      onToggle(allIds, true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
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
            <span className="text-xs text-gray-500">éléments sélectionnés</span>
          </div>

          <button
            type="button"
            onClick={() => setAllExpanded(!allExpanded)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <ChevronsUpDown size={14} />
            {allExpanded ? "Replier" : "Déplier"}
          </button>
        </div>

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

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Rechercher..."
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

      <div className="space-y-1">
        {filteredCategories?.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">
            Aucun résultat pour "{searchQuery}"
          </p>
        ) : (
          filteredCategories?.map((cat: any) => (
            <TariffTreeItemV2
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

function TariffTreeItemV2({
  node,
  type,
  selectedIds,
  onToggle,
  defaultExpanded,
  searchQuery,
}: any) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const descendantIds = useMemo(() => {
    const ids: string[] = [node.id];
    const traverse = (n: any) => {
      if (n.products)
        n.products.forEach((c: any) => {
          ids.push(c.id);
          traverse(c);
        });
      if (n.supports)
        n.supports.forEach((c: any) => {
          ids.push(c.id);
          traverse(c);
        });
      if (n.formats)
        n.formats.forEach((c: any) => {
          ids.push(c.id);
          traverse(c);
        });
    };
    traverse(node);
    return ids;
  }, [node]);

  const isChecked = selectedIds.includes(node.id);
  const hasChildren = node.products || node.supports || node.formats;

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

  const Icon =
    type === "category"
      ? Folder
      : type === "product"
      ? Image
      : type === "support"
      ? Layers
      : Maximize;

  const iconColor =
    type === "category"
      ? "text-[#ffe992]"
      : type === "product"
      ? "text-blue-400"
      : type === "support"
      ? "text-purple-400"
      : "text-green-400";

  const handleToggle = (e: any) => {
    e.stopPropagation();
    onToggle(descendantIds, !isChecked);
  };

  const isFormat =
    type === "format" && (node as TariffFormatV2).price !== undefined;

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

        <Icon size={14} className={iconColor} />

        <span
          className={`text-sm flex-1 truncate ${
            isChecked ? "text-white font-medium" : "text-gray-300"
          }`}
        >
          {highlightText(node.name)}
        </span>

        {isFormat && (
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-green-500/10 text-green-400 border border-green-500/20">
            {(node as TariffFormatV2).price}€
          </span>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="pl-4 ml-2 border-l border-white/10">
          {node.products?.map((child: any) => (
            <TariffTreeItemV2
              key={child.id}
              node={child}
              type="product"
              selectedIds={selectedIds}
              onToggle={onToggle}
              defaultExpanded={defaultExpanded}
              searchQuery={searchQuery}
            />
          ))}
          {node.supports?.map((child: any) => (
            <TariffTreeItemV2
              key={child.id}
              node={child}
              type="support"
              selectedIds={selectedIds}
              onToggle={onToggle}
              defaultExpanded={defaultExpanded}
              searchQuery={searchQuery}
            />
          ))}
          {node.formats?.map((child: any) => (
            <TariffTreeItemV2
              key={child.id}
              node={child}
              type="format"
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
