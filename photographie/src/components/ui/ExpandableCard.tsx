import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ExpandableCardProps {
  isExpanded: boolean;
  onClose: () => void;
  children: React.ReactNode;
  cardPosition?: { top: number; left: number; width: number; height: number };
}

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  isExpanded,
  onClose,
  children,
  cardPosition,
}) => {
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
      // Cacher temporairement le navbar
      const navbar = document.querySelector(".navbar-container");
      if (navbar) {
        (navbar as HTMLElement).style.display = "none";
      }
    } else {
      document.body.style.overflow = "unset";
      // Réafficher le navbar
      const navbar = document.querySelector(".navbar-container");
      if (navbar) {
        (navbar as HTMLElement).style.display = "";
      }
    }
    return () => {
      document.body.style.overflow = "unset";
      const navbar = document.querySelector(".navbar-container");
      if (navbar) {
        (navbar as HTMLElement).style.display = "";
      }
    };
  }, [isExpanded]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isExpanded, onClose]);

  return (
    <AnimatePresence>
      {isExpanded && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            style={{ zIndex: 99999 }}
            onClick={onClose}
          />

          {/* Expanded Card */}
          <motion.div
            initial={
              cardPosition
                ? {
                    top: cardPosition.top,
                    left: cardPosition.left,
                    width: cardPosition.width,
                    height: cardPosition.height,
                    opacity: 1,
                  }
                : {
                    opacity: 0,
                    scale: 0.9,
                  }
            }
            animate={{
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              width: "90vw",
              maxWidth: "1200px",
              height: "85vh",
              opacity: 1,
              scale: 1,
            }}
            exit={
              cardPosition
                ? {
                    top: cardPosition.top,
                    left: cardPosition.left,
                    width: cardPosition.width,
                    height: cardPosition.height,
                    opacity: 0,
                  }
                : {
                    opacity: 0,
                    scale: 0.9,
                  }
            }
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.5,
            }}
            className="fixed overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a20] via-black/95 to-[#0f0f14] border-2 border-[#ffe992]/60 shadow-[0_0_60px_rgba(255,233,146,0.4)]"
            style={{ zIndex: 100000 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Fermer"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Content */}
            <div
              className="h-full overflow-y-auto p-8"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor:
                  "rgba(255, 233, 146, 0.6) rgba(255, 233, 146, 0.05)",
              }}
            >
              {children}
            </div>

            {/* Custom Scrollbar Styles */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
                .fixed.z-\\[10000\\] > div::-webkit-scrollbar {
                  width: 12px;
                }
                .fixed.z-\\[10000\\] > div::-webkit-scrollbar-track {
                  background: rgba(255, 233, 146, 0.05);
                  border-radius: 10px;
                  margin: 8px 0;
                }
                .fixed.z-\\[10000\\] > div::-webkit-scrollbar-thumb {
                  background: linear-gradient(180deg, rgba(255, 233, 146, 0.6), rgba(255, 233, 146, 0.3));
                  border-radius: 10px;
                  border: 2px solid rgba(0, 0, 0, 0.2);
                }
                .fixed.z-\\[10000\\] > div::-webkit-scrollbar-thumb:hover {
                  background: linear-gradient(180deg, rgba(255, 233, 146, 0.8), rgba(255, 233, 146, 0.5));
                }
              `,
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
