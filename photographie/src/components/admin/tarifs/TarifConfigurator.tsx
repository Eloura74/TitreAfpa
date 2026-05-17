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
  Settings,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";

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
        // Vérification de sécurité : s'assurer que categories existe
        if (data && Array.isArray(data.categories)) {
          setConfig(data);
        } else {
          console.warn(
            "Invalid tariff config received, using default empty config",
          );
          setConfig(INITIAL_CONFIG);
        }
      } catch (error) {
        console.error("Failed to load tariff config", error);
        setConfig(INITIAL_CONFIG);
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 h-auto md:h-[calc(100vh-150px)] min-h-[500px] md:min-h-[800px]">
      {/* Tree Navigator */}
      <div className="col-span-1 md:col-span-7 bg-[#121218] rounded-xl md:rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-xl h-[400px] md:h-auto">
        <div className="p-4 md:p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Settings size={20} className="text-[#ffe992]" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Structure Tarifaire
            </h3>
          </div>
          <button
            onClick={addCategory}
            className="p-2.5 bg-[#ffe992] text-black rounded-lg hover:bg-[#d6c487] transition-all shadow-lg shadow-[#ffe992]/20 flex items-center gap-2 font-medium text-sm"
            title="Ajouter une catégorie"
          >
            <Plus size={18} />
            <span>Nouvelle Catégorie</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4">
          {config.categories.length === 0 ? (
            <div className="text-center text-gray-500 mt-20 p-4">
              <Folder size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">Aucune catégorie configurée.</p>
              <p className="text-sm mt-2 text-gray-600">
                Cliquez sur le bouton pour commencer.
              </p>
            </div>
          ) : (
            config.categories.map((cat) => (
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
            ))
          )}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="col-span-1 md:col-span-5 bg-[#121218] rounded-xl md:rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-xl relative h-[400px] md:h-auto">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-serif text-[#ffe992] mb-1">
              {selectedNode ? "Édition" : "Configuration"}
            </h3>
            {selectedNode && (
              <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-wider">
                <span>{selectedNode.type}</span>
              </div>
            )}
          </div>

          <button
            onClick={saveConfig}
            className="flex items-center gap-2 px-4 py-2 bg-[#ffe992] text-black font-bold rounded-lg hover:bg-[#d6c487] transition-all shadow-lg shadow-[#ffe992]/20 text-sm"
          >
            <Save size={16} /> Sauvegarder
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gradient-to-b from-[#121218] to-[#0a0a10]">
          {selectedNode ? (
            <NodeEditor
              node={selectedNode}
              config={config}
              updateTree={updateTree}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
              <Settings size={48} className="mb-4 text-[#ffe992]" />
              <p className="text-base font-medium">Sélectionnez un élément</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Tree Components ---

function CategoryNode({
  category,
  selectedPath,
  onSelect,
  onDelete,
  config,
  updateTree,
}: any) {
  const [expanded, setExpanded] = useState(true);
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
      c.id === category.id ? { ...c, finishes: [...c.finishes, newFinish] } : c,
    );
    updateTree({ ...config, categories: newCats });
    setExpanded(true);
  };

  return (
    <div className="select-none mb-4">
      <div
        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer group transition-all duration-200 border-l-[6px] ${
          isSelected
            ? "bg-[#ffe992]/10 border-l-[#ffe992] border-y border-r border-y-[#ffe992]/30 border-r-[#ffe992]/30 shadow-[0_0_20px_rgba(255,233,146,0.05)]"
            : "bg-white/5 border-l-white/20 border-y border-r border-transparent hover:bg-white/10 hover:border-l-white/40"
        }`}
        onClick={() => onSelect("category", [category.id], category)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            isSelected
              ? "text-[#ffe992] hover:bg-[#ffe992]/20"
              : "text-gray-500 hover:bg-white/10 hover:text-white"
          }`}
        >
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>

        <div
          className={`p-2.5 rounded-xl ${
            isSelected ? "bg-[#ffe992] text-black" : "bg-white/10 text-gray-400"
          }`}
        >
          <Folder size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 bg-black/40 px-2 py-1 rounded-md border border-white/5">
              CATÉGORIE
            </span>
            <span
              className={`truncate text-lg font-bold ${
                isSelected ? "text-[#ffe992]" : "text-gray-200"
              }`}
            >
              {category.name}
            </span>
          </div>
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
          <button
            onClick={addFinish}
            className="p-2 hover:bg-[#ffe992] hover:text-black rounded-lg text-gray-400 transition-colors"
            title="Ajouter Finition"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-gray-400 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pl-6 ml-5 border-l-2 border-white/5 space-y-2 overflow-hidden pt-2"
          >
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
            {category.finishes.length === 0 && (
              <div className="py-4 pl-6 text-sm text-gray-600 italic">
                Aucune finition configurée
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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
        : c,
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
              f.id === finish.id ? { ...f, sizes: [...f.sizes, newSize] } : f,
            ),
          }
        : c,
    );
    updateTree({ ...config, categories: newCats });
    setExpanded(true);
  };

  return (
    <div className="mt-2 relative">
      {/* Horizontal guide line */}
      <div className="absolute top-6 -left-5 w-5 h-[2px] bg-white/5" />

      <div
        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all duration-200 border ${
          isSelected
            ? "bg-[#ffe992]/10 border-[#ffe992]/30"
            : "border-transparent hover:bg-white/5 hover:border-white/5"
        }`}
        onClick={() => onSelect("finish", [catId, finish.id], finish)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className={`p-1 rounded-md transition-colors ${
            isSelected
              ? "text-[#ffe992] hover:bg-[#ffe992]/20"
              : "text-gray-500 hover:bg-white/10 hover:text-white"
          }`}
        >
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        <Image
          size={18}
          className={isSelected ? "text-[#ffe992]" : "text-gray-500"}
        />

        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600 border border-gray-700 px-1.5 py-0.5 rounded bg-black/20">
            FINITION
          </span>
          <span
            className={`truncate text-base ${
              isSelected ? "text-[#ffe992] font-medium" : "text-gray-300"
            }`}
          >
            {finish.name}
          </span>
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
          <button
            onClick={addSize}
            className="p-1.5 hover:bg-[#ffe992] hover:text-black rounded text-gray-400 transition-colors"
            title="Ajouter Taille"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteFinish();
            }}
            className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded text-gray-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pl-6 ml-3 border-l-2 border-white/5 space-y-2 overflow-hidden pt-2"
          >
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
            {finish.sizes.length === 0 && (
              <div className="py-2 pl-4 text-xs text-gray-600 italic">
                Aucune taille configurée
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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
                : f,
            ),
          }
        : c,
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
                        : s,
                    ),
                  }
                : f,
            ),
          }
        : c,
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
                        : s,
                    ),
                  }
                : f,
            ),
          }
        : c,
    );
    updateTree({ ...config, categories: newCats });
    setExpanded(true);
  };

  return (
    <div className="mt-2 relative">
      {/* Horizontal guide line */}
      <div className="absolute top-6 -left-5 w-5 h-[2px] bg-white/5" />

      <div
        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all duration-200 border ${
          isSelected
            ? "bg-[#ffe992]/10 border-[#ffe992]/30"
            : "border-transparent hover:bg-white/5 hover:border-white/5"
        }`}
        onClick={() => onSelect("size", [catId, finishId, size.id], size)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className={`p-1 rounded-md transition-colors ${
            isSelected
              ? "text-[#ffe992] hover:bg-[#ffe992]/20"
              : "text-gray-500 hover:bg-white/10 hover:text-white"
          }`}
        >
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        <Maximize
          size={18}
          className={isSelected ? "text-[#ffe992]" : "text-gray-500"}
        />

        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600 border border-gray-700 px-1.5 py-0.5 rounded bg-black/20">
            TAILLE
          </span>
          <span
            className={`truncate text-base ${
              isSelected ? "text-[#ffe992] font-medium" : "text-gray-400"
            }`}
          >
            {size.name}
          </span>
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
          <button
            onClick={addPaper}
            className="p-1.5 hover:bg-[#ffe992] hover:text-black rounded text-gray-400 transition-colors"
            title="Ajouter Papier"
          >
            <FileText size={16} />
          </button>
          <button
            onClick={addFrame}
            className="p-1.5 hover:bg-[#ffe992] hover:text-black rounded text-gray-400 transition-colors"
            title="Ajouter Cadre"
          >
            <Framer size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteSize();
            }}
            className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded text-gray-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pl-6 ml-3 border-l-2 border-white/5 space-y-2 overflow-hidden pt-2"
          >
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
                                            (p: any) => p.id !== paper.id,
                                          ),
                                        }
                                      : s,
                                  ),
                                }
                              : f,
                          ),
                        }
                      : c,
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
                                            (fr: any) => fr.id !== frame.id,
                                          ),
                                        }
                                      : s,
                                  ),
                                }
                              : f,
                          ),
                        }
                      : c,
                  );
                  updateTree({ ...config, categories: newCats });
                }}
              />
            ))}
            {size.papers.length === 0 && size.frames.length === 0 && (
              <div className="py-2 pl-4 text-xs text-gray-600 italic">
                Aucune option configurée
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LeafNode({ item, type, path, selectedPath, onSelect, onDelete }: any) {
  const isSelected =
    selectedPath[selectedPath.length - 1] === item.id &&
    selectedPath.length === path.length;
  const Icon = type === "paper" ? FileText : Framer;

  return (
    <div className="mt-2 relative">
      {/* Horizontal guide line */}
      <div className="absolute top-1/2 -left-5 w-5 h-[2px] bg-white/5" />

      <div
        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all duration-200 border ${
          isSelected
            ? "bg-[#ffe992]/10 border-[#ffe992]/30"
            : "border-transparent hover:bg-white/5 hover:border-white/5"
        }`}
        onClick={() => onSelect(type, path, item)}
      >
        <div className="w-4" /> {/* Indent for leaf */}
        <Icon
          size={18}
          className={isSelected ? "text-[#ffe992]" : "text-gray-500"}
        />
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600 border border-gray-700 px-1.5 py-0.5 rounded bg-black/20">
            {type === "paper" ? "PAPIER" : "CADRE"}
          </span>
          <span
            className={`truncate text-base ${
              isSelected ? "text-[#ffe992] font-medium" : "text-gray-400"
            }`}
          >
            {item.name}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-gray-400 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

// --- Editor Component ---

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

  const handleSave = async () => {
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

    // Sauvegarde automatique sur le serveur
    try {
      await tariffService.saveTariffConfig(newConfig);
      console.log("Tarif sauvegardé automatiquement");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde automatique:", error);
    }
  };

  return (
    <motion.div
      key={node.data.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="space-y-4">
        <label className="block text-xs font-bold text-[#ffe992] uppercase tracking-widest mb-2">
          Nom de l'élément
        </label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleSave}
          className="w-full bg-[#1a1a20] border border-white/10 rounded-xl px-6 py-4 text-white text-lg focus:border-[#ffe992] focus:ring-1 focus:ring-[#ffe992] outline-none transition-all placeholder-gray-600"
          placeholder="Ex: Tirage Fine Art..."
        />
      </div>

      {type === "size" && (
        <div className="space-y-4">
          <label className="block text-xs font-bold text-[#ffe992] uppercase tracking-widest mb-2">
            Prix de base (€)
          </label>
          <div className="relative">
            <input
              type="number"
              name="basePrice"
              value={formData.basePrice || 0}
              onChange={handleChange}
              onBlur={handleSave}
              className="w-full bg-[#1a1a20] border border-white/10 rounded-xl px-6 py-4 pl-12 text-white text-lg focus:border-[#ffe992] focus:ring-1 focus:ring-[#ffe992] outline-none transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-serif italic">
              €
            </span>
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-[#ffe992]" />
            Ce prix sera la base pour toutes les options de cette taille.
          </p>
        </div>
      )}

      {(type === "paper" || type === "frame") && (
        <div className="space-y-4">
          <label className="block text-xs font-bold text-[#ffe992] uppercase tracking-widest mb-2">
            Supplément Prix (€)
          </label>
          <div className="relative">
            <input
              type="number"
              name="priceModifier"
              value={formData.priceModifier || 0}
              onChange={handleChange}
              onBlur={handleSave}
              className="w-full bg-[#1a1a20] border border-white/10 rounded-xl px-6 py-4 pl-12 text-white text-lg focus:border-[#ffe992] focus:ring-1 focus:ring-[#ffe992] outline-none transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-serif italic">
              +
            </span>
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-[#ffe992]" />
            S'ajoute au prix de base de la taille parente.
          </p>
        </div>
      )}

      <div className="pt-8 mt-8 border-t border-white/5">
        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
          <div className="p-2 bg-white/5 rounded-lg">
            <Settings size={16} className="text-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Identifiant Système
            </p>
            <p className="font-mono text-xs text-[#ffe992]">{formData.id}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
