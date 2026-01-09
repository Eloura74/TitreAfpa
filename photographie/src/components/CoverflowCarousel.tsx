import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { preventRightClick } from "../utils/cloudinaryUtils";

interface CoverflowCarouselProps {
  images: string[];
  isVisible: boolean;
  className?: string;
}

export default function CoverflowCarousel({
  images,
  isVisible,
  className = "",
}: CoverflowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lecture automatique (Auto-play)
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 1500); // 1.5 secondes entre chaque image

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleImageClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    // Nous devons trouver la position relative de l'élément cliqué pour mettre à jour l'index absolu correctement
    // Mais comme nous passons l'index absolu au gestionnaire de clics dans la boucle de rendu, nous pouvons simplement le définir directement
    setCurrentIndex(index);
  };

  if (!isVisible) return null;

  const visibleRange = 2; // Afficher 2 éléments de chaque côté
  const items = [];

  for (
    let i = currentIndex - visibleRange;
    i <= currentIndex + visibleRange;
    i++
  ) {
    // Calculer l'index réel de l'image (en boucle)
    const imageIndex = ((i % images.length) + images.length) % images.length;
    items.push({
      absoluteIndex: i,
      imageIndex: imageIndex,
      src: images[imageIndex],
      position: i - currentIndex, // -2, -1, 0, 1, 2
    });
  }

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none perspective-1000 ${className}`}
    >
      <div className="relative w-full h-full flex items-center justify-center perspective-[1000px]">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const { absoluteIndex, src, position } = item;
            const isCenter = position === 0;

            return (
              <motion.div
                key={absoluteIndex} // Utiliser l'index absolu comme clé pour éviter les sauts
                initial={{
                  x: position * 100 + (position > 0 ? 100 : -100), // Commencer légèrement plus loin
                  opacity: 0,
                  scale: 0.5,
                  zIndex: 0,
                }}
                animate={{
                  x: position * 90, // Espacement réduit davantage (était 100)
                  scale: isCenter ? 1.0 : 1 - Math.abs(position) * 0.25, // Échelle plus petite
                  zIndex: 100 - Math.abs(position),
                  opacity: isCenter ? 1 : 0.5 - Math.abs(position) * 0.15,
                  rotateY: position * -25,
                  filter: isCenter
                    ? "brightness(1.1)"
                    : `brightness(${
                        0.7 - Math.abs(position) * 0.1
                      }) blur(${Math.abs(position)}px)`,
                }}
                exit={{
                  x: position * 100 + (position > 0 ? 100 : -100), // Sortir plus loin
                  opacity: 0,
                  scale: 0.5,
                  zIndex: 0,
                }}
                transition={{
                  duration: 1.5, // Durée augmentée pour plus de fluidité
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`absolute cursor-pointer rounded-lg shadow-2xl overflow-hidden border border-white/10 ${
                  isCenter ? "pointer-events-auto" : "pointer-events-auto"
                }`}
                style={{
                  width: "160px", // Largeur réduite (était 180px)
                  height: "180px", // Hauteur réduite (était 240px)
                  transformStyle: "preserve-3d",
                }}
                onClick={(e) => handleImageClick(e, absoluteIndex)}
              >
                <img
                  src={src}
                  alt={`Gallery item`}
                  className="w-full h-full object-cover"
                  onContextMenu={preventRightClick}
                />
                {/* Effet de reflet */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent opacity-50" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
