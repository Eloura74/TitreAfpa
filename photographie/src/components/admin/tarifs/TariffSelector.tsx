import { useState, useMemo } from "react";
import {
  Folder,
  Image,
  Maximize,
  FileText,
  Framer,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { TariffConfig } from "../../../types/tarifConfig";

interface TariffSelectorProps {
  config: TariffConfig;
  selectedIds: string[];
  onToggle: (ids: string[], checked: boolean) => void;
}

export default function TariffSelector({
  config,
  selectedIds,
  onToggle,
}: TariffSelectorProps) {
  if (!config.categories || config.categories.length === 0) {
    return <p className="text-xs text-gray-500 p-2">Aucun tarif configuré.</p>;
  }

  return (
    <div className="space-y-1">
      {config.categories.map((cat) => (
        <TariffTreeItem
          key={cat.id}
          node={cat}
          type="category"
          selectedIds={selectedIds}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

// Recursive Tree Item Component
function TariffTreeItem({ node, type, selectedIds, onToggle }: any) {
  const [expanded, setExpanded] = useState(false);

  // Collect all descendant IDs of this node
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

  const isChecked = selectedIds.includes(node.id);
  const hasChildren = node.finishes || node.sizes || node.papers || node.frames;

  // Determine icon
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

  const handleToggle = (e: any) => {
    e.stopPropagation();
    onToggle(descendantIds, !isChecked);
  };

  return (
    <div className="pl-2">
      <div className="flex items-center gap-2 p-1 rounded hover:bg-white/5 group">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 text-gray-500 hover:text-white"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <div className="w-4" />
        )}

        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleToggle}
          className="rounded border-gray-600 bg-black/50 text-[#ffe992] focus:ring-[#ffe992]"
        />

        <Icon size={14} className="text-gray-500" />
        <span className="text-xs text-gray-300 flex-1 truncate">
          {node.name}
        </span>
      </div>

      {expanded && hasChildren && (
        <div className="pl-4 border-l border-white/5 ml-2">
          {node.finishes?.map((child: any) => (
            <TariffTreeItem
              key={child.id}
              node={child}
              type="finish"
              selectedIds={selectedIds}
              onToggle={onToggle}
            />
          ))}
          {node.sizes?.map((child: any) => (
            <TariffTreeItem
              key={child.id}
              node={child}
              type="size"
              selectedIds={selectedIds}
              onToggle={onToggle}
            />
          ))}
          {node.papers?.map((child: any) => (
            <TariffTreeItem
              key={child.id}
              node={child}
              type="paper"
              selectedIds={selectedIds}
              onToggle={onToggle}
            />
          ))}
          {node.frames?.map((child: any) => (
            <TariffTreeItem
              key={child.id}
              node={child}
              type="frame"
              selectedIds={selectedIds}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
