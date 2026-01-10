import React, { useState, useEffect } from "react";
import {
  TariffConfigV2,
  TariffCategoryV2,
  TariffProductV2,
  TariffSupportV2,
  TariffFormatV2,
} from "../../types/tarifConfigV2";
import { tariffServiceV2 } from "../../services/tariffServiceV2";

interface ClientTariffSelectorProps {
  onSelect: (tarif: any | null) => void;
  selectedTarif: any | null;
}

export const ClientTariffSelector: React.FC<ClientTariffSelectorProps> = ({
  onSelect,
  selectedTarif: _selectedTarif,
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

  // Reset downstream selections when upstream changes
  useEffect(() => {
    setSelectedProduct(null);
    setSelectedSupport(null);
    setSelectedFormat(null);
    onSelect(null);
  }, [selectedCategory]);

  useEffect(() => {
    setSelectedSupport(null);
    setSelectedFormat(null);
    onSelect(null);
  }, [selectedProduct]);

  useEffect(() => {
    setSelectedFormat(null);
    onSelect(null);
  }, [selectedSupport]);

  // Notify parent when format is selected
  useEffect(() => {
    if (selectedFormat && selectedSupport && selectedProduct) {
      const tarif = {
        id: selectedFormat.id,
        format: selectedFormat.name,
        support: `${selectedSupport.name} (${selectedProduct.name})`,
        prix: selectedFormat.price,
        isDigital: false,
      };
      onSelect(tarif);
    }
  }, [selectedFormat, selectedSupport, selectedProduct]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ffe992]"></div>
      </div>
    );
  }

  if (!config)
    return <div className="text-red-500">Erreur chargement tarifs</div>;

  return (
    <div className="space-y-4">
      {/* 1. Catégorie */}
      <div>
        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
          1. Type de produit
        </label>
        <div className="flex flex-wrap gap-2">
          {config.categories.map((cat) => {
            // Filter out empty categories if needed, but for now show all
            if (cat.products.length === 0) return null;

            const isSelected = selectedCategory?.id === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                  isSelected
                    ? "bg-[#ffe992] text-black border-[#ffe992] font-medium"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
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
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
            2. Finition
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedCategory.products.map((prod) => {
              const isSelected = selectedProduct?.id === prod.id;
              return (
                <button
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-[#ffe992]/10 border-[#ffe992] text-white"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <div className="font-medium text-sm">{prod.name}</div>
                  {prod.description && (
                    <div className="text-[10px] opacity-60 mt-1 line-clamp-2">
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
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
            3. Support
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedProduct.supports.map((supp) => {
              const isSelected = selectedSupport?.id === supp.id;
              return (
                <button
                  key={supp.id}
                  onClick={() => setSelectedSupport(supp)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-[#ffe992]/10 border-[#ffe992] text-white"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <div className="font-medium text-sm">{supp.name}</div>
                  {supp.description && (
                    <div className="text-[10px] opacity-60 mt-1 line-clamp-2">
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
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
            4. Format
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {selectedSupport.formats.map((fmt) => {
              const isSelected = selectedFormat?.id === fmt.id;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-[#ffe992] text-black border-[#ffe992] font-bold shadow-[0_0_10px_rgba(255,233,146,0.3)]"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <span className="text-sm">{fmt.name}</span>
                  <span className="text-xs opacity-80">{fmt.price} €</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
