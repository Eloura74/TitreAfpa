import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
}

export default function GoldDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particleCount = Math.floor(
        (window.innerWidth * window.innerHeight) / 60000
      ); // Densité ajustée
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.05 + 0.9, // Taille variable
          speedY: Math.random() * 0.5 + 0.1, // Vitesse verticale lente
          speedX: Math.random() * 0.9 - 0.1, // Légère dérive horizontale
          opacity: Math.random() * 0.2 + 0.01, // Opacité réduite (0.2 à 0.6)
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 233, 146, ${p.opacity})`; // Couleur or #ffe992
        ctx.fill();

        // Mise à jour de la position
        p.y -= p.speedY;
        p.x += p.speedX;

        // Reset si hors écran
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.x < -10) p.x = canvas.width + 10;
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    // Initialisation
    resizeCanvas();
    createParticles();
    drawParticles();

    // Event listeners
    window.addEventListener("resize", () => {
      resizeCanvas();
      createParticles();
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-10 pointer-events-none"
      style={{ mixBlendMode: "screen" }} // Pour que les particules brillent sur le fond sombre
    />
  );
}
