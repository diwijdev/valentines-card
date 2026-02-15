import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function nextEdgeSpot() {
  // Center safe area (avoid the envelope/letter)
  const SAFE = { left: 32, right: 68, top: 22, bottom: 82 }; // vw/vh

  const edge = ["left", "right", "top", "bottom"][
    Math.floor(Math.random() * 4)
  ];

  let x, y;

  if (edge === "left") {
    x = rand(3, SAFE.left - 5);
    y = rand(10, 90);
  } else if (edge === "right") {
    x = rand(SAFE.right + 5, 97);
    y = rand(10, 90);
  } else if (edge === "top") {
    x = rand(8, 92);
    y = rand(3, SAFE.top - 5);
  } else {
    x = rand(8, 92);
    y = rand(SAFE.bottom + 2, 97);
  }

  return { x, y, edge };
}

export default function FloatingPhotos({
  photos = [],
  showMs = 2200, // how long visible
  gapMs = 600,   // time between photos
}) {
  const [idx, setIdx] = useState(0);
  const [spot, setSpot] = useState(() => nextEdgeSpot());

  // advance to next photo (one-by-one)
  useEffect(() => {
    if (!photos.length) return;

    const id = setTimeout(() => {
      setIdx((i) => (i + 1) % photos.length);
      setSpot(nextEdgeSpot());
    }, showMs + gapMs);

    return () => clearTimeout(id);
  }, [idx, photos.length, showMs, gapMs]);

  const current = photos[idx];

  // randomize size/rotation per photo display
  const styleVars = useMemo(() => {
    return {
      size: rand(140, 220),
      rot: rand(-10, 10),
      driftX: rand(-14, 14),
      driftY: rand(-14, 14),
    };
    // re-roll when idx changes
  }, [idx]);

  if (!photos.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${idx}-${current}`}
          className="absolute"
          style={{
            left: `${spot.x}vw`,
            top: `${spot.y}vh`,
            width: `${styleVars.size}px`,
            height: `${styleVars.size}px`,
            transform: `rotate(${styleVars.rot}deg)`,
          }}
          initial={{ opacity: 0, scale: 0.92, x: 0, y: 0 }}
          animate={{
            opacity: [0, 0.9, 0.9, 0],
            scale: [0.95, 1, 1, 0.98],
            x: [0, styleVars.driftX, 0],
            y: [0, styleVars.driftY, 0],
          }}
          transition={{
            duration: (showMs / 1000) + 0.2,
            ease: "easeInOut",
          }}
        >
          {/* frame */}
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/25 bg-white/10 backdrop-blur-sm">
            <img
              src={current}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>

          {/* subtle glow */}
          <div className="absolute -inset-6 rounded-[28px] bg-pink-400/10 blur-2xl" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
