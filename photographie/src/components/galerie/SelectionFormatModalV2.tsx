import React, { useState, useEffect } from "react";
import {
  TariffConfigV2,
  TariffCategoryV2,
  TariffProductV2,
  TariffSupportV2,
  TariffFormatV2,
} from "../../types/tarifConfigV2";
import { tariffServiceV2 } from "../../services/tariffServiceV2";
import { X, Info, Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface SelectionFormatModalV2Props {
  photo: any;
  onSelect: (tarif: any) => void;
  onClose: () => void;
}

export const SelectionFormatModalV2: React.FC<SelectionFormatModalV2Props> = ({
  photo,
  onSelect,
  onClose,
}) => {
  const [config, setConfig] = useState<TariffConfigV2 | null>(null);
  const [loading, setLoading] = useState(true);

  // Selection State
  const [selectedCategory, setSelectedCategory] =
    useState<TariffCategoryV2 | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<TariffProductV2 | null>(null);
  const [selectedSupport, setSelectedSupport] =
    useState<TariffSupportV2 | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<TariffFormatV2 | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);

  // Load Config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await tariffServiceV2.getTariffConfig();
        setConfig(data);
      } catch (error) {
        console.error("Failed to load V2 config", error);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  // Auto-select first available options
  useEffect(() => {
    if (config && config.categories.length > 0 && photo?.availableTariffIds) {
      // Find first valid category
      const validCategory = config.categories.find((cat) =>
        cat.products.some((prod) =>
          prod.supports.some((supp) =>
            supp.formats.some((fmt) =>
              photo.availableTariffIds.includes(fmt.id)
            )
          )
        )
      );

      if (validCategory) {
        setSelectedCategory(validCategory);
      }
    }
  }, [config, photo]);

  // Cascade: Category -> Product
  useEffect(() => {
    if (selectedCategory && photo?.availableTariffIds) {
      const validProduct = selectedCategory.products.find((prod) =>
        prod.supports.some((supp) =>
          supp.formats.some((fmt) => photo.availableTariffIds.includes(fmt.id))
        )
      );
      setSelectedProduct(validProduct || null);
    }
  }, [selectedCategory, photo]);

  // Cascade: Product -> Support
  useEffect(() => {
    if (selectedProduct && photo?.availableTariffIds) {
      const validSupport = selectedProduct.supports.find((supp) =>
        supp.formats.some((fmt) => photo.availableTariffIds.includes(fmt.id))
      );
      setSelectedSupport(validSupport || null);
    }
  }, [selectedProduct, photo]);

  // Cascade: Support -> Format
  useEffect(() => {
    if (selectedSupport && photo?.availableTariffIds) {
      const validFormat = selectedSupport.formats.find((fmt) =>
        photo.availableTariffIds.includes(fmt.id)
      );
      setSelectedFormat(validFormat || null);
    }
  }, [selectedSupport, photo]);

  const totalPrice = (selectedFormat?.price || 0) * quantity;

  const handleConfirm = () => {
    if (selectedFormat && selectedSupport && selectedProduct) {
      const tarif = {
        id: selectedFormat.id,
        format: selectedFormat.name,
        support: `${selectedSupport.name} (${selectedProduct.name})`,
        prix: selectedFormat.price,
        quantity: quantity, // Pass quantity if parent supports it
      };
      onSelect(tarif);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-[100]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffe992]"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-end md:items-center justify-center bg-black/90 backdrop-blur-md z-[100] p-0 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-[#121218] w-full max-w-6xl h-[90dvh] md:h-[85vh] rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10"
      >
        {/* Mobile Header */}
        <div className="md:hidden relative w-full h-32 bg-black/50 flex-shrink-0">
          <img
            src={photo.src}
            alt={photo.titre}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121218] flex items-end p-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">
                {photo.titre}
              </h2>
              <p className="text-gray-400 text-xs">{photo.categorie}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 text-white bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Desktop Left: Image */}
        <div className="hidden md:flex w-full md:w-2/3 bg-black/50 relative flex-col flex-1">
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 bg-gradient-to-b from-black/60 to-transparent">
            <div>
              <h2 className="text-2xl font-serif font-bold text-white mb-1">
                {photo.titre}
              </h2>
              <p className="text-gray-300 text-sm">{photo.categorie}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-8 md:p-12 relative">
            <div className="relative shadow-2xl">
              <img
                src={photo.src}
                alt={photo.titre}
                className="max-w-full max-h-[60vh] object-contain shadow-lg"
              />
            </div>
            {selectedFormat && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs text-white flex items-center gap-2">
                <Info size={14} className="text-[#ffe992]" />
                <span>Dimensions : {selectedFormat.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Config Form */}
        <div className="flex-1 md:w-1/3 bg-[#1a1a20] flex flex-col border-l border-white/10 overflow-hidden">
          <div className="hidden md:flex justify-end p-4">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4 md:pb-6 custom-scrollbar">
            <h3 className="text-base md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 pt-4 md:pt-0">
              <span className="w-1 h-5 md:h-6 bg-[#ffe992] rounded-full" />
              Configuration (Picto)
            </h3>

            {/* 1. Catégorie */}
            <div className="mb-4 md:mb-6">
              <label className="block text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mb-2">
                1. Catégorie
              </label>
              <div className="grid grid-cols-1 gap-2">
                {config?.categories.map((cat) => {
                  // Check availability
                  const isAvailable = cat.products.some((p) =>
                    p.supports.some((s) =>
                      s.formats.some((f) =>
                        photo.availableTariffIds.includes(f.id)
                      )
                    )
                  );
                  if (!isAvailable) return null;

                  const isSelected = selectedCategory?.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-[#ffe992]/10 border-[#ffe992] text-white"
                          : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Produit */}
            {selectedCategory && (
              <div className="mb-4 md:mb-6">
                <label className="block text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mb-2">
                  2. Produit
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {selectedCategory.products.map((prod) => {
                    const isAvailable = prod.supports.some((s) =>
                      s.formats.some((f) =>
                        photo.availableTariffIds.includes(f.id)
                      )
                    );
                    if (!isAvailable) return null;

                    const isSelected = selectedProduct?.id === prod.id;
                    return (
                      <button
                        key={prod.id}
                        onClick={() => setSelectedProduct(prod)}
                        className={`text-left p-3 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-[#ffe992]/10 border-[#ffe992] text-white"
                            : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        <div className="font-medium">{prod.name}</div>
                        {prod.description && (
                          <div className="text-xs opacity-60 mt-1">
                            {prod.description}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Support */}
            {selectedProduct && (
              <div className="mb-4 md:mb-6">
                <label className="block text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mb-2">
                  3. Support
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {selectedProduct.supports.map((supp) => {
                    const isAvailable = supp.formats.some((f) =>
                      photo.availableTariffIds.includes(f.id)
                    );
                    if (!isAvailable) return null;

                    const isSelected = selectedSupport?.id === supp.id;
                    return (
                      <button
                        key={supp.id}
                        onClick={() => setSelectedSupport(supp)}
                        className={`text-left p-3 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-[#ffe992]/10 border-[#ffe992] text-white"
                            : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        <div className="font-medium">{supp.name}</div>
                        {supp.description && (
                          <div className="text-xs opacity-60 mt-1">
                            {supp.description}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Format */}
            {selectedSupport && (
              <div className="mb-4 md:mb-6">
                <label className="block text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mb-2">
                  4. Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedSupport.formats.map((fmt) => {
                    if (!photo.availableTariffIds.includes(fmt.id)) return null;
                    const isSelected = selectedFormat?.id === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        onClick={() => setSelectedFormat(fmt)}
                        className={`flex justify-between items-center p-3 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-[#ffe992] text-black border-[#ffe992] font-bold"
                            : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        <span>{fmt.name}</span>
                        <span>{fmt.price}€</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 md:p-6 border-t border-white/10 bg-[#121218] flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">Quantité</span>
              <div className="flex items-center gap-3 bg-white/5 rounded-full px-3 py-1 border border-white/10">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 hover:text-[#ffe992]"
                >
                  <Minus size={14} />
                </button>
                <span className="text-white font-medium w-4 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 hover:text-[#ffe992]"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-400">Total</span>
              <span className="text-2xl font-serif font-bold text-[#ffe992]">
                {totalPrice.toFixed(2)} €
              </span>
            </div>

            <button
              onClick={handleConfirm}
              disabled={!selectedFormat}
              className="w-full bg-[#ffe992] text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-[#d6c487] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter au panier
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
