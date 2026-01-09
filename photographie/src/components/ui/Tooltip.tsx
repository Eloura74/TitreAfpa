import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const updatePosition = () => {
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          setCoords({
            top: rect.top,
            left: rect.left + rect.width / 2,
          });
        }
      };

      updatePosition();
      // Update on scroll/resize to keep it attached
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isVisible]);

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex items-center ml-2 relative z-10"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
      >
        {children || (
          <Info
            size={16}
            className="text-gray-500 hover:text-[#ffe992] transition-colors cursor-help"
          />
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5, x: "-50%" }}
              animate={{ opacity: 1, scale: 1, y: -15, x: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, y: -5, x: "-50%" }}
              transition={{ duration: 0.2 }}
              style={{
                position: "fixed",
                top: coords.top,
                left: coords.left,
                zIndex: 99999, // Ensure it's above everything including the modal
              }}
              className="w-64 p-3 bg-[#2a2a30] border border-white/10 rounded-xl shadow-2xl pointer-events-none"
            >
              <div className="text-xs text-gray-200 text-center leading-relaxed font-sans normal-case tracking-normal">
                {content}
              </div>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-[#2a2a30]" />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
