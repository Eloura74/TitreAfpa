import React, { useRef, useEffect } from "react";

interface IntroVideoProps {
  onEnded: () => void;
}

const IntroVideo: React.FC<IntroVideoProps> = ({ onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      // Tenter de lancer la vidéo automatiquement
      videoRef.current.play().catch((error) => {
        console.warn("Autoplay prevented:", error);
        // Si l'autoplay est bloqué, on peut envisager d'afficher un bouton "Play"
        // ou simplement passer l'intro si c'est critique.
        // Pour l'instant, on laisse l'utilisateur cliquer ou on attend.
      });
    }
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        zIndex: 9999, // Très haut pour être au-dessus de tout
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <video
        ref={videoRef}
        src="/videos/startVideo2.mp4"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover", // Remplit l'écran en gardant le ratio
        }}
        autoPlay
        muted // Muted est souvent nécessaire pour l'autoplay
        playsInline
        onEnded={onEnded}
        onClick={onEnded} // Permet de passer la vidéo en cliquant
      />

      {/* Bouton "Passer" discret au cas où */}
      <button
        onClick={onEnded}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          background: "rgba(255, 255, 255, 0.2)",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "14px",
          zIndex: 10000,
        }}
      >
        Passer l'intro
      </button>
    </div>
  );
};

export default IntroVideo;
