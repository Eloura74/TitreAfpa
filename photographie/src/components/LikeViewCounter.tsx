import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Heart, Eye } from "lucide-react";
import { API_URL } from "../config/api";

export interface LikeViewCounterRef {
  incrementView: () => Promise<void>;
}

interface LikeViewCounterProps {
  id: string;
  likes: number;
  views: number;
  apiEndpoint: string; // "/api/galerie" ou "/api/oeuvres-graphique"
  onLike?: () => void;
}

export const LikeViewCounter = forwardRef<
  LikeViewCounterRef,
  LikeViewCounterProps
>(
  (
    { id, likes: initialLikes, views: initialViews, apiEndpoint, onLike },
    ref,
  ) => {
    const [likes, setLikes] = useState(initialLikes || 0);
    const [views, setViews] = useState(initialViews || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Exposer la méthode incrementView au parent via ref
    useImperativeHandle(ref, () => ({
      incrementView: async () => {
        const viewedKey = `viewed_${apiEndpoint}_${id}`;
        const hasViewed = sessionStorage.getItem(viewedKey);

        if (!hasViewed && id) {
          try {
            const res = await fetch(`${API_URL}${apiEndpoint}/${id}/view`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (data.views !== undefined) {
              setViews(data.views);
              sessionStorage.setItem(viewedKey, "true");
            }
          } catch (err) {
            console.error("Erreur vue:", err);
          }
        }
      },
    }));

    // Vérifier si déjà liké (localStorage)
    useEffect(() => {
      const likedKey = `liked_${apiEndpoint}_${id}`;
      const hasLiked = localStorage.getItem(likedKey);
      if (hasLiked) {
        setIsLiked(true);
      }
    }, [id, apiEndpoint]);

    const handleLike = async () => {
      if (isLiked || isLoading) return;

      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}${apiEndpoint}/${id}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          setLikes(data.likes);
          setIsLiked(true);
          localStorage.setItem(`liked_${apiEndpoint}_${id}`, "true");
          onLike?.();
        }
      } catch (err) {
        console.error("Erreur like:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const formatNumber = (num: number): string => {
      if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
      return num.toString();
    };

    return (
      <div className="flex items-center gap-3 text-white/70">
        {/* Compteur de vues */}
        <div className="flex items-center gap-1.5 text-xs">
          <Eye size={14} className="text-[#ffe992]/80" />
          <span className="font-medium">{formatNumber(views)}</span>
        </div>

        {/* Bouton Like */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          disabled={isLiked || isLoading}
          className={`flex items-center gap-1.5 text-xs transition-all duration-300 ${
            isLiked
              ? "text-red-400 cursor-default"
              : "text-white/70 hover:text-red-400"
          }`}
        >
          <Heart
            size={14}
            className={`transition-all duration-300 ${
              isLiked ? "fill-red-400 text-red-400" : "text-[#ffe992]/80"
            } ${isLoading ? "animate-pulse" : ""}`}
          />
          <span className="font-medium">{formatNumber(likes)}</span>
        </button>
      </div>
    );
  },
);

LikeViewCounter.displayName = "LikeViewCounter";
