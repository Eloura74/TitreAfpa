import { useState, useEffect } from "react";
import {
  TariffConfig,
  TariffCategory,
  TariffFinish,
  TariffSize,
  TariffPaper,
  TariffFrame,
} from "../../../types/tarifConfig";
import { tariffService } from "../../../services/tariffService";
import {
  Save,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  Image,
  Maximize,
  FileText,
  Framer,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Mock initial data
const INITIAL_CONFIG: TariffConfig = {
  categories: [],
};

export default function TarifConfigurator() {
  const [config, setConfig] = useState<TariffConfig>(INITIAL_CONFIG);
  const [selectedNode, setSelectedNode] = useState<{
    type: "category" | "finish" | "size" | "paper" | "frame";
    path: string[]; // IDs path: [catId, finishId, sizeId...]
    data: any;
  } | null>(null);

  // Load from backend
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await tariffService.getTariffConfig();
        setConfig(data);
      } catch (error) {
        console.error("Failed to load tariff config", error);
      }
    };
    loadConfig();
  }, []);

  const saveConfig = async () => {
    try {
      await tariffService.saveTariffConfig(config);
      alert("Configuration sauvegardée sur le serveur !");
    } catch (error: any) {
      console.error("Failed to save config", error);
      const msg = error.response?.data?.message || error.message;
      const details = error.response?.data?.error
        ? JSON.stringify(error.response.data.error, null, 2)
        : "";
      alert(`Erreur lors de la sauvegarde: ${msg}\n${details}`);
    }
  };

  // Helper to update the tree immutably
  const updateTree = (newConfig: TariffConfig) => {
    setConfig(newConfig);
    // If the selected node was modified, we might need to update the selection reference
    // But since we store the path, we can re-resolve it if needed.
  };

  const addCategory = () => {
    const newCat: TariffCategory = {
      id: uuidv4(),
      name: "Nouvelle Catégorie",
      finishes: [],
    };
    updateTree({ ...config, categories: [...config.categories, newCat] });
  };

  const deleteCategory = (id: string) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    updateTree({
      ...config,
      categories: config.categories.filter((c) => c.id !== id),
    });
    setSelectedNode(null);
  };

  // ... (More CRUD helpers will be added)

  return (
    <div className="grid grid-cols-12 gap-6 h-[800px]">
      {/* Tree Navigator */}
      <div className="col-span-4 bg-[#0a0a10] rounded-xl border border-white/10 p-4 overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Structure
          </h3>
          <button
            onClick={addCategory}
            className="p-1.5 bg-[#ffe992] text-black rounded hover:bg-white transition"
            title="Ajouter une catégorie"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-2">
          {config.categories.map((cat) => (
            <CategoryNode
              key={cat.id}
              category={cat}
              selectedPath={selectedNode?.path || []}
              onSelect={(type: any, path: string[], data: any) =>
                setSelectedNode({ type, path, data })
              }
              onDelete={() => deleteCategory(cat.id)}
              config={config}
              updateTree={updateTree}
            />
          ))}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="col-span-8 bg-[#1a1a20] rounded-xl border border-white/10 p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
          <h3 className="text-xl font-serif text-[#ffe992]">
            {selectedNode
              ? `Édition : ${selectedNode.data.name}`
              : "Sélectionnez un élément"}
          </h3>
          <button
            onClick={saveConfig}
            className="flex items-center gap-2 px-4 py-2 bg-[#ffe992] text-black font-bold rounded hover:bg-white transition"
          >
            <Save size={18} /> Sauvegarder
          </button>
        </div>

        {selectedNode ? (
          <NodeEditor
            node={selectedNode}
            config={config}
            updateTree={updateTree}
          />
        ) : (
          <div className="text-center text-gray-500 mt-20">
            <Folder size={48} className="mx-auto mb-4 opacity-20" />
            <p>Sélectionnez un élément dans l'arbre pour le modifier.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components for the Tree (Recursive-ish)
function CategoryNode({
  category,
  selectedPath,
  onSelect,
  onDelete,
  config,
  updateTree,
}: any) {
  const [expanded, setExpanded] = useState(false);
  const isSelected =
    selectedPath[0] === category.id && selectedPath.length === 1;

  const addFinish = (e: any) => {
    e.stopPropagation();
    const newFinish: TariffFinish = {
      id: uuidv4(),
      name: "Nouvelle Finition",
      sizes: [],
    };
    const newCats = config.categories.map((c: any) =>
      c.id === category.id ? { ...c, finishes: [...c.finishes, newFinish] } : c
    );
    updateTree({ ...config, categories: newCats });
    setExpanded(true);
  };

  return (
    <div className="pl-2">
      <div
        className={`flex items-center gap-2 p-2 rounded cursor-pointer group ${
          isSelected
            ? "bg-[#ffe992]/20 text-[#ffe992]"
            : "text-gray-300 hover:bg-white/5"
        }`}
        onClick={() => onSelect("category", [category.id], category)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="p-1 hover:bg-white/10 rounded"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <Folder
          size={16}
          className={isSelected ? "text-[#ffe992]" : "text-gray-500"}
        />
        <span className="flex-1 truncate text-sm font-medium">
          {category.name}
        </span>

        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
          <button
            onClick={addFinish}
            className="p-1 hover:text-[#ffe992]"
            title="Ajouter Finition"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:text-red-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="pl-4 border-l border-white/5 ml-3 mt-1 space-y-1">
          {category.finishes.map((finish: any) => (
            <FinishNode
              key={finish.id}
              finish={finish}
              catId={category.id}
              selectedPath={selectedPath}
              onSelect={onSelect}
              config={config}
              updateTree={updateTree}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FinishNode({
  finish,
  catId,
  selectedPath,
  onSelect,
  config,
  updateTree,
}: any) {
  const [expanded, setExpanded] = useState(false);
  const isSelected = selectedPath[1] === finish.id && selectedPath.length === 2;

  const deleteFinish = () => {
    if (!confirm("Supprimer cette finition ?")) return;
    const newCats = config.categories.map((c: any) =>
      c.id === catId
        ? { ...c, finishes: c.finishes.filter((f: any) => f.id !== finish.id) }
        : c
    );
    updateTree({ ...config, categories: newCats });
  };

  const addSize = (e: any) => {
    e.stopPropagation();
    const newSize: TariffSize = {
      id: uuidv4(),
      name: "Nouvelle Taille",
      basePrice: 0,
      papers: [],
      frames: [],
    };
    const newCats = config.categories.map((c: any) =>
      c.id === catId
        ? {
            ...c,
            finishes: c.finishes.map((f: any) =>
              f.id === finish.id ? { ...f, sizes: [...f.sizes, newSize] } : f
            ),
          }
        : c
    );
    updateTree({ ...config, categories: newCats });
    setExpanded(true);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 p-2 rounded cursor-pointer group ${
          isSelected
            ? "bg-[#ffe992]/20 text-[#ffe992]"
            : "text-gray-300 hover:bg-white/5"
        }`}
        onClick={() => onSelect("finish", [catId, finish.id], finish)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="p-1 hover:bg-white/10 rounded"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <Image
          size={16}
          className={isSelected ? "text-[#ffe992]" : "text-gray-500"}
        />
        <span className="flex-1 truncate text-sm">{finish.name}</span>

        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
          <button
            onClick={addSize}
            className="p-1 hover:text-[#ffe992]"
            title="Ajouter Taille"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteFinish();
            }}
            className="p-1 hover:text-red-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="pl-4 border-l border-white/5 ml-3 mt-1 space-y-1">
          {finish.sizes.map((size: any) => (
            <SizeNode
              key={size.id}
              size={size}
              catId={catId}
              finishId={finish.id}
              selectedPath={selectedPath}
              onSelect={onSelect}
              config={config}
              updateTree={updateTree}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SizeNode({
  size,
  catId,
  finishId,
  selectedPath,
  onSelect,
  config,
  updateTree,
}: any) {
  const [expanded, setExpanded] = useState(false);
  const isSelected = selectedPath[2] === size.id && selectedPath.length === 3;

  const deleteSize = () => {
    if (!confirm("Supprimer cette taille ?")) return;
    const newCats = config.categories.map((c: any) =>
      c.id === catId
        ? {
            ...c,
            finishes: c.finishes.map((f: any) =>
              f.id === finishId
                ? { ...f, sizes: f.sizes.filter((s: any) => s.id !== size.id) }
                : f
            ),
          }
        : c
    );
    updateTree({ ...config, categories: newCats });
  };

  const addPaper = (e: any) => {
    e.stopPropagation();
    const newPaper: TariffPaper = {
      id: uuidv4(),
      name: "Nouveau Papier",
      priceModifier: 0,
    };
    const newCats = config.categories.map((c: any) =>
      c.id === catId
        ? {
            ...c,
            finishes: c.finishes.map((f: any) =>
              f.id === finishId
                ? {
                    ...f,
                    sizes: f.sizes.map((s: any) =>
                      s.id === size.id
                        ? { ...s, papers: [...s.papers, newPaper] }
                        : s
                    ),
                  }
                : f
            ),
          }
        : c
    );
    updateTree({ ...config, categories: newCats });
    setExpanded(true);
  };

  const addFrame = (e: any) => {
    e.stopPropagation();
    const newFrame: TariffFrame = {
      id: uuidv4(),
      name: "Nouveau Cadre",
      priceModifier: 0,
    };
    const newCats = config.categories.map((c: any) =>
      c.id === catId
        ? {
            ...c,
            finishes: c.finishes.map((f: any) =>
              f.id === finishId
                ? {
                    ...f,
                    sizes: f.sizes.map((s: any) =>
                      s.id === size.id
                        ? { ...s, frames: [...s.frames, newFrame] }
                        : s
                    ),
                  }
                : f
            ),
          }
        : c
    );
    updateTree({ ...config, categories: newCats });
    setExpanded(true);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 p-2 rounded cursor-pointer group ${
          isSelected
            ? "bg-[#ffe992]/20 text-[#ffe992]"
            : "text-gray-300 hover:bg-white/5"
        }`}
        onClick={() => onSelect("size", [catId, finishId, size.id], size)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="p-1 hover:bg-white/10 rounded"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <Maximize
          size={16}
          className={isSelected ? "text-[#ffe992]" : "text-gray-500"}
        />
        <span className="flex-1 truncate text-sm">{size.name}</span>

        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
          <button
            onClick={addPaper}
            className="p-1 hover:text-[#ffe992]"
            title="Ajouter Papier"
          >
            <FileText size={14} />
          </button>
          <button
            onClick={addFrame}
            className="p-1 hover:text-[#ffe992]"
            title="Ajouter Cadre"
          >
            <Framer size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteSize();
            }}
            className="p-1 hover:text-red-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="pl-4 border-l border-white/5 ml-3 mt-1 space-y-1">
          {size.papers.map((paper: any) => (
            <LeafNode
              key={paper.id}
              item={paper}
              type="paper"
              path={[catId, finishId, size.id, paper.id]}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onDelete={() => {
                const newCats = config.categories.map((c: any) =>
                  c.id === catId
                    ? {
                        ...c,
                        finishes: c.finishes.map((f: any) =>
                          f.id === finishId
                            ? {
                                ...f,
                                sizes: f.sizes.map((s: any) =>
                                  s.id === size.id
                                    ? {
                                        ...s,
                                        papers: s.papers.filter(
                                          (p: any) => p.id !== paper.id
                                        ),
                                      }
                                    : s
                                ),
                              }
                            : f
                        ),
                      }
                    : c
                );
                updateTree({ ...config, categories: newCats });
              }}
            />
          ))}
          {size.frames.map((frame: any) => (
            <LeafNode
              key={frame.id}
              item={frame}
              type="frame"
              path={[catId, finishId, size.id, frame.id]}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onDelete={() => {
                const newCats = config.categories.map((c: any) =>
                  c.id === catId
                    ? {
                        ...c,
                        finishes: c.finishes.map((f: any) =>
                          f.id === finishId
                            ? {
                                ...f,
                                sizes: f.sizes.map((s: any) =>
                                  s.id === size.id
                                    ? {
                                        ...s,
                                        frames: s.frames.filter(
                                          (fr: any) => fr.id !== frame.id
                                        ),
                                      }
                                    : s
                                ),
                              }
                            : f
                        ),
                      }
                    : c
                );
                updateTree({ ...config, categories: newCats });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LeafNode({ item, type, path, selectedPath, onSelect, onDelete }: any) {
  const isSelected =
    selectedPath[selectedPath.length - 1] === item.id &&
    selectedPath.length === path.length;
  const Icon = type === "paper" ? FileText : Framer;

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded cursor-pointer group ${
        isSelected
          ? "bg-[#ffe992]/20 text-[#ffe992]"
          : "text-gray-300 hover:bg-white/5"
      }`}
      onClick={() => onSelect(type, path, item)}
    >
      <div className="w-6" /> {/* Indent for leaf */}
      <Icon
        size={14}
        className={isSelected ? "text-[#ffe992]" : "text-gray-500"}
      />
      <span className="flex-1 truncate text-xs">{item.name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// Editor Component
function NodeEditor({ node, config, updateTree }: any) {
  const { type, path, data } = node;
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (e: any) => {
    const { name, value, type: inputType } = e.target;
    setFormData({
      ...formData,
      [name]: inputType === "number" ? parseFloat(value) : value,
    });
  };

  const handleSave = () => {
    // Deep update based on path
    const newConfig = JSON.parse(JSON.stringify(config)); // Deep clone

    // Navigate to parent of target
    // Path: [catId, finishId, sizeId, leafId]
    const cat = newConfig.categories.find((c: any) => c.id === path[0]);
    if (type === "category") {
      cat.name = formData.name;
    } else {
      const finish = cat.finishes.find((f: any) => f.id === path[1]);
      if (type === "finish") {
        finish.name = formData.name;
      } else {
        const size = finish.sizes.find((s: any) => s.id === path[2]);
        if (type === "size") {
          size.name = formData.name;
          size.basePrice = formData.basePrice;
        } else {
          // Leaf
          const list = type === "paper" ? size.papers : size.frames;
          const item = list.find((i: any) => i.id === path[3]);
          item.name = formData.name;
          item.priceModifier = formData.priceModifier;
        }
      }
    }

    updateTree(newConfig);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Nom
        </label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleSave}
          className="w-full bg-[#0a0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#ffe992] outline-none"
        />
      </div>

      {type === "size" && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Prix de base (€)
          </label>
          <input
            type="number"
            name="basePrice"
            value={formData.basePrice || 0}
            onChange={handleChange}
            onBlur={handleSave}
            className="w-full bg-[#0a0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#ffe992] outline-none"
          />
        </div>
      )}

      {(type === "paper" || type === "frame") && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Supplément Prix (€)
          </label>
          <input
            type="number"
            name="priceModifier"
            value={formData.priceModifier || 0}
            onChange={handleChange}
            onBlur={handleSave}
            className="w-full bg-[#0a0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#ffe992] outline-none"
          />
          <p className="text-xs text-gray-500">
            S'ajoute au prix de base de la taille.
          </p>
        </div>
      )}

      <div className="pt-4 border-t border-white/5">
        <p className="text-xs text-gray-500">
          ID: <span className="font-mono text-gray-600">{formData.id}</span>
        </p>
      </div>
    </div>
  );
}
