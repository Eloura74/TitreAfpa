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
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
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
            className="fixed z-[101] overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a20] via-black/95 to-[#0f0f14] border-2 border-[#ffe992]/60 shadow-[0_0_60px_rgba(255,233,146,0.4)]"
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
            <div className="h-full overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-[#ffe992]/40 scrollbar-track-[#ffe992]/10">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
