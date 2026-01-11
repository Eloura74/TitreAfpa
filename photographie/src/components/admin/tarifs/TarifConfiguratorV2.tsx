import { useState, useEffect } from "react";
import {
  TariffConfigV2,
  TariffCategoryV2,
  TariffProductV2,
  TariffSupportV2,
  TariffFormatV2,
} from "../../../types/tarifConfigV2";
import { tariffServiceV2 } from "../../../services/tariffServiceV2";
import {
  Save,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  Image,
  Maximize,
  Settings,
  Layers,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";

const INITIAL_CONFIG: TariffConfigV2 = {
  categories: [],
};

export default function TarifConfiguratorV2() {
  const [config, setConfig] = useState<TariffConfigV2>(INITIAL_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<{
    type: "category" | "product" | "support" | "format";
    path: string[]; // IDs path
    data: any;
  } | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const data = await tariffServiceV2.getTariffConfig();
        if (data.categories.length === 0) {
          // Si vide, ça peut être une erreur silencieuse du service (catch interne)
          // On pourrait vérifier si le service retourne une erreur explicite, mais pour l'instant on suppose que vide = vide ou erreur
        }
        setConfig(data);
      } catch (err) {
        console.error("Failed to load V2 config", err);
        setError(
          "Impossible de charger la configuration. Vérifiez que le backend tourne."
        );
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const saveConfig = async () => {
    try {
      await tariffServiceV2.saveTariffConfig(config);
      alert("Configuration V2 sauvegardée (LocalStorage) !");
    } catch (error) {
      console.error("Failed to save config", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  const updateTree = (newConfig: TariffConfigV2) => {
    setConfig(newConfig);
  };

  const addCategory = () => {
    const newCat: TariffCategoryV2 = {
      id: uuidv4(),
      name: "Nouvelle Catégorie",
      products: [],
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
              Structure V2 (Picto)
            </h3>
          </div>
          <button
            onClick={addCategory}
            className="p-2.5 bg-[#ffe992] text-black rounded-lg hover:bg-[#d6c487] transition-all shadow-lg shadow-[#ffe992]/20 flex items-center gap-2 font-medium text-sm"
          >
            <Plus size={18} />
            <span>Nouvelle Catégorie</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffe992] mb-4"></div>
              <p>Chargement des données Picto...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 mt-20 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <p className="font-bold mb-2">Erreur</p>
              <p>{error}</p>
            </div>
          ) : config.categories.length === 0 ? (
            <div className="text-center text-gray-500 mt-20 p-4">
              <Folder size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">Aucune catégorie configurée.</p>
              <p className="text-sm mt-2 text-gray-600">
                La base de données semble vide ou inaccessible.
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

  const addProduct = (e: any) => {
    e.stopPropagation();
    const newProduct: TariffProductV2 = {
      id: uuidv4(),
      name: "Nouveau Produit",
      supports: [],
    };
    const newCats = config.categories.map((c: any) =>
      c.id === category.id ? { ...c, products: [...c.products, newProduct] } : c
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
            {category.price && category.price > 0 && (
              <span className="text-xs text-[#ffe992] font-mono bg-[#ffe992]/10 px-2 py-0.5 rounded">
                {category.price} €
              </span>
            )}
          </div>
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
          <button
            onClick={addProduct}
            className="p-2 hover:bg-[#ffe992] hover:text-black rounded-lg text-gray-400 transition-colors"
            title="Ajouter Produit"
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
            {category.products.map((prod: any) => (
              <ProductNode
                key={prod.id}
                product={prod}
                catId={category.id}
                selectedPath={selectedPath}
                onSelect={onSelect}
                config={config}
                updateTree={updateTree}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductNode({
  product,
  catId,
  selectedPath,
  onSelect,
  config,
  updateTree,
}: any) {
  const [expanded, setExpanded] = useState(false);
  const isSelected =
    selectedPath[1] === product.id && selectedPath.length === 2;

  const deleteProduct = () => {
    if (!confirm("Supprimer ce produit ?")) return;
    const newCats = config.categories.map((c: any) =>
      c.id === catId
        ? {
            ...c,
            products: c.products.filter((p: any) => p.id !== product.id),
          }
        : c
    );
    updateTree({ ...config, categories: newCats });
  };

  const addSupport = (e: any) => {
    e.stopPropagation();
    const newSupport: TariffSupportV2 = {
      id: uuidv4(),
      name: "Nouveau Support",
      formats: [],
    };
    const newCats = config.categories.map((c: any) =>
      c.id === catId
        ? {
            ...c,
            products: c.products.map((p: any) =>
              p.id === product.id
                ? { ...p, supports: [...p.supports, newSupport] }
                : p
            ),
          }
        : c
    );
    updateTree({ ...config, categories: newCats });
    setExpanded(true);
  };

  return (
    <div className="mt-2 relative">
      <div className="absolute top-6 -left-5 w-5 h-[2px] bg-white/5" />
      <div
        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all duration-200 border ${
          isSelected
            ? "bg-[#ffe992]/10 border-[#ffe992]/30"
            : "border-transparent hover:bg-white/5 hover:border-white/5"
        }`}
        onClick={() => onSelect("product", [catId, product.id], product)}
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
            PRODUIT
          </span>
          <span
            className={`truncate text-base ${
              isSelected ? "text-[#ffe992] font-medium" : "text-gray-300"
            }`}
          >
            {product.name}
          </span>
          {product.price && product.price > 0 && (
            <span className="text-xs text-[#ffe992] font-mono bg-[#ffe992]/10 px-2 py-0.5 rounded">
              {product.price} €
            </span>
          )}
        </div>
        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
          <button
            onClick={addSupport}
            className="p-1.5 hover:bg-[#ffe992] hover:text-black rounded text-gray-400 transition-colors"
            title="Ajouter Support"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteProduct();
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
            {product.supports.map((supp: any) => (
              <SupportNode
                key={supp.id}
                support={supp}
                catId={catId}
                prodId={product.id}
                selectedPath={selectedPath}
                onSelect={onSelect}
                config={config}
                updateTree={updateTree}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SupportNode({
  support,
  catId,
  prodId,
  selectedPath,
  onSelect,
  config,
  updateTree,
}: any) {
  const [expanded, setExpanded] = useState(false);
  const isSelected =
    selectedPath[2] === support.id && selectedPath.length === 3;

  const deleteSupport = () => {
    if (!confirm("Supprimer ce support ?")) return;
    const newCats = config.categories.map((c: any) =>
      c.id === catId
        ? {
            ...c,
            products: c.products.map((p: any) =>
              p.id === prodId
                ? {
                    ...p,
                    supports: p.supports.filter(
                      (s: any) => s.id !== support.id
                    ),
                  }
                : p
            ),
          }
        : c
    );
    updateTree({ ...config, categories: newCats });
  };

  const addFormat = (e: any) => {
    e.stopPropagation();
    const newFormat: TariffFormatV2 = {
      id: uuidv4(),
      name: "Nouveau Format",
      price: 0,
    };
    const newCats = config.categories.map((c: any) =>
      c.id === catId
        ? {
            ...c,
            products: c.products.map((p: any) =>
              p.id === prodId
                ? {
                    ...p,
                    supports: p.supports.map((s: any) =>
                      s.id === support.id
                        ? { ...s, formats: [...s.formats, newFormat] }
                        : s
                    ),
                  }
                : p
            ),
          }
        : c
    );
    updateTree({ ...config, categories: newCats });
    setExpanded(true);
  };

  return (
    <div className="mt-2 relative">
      <div className="absolute top-6 -left-5 w-5 h-[2px] bg-white/5" />
      <div
        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all duration-200 border ${
          isSelected
            ? "bg-[#ffe992]/10 border-[#ffe992]/30"
            : "border-transparent hover:bg-white/5 hover:border-white/5"
        }`}
        onClick={() =>
          onSelect("support", [catId, prodId, support.id], support)
        }
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
        <Layers
          size={18}
          className={isSelected ? "text-[#ffe992]" : "text-gray-500"}
        />
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600 border border-gray-700 px-1.5 py-0.5 rounded bg-black/20">
            SUPPORT
          </span>
          <span
            className={`truncate text-base ${
              isSelected ? "text-[#ffe992] font-medium" : "text-gray-400"
            }`}
          >
            {support.name}
          </span>
          {support.price && support.price > 0 && (
            <span className="text-xs text-[#ffe992] font-mono bg-[#ffe992]/10 px-2 py-0.5 rounded">
              {support.price} €
            </span>
          )}
        </div>
        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
          <button
            onClick={addFormat}
            className="p-1.5 hover:bg-[#ffe992] hover:text-black rounded text-gray-400 transition-colors"
            title="Ajouter Format"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteSupport();
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
            {support.formats.map((fmt: any) => (
              <FormatNode
                key={fmt.id}
                format={fmt}
                catId={catId}
                prodId={prodId}
                suppId={support.id}
                selectedPath={selectedPath}
                onSelect={onSelect}
                config={config}
                updateTree={updateTree}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormatNode({
  format,
  catId,
  prodId,
  suppId,
  selectedPath,
  onSelect,
  config,
  updateTree,
}: any) {
  const isSelected = selectedPath[3] === format.id && selectedPath.length === 4;

  const deleteFormat = () => {
    if (!confirm("Supprimer ce format ?")) return;
    const newCats = config.categories.map((c: any) =>
      c.id === catId
        ? {
            ...c,
            products: c.products.map((p: any) =>
              p.id === prodId
                ? {
                    ...p,
                    supports: p.supports.map((s: any) =>
                      s.id === suppId
                        ? {
                            ...s,
                            formats: s.formats.filter(
                              (f: any) => f.id !== format.id
                            ),
                          }
                        : s
                    ),
                  }
                : p
            ),
          }
        : c
    );
    updateTree({ ...config, categories: newCats });
  };

  return (
    <div className="mt-2 relative">
      <div className="absolute top-1/2 -left-5 w-5 h-[2px] bg-white/5" />
      <div
        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all duration-200 border ${
          isSelected
            ? "bg-[#ffe992]/10 border-[#ffe992]/30"
            : "border-transparent hover:bg-white/5 hover:border-white/5"
        }`}
        onClick={() =>
          onSelect("format", [catId, prodId, suppId, format.id], format)
        }
      >
        <div className="w-4" />
        <Maximize
          size={18}
          className={isSelected ? "text-[#ffe992]" : "text-gray-500"}
        />
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600 border border-gray-700 px-1.5 py-0.5 rounded bg-black/20">
            FORMAT
          </span>
          <span
            className={`truncate text-base ${
              isSelected ? "text-[#ffe992] font-medium" : "text-gray-400"
            }`}
          >
            {format.name}
          </span>
          <span className="text-sm text-[#ffe992] font-mono">
            {format.price} €
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteFormat();
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

  const handleSave = () => {
    const newConfig = JSON.parse(JSON.stringify(config));
    const cat = newConfig.categories.find((c: any) => c.id === path[0]);

    if (type === "category") {
      cat.name = formData.name;
      cat.price = formData.price;
    } else {
      const prod = cat.products.find((p: any) => p.id === path[1]);
      if (type === "product") {
        prod.name = formData.name;
        prod.description = formData.description;
        prod.price = formData.price;
      } else {
        const supp = prod.supports.find((s: any) => s.id === path[2]);
        if (type === "support") {
          supp.name = formData.name;
          supp.description = formData.description;
          supp.price = formData.price;
          // TODO: Technical specs
        } else {
          const fmt = supp.formats.find((f: any) => f.id === path[3]);
          fmt.name = formData.name;
          fmt.price = formData.price;
        }
      }
    }
    updateTree(newConfig);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
            Nom
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#ffe992] focus:outline-none transition-colors"
          />
        </div>

        {(type === "product" || type === "support") && (
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={3}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#ffe992] focus:outline-none transition-colors"
            />
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
            Prix (€) {type !== "format" && "(Optionnel)"}
          </label>
          <input
            type="number"
            name="price"
            value={formData.price || 0}
            onChange={handleChange}
            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#ffe992] focus:outline-none transition-colors"
          />
          {type !== "format" && (
            <p className="text-[10px] text-gray-500 mt-1">
              Ce prix s'appliquera par défaut ou en supplément selon votre
              logique métier.
            </p>
          )}
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 transition-all mt-4"
        >
          Appliquer les modifications
        </button>
      </div>
    </div>
  );
}
