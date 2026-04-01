import { useState } from "react";
import { Palette, Type, Tag, Sparkles, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomizationData {
  accentColor: string;
  backgroundColor: string | null;
  badge: {
    text: string | null;
    color: string;
    position: "top-left" | "top-right";
  };
  typography: {
    titleFont: "default" | "playfair" | "cinzel" | "montserrat";
    titleSize: "small" | "medium" | "large";
    titleStyle: "normal" | "bold" | "italic";
  };
  displayOrder: number;
  icon: string | null;
  hoverEffect: "none" | "zoom" | "rotate" | "glow";
}

interface CustomizationPanelProps {
  customization: CustomizationData;
  onChange: (customization: CustomizationData) => void;
}

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  customization,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (field: string, value: any) => {
    const keys = field.split(".");
    const newCustomization = { ...customization };

    if (keys.length === 1) {
      (newCustomization as any)[keys[0]] = value;
    } else if (keys.length === 2) {
      (newCustomization as any)[keys[0]][keys[1]] = value;
    }

    onChange(newCustomization);
  };

  const presetColors = [
    { name: "Or", value: "#ffe992" },
    { name: "Rouge", value: "#ef4444" },
    { name: "Bleu", value: "#3b82f6" },
    { name: "Vert", value: "#10b981" },
    { name: "Violet", value: "#8b5cf6" },
    { name: "Rose", value: "#ec4899" },
  ];

  const badgePresets = [
    "NOUVEAU",
    "POPULAIRE",
    "EXCLUSIF",
    "PROMO",
    "TENDANCE",
    "LIMITÉ",
  ];

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[#ffe992]" />
          <h3 className="text-lg font-semibold text-white">
            Personnalisation avancée
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            className="w-5 h-5 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-6 space-y-6">
              {/* Couleurs */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-[#ffe992]" />
                  <label className="text-sm font-medium text-white">
                    Couleur d'accentuation
                  </label>
                </div>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {presetColors.map((color) => (
                    <button
                      type="button"
                      key={color.value}
                      onClick={() => handleChange("accentColor", color.value)}
                      className={`h-10 rounded-lg border-2 transition-all ${
                        customization.accentColor === color.value
                          ? "border-white scale-110"
                          : "border-white/20 hover:border-white/40"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={customization.accentColor}
                  onChange={(e) => handleChange("accentColor", e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>

              {/* Badge */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-[#ffe992]" />
                  <label className="text-sm font-medium text-white">
                    Badge personnalisé
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {badgePresets.map((badge) => (
                    <button
                      type="button"
                      key={badge}
                      onClick={() => handleChange("badge.text", badge)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                        customization.badge.text === badge
                          ? "bg-[#ffe992] text-black"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customization.badge.text || ""}
                  onChange={(e) =>
                    handleChange("badge.text", e.target.value || null)
                  }
                  placeholder="Texte personnalisé..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-[#ffe992] focus:outline-none"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange("badge.position", "top-left")}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs transition-all ${
                      customization.badge.position === "top-left"
                        ? "bg-[#ffe992] text-black"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    Haut gauche
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("badge.position", "top-right")}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs transition-all ${
                      customization.badge.position === "top-right"
                        ? "bg-[#ffe992] text-black"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    Haut droit
                  </button>
                </div>
              </div>

              {/* Typographie */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Type className="w-4 h-4 text-[#ffe992]" />
                  <label className="text-sm font-medium text-white">
                    Typographie
                  </label>
                </div>
                <div className="space-y-3">
                  <select
                    value={customization.typography.titleFont}
                    onChange={(e) =>
                      handleChange("typography.titleFont", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#ffe992] focus:outline-none"
                  >
                    <option value="default">Police par défaut</option>
                    <option value="playfair">Playfair (Élégant)</option>
                    <option value="cinzel">Cinzel (Classique)</option>
                    <option value="montserrat">Montserrat (Moderne)</option>
                  </select>
                  <div className="grid grid-cols-3 gap-2">
                    {["small", "medium", "large"].map((size) => (
                      <button
                        type="button"
                        key={size}
                        onClick={() =>
                          handleChange("typography.titleSize", size)
                        }
                        className={`px-3 py-2 rounded-lg text-xs capitalize transition-all ${
                          customization.typography.titleSize === size
                            ? "bg-[#ffe992] text-black"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {size === "small"
                          ? "Petit"
                          : size === "medium"
                            ? "Moyen"
                            : "Grand"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ordre d'affichage */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUpDown className="w-4 h-4 text-[#ffe992]" />
                  <label className="text-sm font-medium text-white">
                    Priorité d'affichage
                  </label>
                </div>
                <input
                  type="number"
                  value={customization.displayOrder}
                  onChange={(e) =>
                    handleChange("displayOrder", parseInt(e.target.value) || 0)
                  }
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#ffe992] focus:outline-none"
                />
                <p className="text-xs text-white/40 mt-2">
                  Plus élevé = affiché en premier (0 = ordre par défaut)
                </p>
              </div>

              {/* Animation */}
              <div>
                <label className="text-sm font-medium text-white block mb-3">
                  Animation au survol
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "none", label: "Aucune" },
                    { value: "zoom", label: "Zoom" },
                    { value: "rotate", label: "Rotation" },
                    { value: "glow", label: "Brillance" },
                  ].map((effect) => (
                    <button
                      type="button"
                      key={effect.value}
                      onClick={() => handleChange("hoverEffect", effect.value)}
                      className={`px-3 py-2 rounded-lg text-xs transition-all ${
                        customization.hoverEffect === effect.value
                          ? "bg-[#ffe992] text-black"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {effect.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <button
                type="button"
                onClick={() =>
                  onChange({
                    accentColor: "#ffe992",
                    backgroundColor: null,
                    badge: {
                      text: null,
                      color: "#ffe992",
                      position: "top-right",
                    },
                    typography: {
                      titleFont: "default",
                      titleSize: "medium",
                      titleStyle: "normal",
                    },
                    displayOrder: 0,
                    icon: null,
                    hoverEffect: "zoom",
                  })
                }
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
              >
                Réinitialiser la personnalisation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
