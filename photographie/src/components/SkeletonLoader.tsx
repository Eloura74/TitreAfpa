// ============================================
// SKELETON LOADERS - UX PROFESSIONNELLE
// ============================================
// Améliore la perception de vitesse pendant les chargements

import React from 'react';

// ============================================
// SKELETON POUR PHOTO (GALERIE)
// ============================================
export const PhotoSkeleton: React.FC = () => (
  <div className="relative overflow-hidden rounded-lg bg-white/5 backdrop-blur-sm">
    {/* Image skeleton */}
    <div className="aspect-[4/3] bg-gradient-to-br from-gray-700/30 via-gray-600/20 to-gray-700/30 animate-pulse" />
    
    {/* Titre skeleton */}
    <div className="p-3 space-y-2">
      <div className="h-4 bg-gray-700/30 rounded animate-pulse w-3/4" />
      <div className="h-3 bg-gray-700/30 rounded animate-pulse w-1/2" />
    </div>
    
    {/* Effet de shimmer */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
);

// ============================================
// SKELETON POUR CARTE (SERVICES)
// ============================================
export const CardSkeleton: React.FC = () => (
  <div className="relative overflow-hidden bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
    {/* En-tête */}
    <div className="h-6 bg-gray-700/30 rounded w-1/3 mb-4 animate-pulse" />
    
    {/* Contenu */}
    <div className="space-y-3">
      <div className="h-4 bg-gray-700/30 rounded animate-pulse" />
      <div className="h-4 bg-gray-700/30 rounded w-5/6 animate-pulse" />
      <div className="h-4 bg-gray-700/30 rounded w-4/6 animate-pulse" />
    </div>
    
    {/* Bouton */}
    <div className="mt-6 h-10 bg-gray-700/30 rounded-lg w-32 animate-pulse" />
    
    {/* Effet shimmer */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
);

// ============================================
// SKELETON POUR BOUTON
// ============================================
export const ButtonSkeleton: React.FC<{ width?: string }> = ({ width = "w-32" }) => (
  <div className={`h-10 bg-gray-700/30 rounded-lg ${width} animate-pulse relative overflow-hidden`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
);

// ============================================
// SKELETON POUR GRILLE DE PHOTOS
// ============================================
export const PhotoGridSkeleton: React.FC<{ count?: number }> = ({ count = 9 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(count)].map((_, i) => (
      <PhotoSkeleton key={i} />
    ))}
  </div>
);

// ============================================
// SKELETON POUR LISTE
// ============================================
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-4">
    {[...Array(items)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg relative overflow-hidden">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gray-700/30 rounded-full animate-pulse" />
        
        {/* Contenu */}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-700/30 rounded w-1/4 animate-pulse" />
          <div className="h-3 bg-gray-700/30 rounded w-1/2 animate-pulse" />
        </div>
        
        {/* Shimmer */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    ))}
  </div>
);

// ============================================
// SKELETON POUR TABLEAU (ADMIN)
// ============================================
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 10 }) => (
  <div className="overflow-hidden rounded-lg border border-white/10">
    {/* Header */}
    <div className="bg-white/5 p-4 grid grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-700/30 rounded animate-pulse" />
      ))}
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-white/5">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="p-4 grid grid-cols-4 gap-4 relative overflow-hidden">
          {[...Array(4)].map((_, j) => (
            <div key={j} className="h-4 bg-gray-700/30 rounded animate-pulse" />
          ))}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      ))}
    </div>
  </div>
);

// ============================================
// SKELETON POUR PAGE COMPLÈTE
// ============================================
export const PageSkeleton: React.FC = () => (
  <div className="min-h-screen p-8 space-y-8">
    {/* En-tête page */}
    <div className="space-y-4">
      <div className="h-10 bg-gray-700/30 rounded w-1/3 animate-pulse" />
      <div className="h-6 bg-gray-700/30 rounded w-1/2 animate-pulse" />
    </div>
    
    {/* Contenu principal */}
    <PhotoGridSkeleton count={6} />
  </div>
);
