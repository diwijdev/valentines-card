import { useMemo } from "react";
import { motion } from "framer-motion";

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export default function HeartsBackground({ count = 20 }) {
  const hearts = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      return {
        id: i,
        left: rand(0, 100),
        size: rand(18, 60),
        duration: rand(12, 25),
        delay: rand(0, 8),
        drift: rand(-40, 40),
        opacity: rand(0.1, 0.3),
        blur: rand(3, 10),
        glow: rand(6, 18),
      };
    });
  }, [count]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      
      {/* 🌌 Dark Romantic Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050816] via-[#0b1026] to-[#120b1f]" />

      {/* 💗 Floating Hearts */}
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-pink-400"
          style={{
            left: `${heart.left}vw`,
            bottom: "-10vh",
            fontSize: `${heart.size}px`,
            opacity: heart.opacity,
            filter: `blur(${heart.blur}px) drop-shadow(0 0 ${heart.glow}px rgba(255,105,180,0.6))`,
          }}
          initial={{ y: 0, x: 0 }}
          animate={{
            y: "-120vh",
            x: [0, heart.drift, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          ❤
        </motion.div>
      ))}
    </div>
  );
}
