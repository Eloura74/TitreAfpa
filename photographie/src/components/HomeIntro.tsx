import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomeIntro({ onFinish }: { onFinish?: () => void }) {
  const turbRef = useRef<SVGFETurbulenceElement | null>(null);
  const [show, setShow] = useState(true);

  useEffect(() => {
    let frame = 0;
    let running = true;
    function animate() {
      if (turbRef.current) {
        const freq = 0.015 + Math.sin(frame / 60) * 0.005;
        turbRef.current.setAttribute("baseFrequency", `${freq} ${freq * 1.5}`);
      }
      frame++;
      if (running) requestAnimationFrame(animate);
    }
    animate();
    // Cache l’intro après 2.3s (durée animation)
    const timeout = setTimeout(() => {
      setShow(false);
      if (onFinish) onFinish();
    }, 2300);
    return () => {
      running = false;
      clearTimeout(timeout);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          initial={{ opacity: 0.5 }}
          exit={{ opacity: 0, transition: { duration: 0.7 } }}
        >
          {/* Tunnel de cercles */}
          <motion.svg
            width="50vw"
            height="50vh"
            viewBox="0 0 1200 800"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 3, opacity: 0.5 }}
            animate={{
              scale: 1,
              opacity: 0.5,
              transition: { duration: 1.4, ease: [0.7, 0.1, 0.2, 1] },
            }}
            exit={{ scale: 0.7, opacity: 0, transition: { duration: 0.7 } }}
            style={{ filter: "blur(0.5px)" }}
          >
            <defs>
              <filter id="wave" x="0" y="0" width="100%" height="100%">
                <feTurbulence
                  ref={turbRef}
                  type="turbulence"
                  baseFrequency="0.02 0.03"
                  numOctaves="2"
                  seed="2"
                  result="turb"
                />
                <feDisplacementMap
                  in2="turb"
                  in="SourceGraphic"
                  scale="16"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
              <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fff" />
                <stop offset="40%" stopColor="#ffe992" />
                <stop offset="100%" stopColor="#fff" />
              </linearGradient>
            </defs>
            {/* Plusieurs cercles pour l’effet tunnel */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <circle
                key={i}
                cx={600}
                cy={400}
                r={90 + i * 60}
                fill="none"
                stroke="url(#shine)"
                strokeWidth={i === 0 ? 6 : 2}
                filter="url(#wave)"
                opacity={0.5 - i * 0.1}
              />
            ))}
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
