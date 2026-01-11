// ============================================
// LAZY IMAGE - Chargement optimisé des images
// ============================================
// Réduit le temps de chargement initial et améliore les performances

import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean; // Si true, charge immédiatement
  onLoad?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  priority = false,
  onLoad 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    // Intersection Observer pour lazy loading natif
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Commence à charger 50px avant que l'image soit visible
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div className="relative overflow-hidden" ref={imgRef}>
      {/* Placeholder pendant le chargement */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700/30 via-gray-600/20 to-gray-700/30 animate-pulse">
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      )}
      
      {/* Image réelle */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          className={`
            ${className}
            transition-opacity duration-500 ease-in-out
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
        />
      )}
    </div>
  );
};

// ============================================
// LAZY IMAGE AVEC SRCSET (Responsive)
// ============================================
interface ResponsiveLazyImageProps extends LazyImageProps {
  srcSet?: string;
  sizes?: string;
}

export const ResponsiveLazyImage: React.FC<ResponsiveLazyImageProps> = ({ 
  src, 
  srcSet,
  sizes,
  alt, 
  className = '', 
  priority = false 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div className="relative overflow-hidden" ref={imgRef}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700/30 via-gray-600/20 to-gray-700/30 animate-pulse">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      )}
      
      {isInView && (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setIsLoaded(true)}
          className={`
            ${className}
            transition-opacity duration-500 ease-in-out
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
        />
      )}
    </div>
  );
};

// ============================================
// LAZY IMAGE AVEC WEBP/AVIF FALLBACK
// ============================================
export const ModernLazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  priority = false 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const pictureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' }
    );

    if (pictureRef.current) {
      observer.observe(pictureRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Génère les URLs pour WebP et AVIF depuis Cloudinary
  const getModernUrl = (format: 'webp' | 'avif') => {
    if (src.includes('cloudinary.com')) {
      return src.replace('/image/upload/', `/image/upload/f_${format}/`);
    }
    return src;
  };

  return (
    <div className="relative overflow-hidden" ref={pictureRef}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700/30 via-gray-600/20 to-gray-700/30 animate-pulse">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      )}
      
      {isInView && (
        <picture>
          {/* Format AVIF (meilleur compression) */}
          <source 
            srcSet={getModernUrl('avif')} 
            type="image/avif" 
          />
          
          {/* Format WebP (fallback) */}
          <source 
            srcSet={getModernUrl('webp')} 
            type="image/webp" 
          />
          
          {/* Format original (fallback final) */}
          <img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={() => setIsLoaded(true)}
            className={`
              ${className}
              transition-opacity duration-500 ease-in-out
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
            `}
          />
        </picture>
      )}
    </div>
  );
};
