"use client";

import { motion, useReducedMotion } from "motion/react";

const COLORS = ["#c39eb0", "#a8c4b5", "#f2d68f", "#f2b8a0", "#b5cde0", "#cbbde3"];

/** Pequena explosão de estrelas para comemorar um acerto. Decorativa. */
export function Burst({ count = 10, radius = 80, className }: { count?: number; radius?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <span className={`pointer-events-none absolute inset-0 flex items-center justify-center ${className ?? ""}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (i % 2) * 0.3;
        const dist = radius * (0.75 + (i % 3) * 0.15);
        const size = 10 + (i % 3) * 4;
        return (
          <motion.svg
            key={i}
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className="absolute"
            initial={{ x: 0, y: 0, scale: 0.2, opacity: 1, rotate: 0 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: 1, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <path d="M12 1.5c.6 4.8 2.7 7.2 7.5 7.9-4.8.7-6.9 3.1-7.5 7.9-.6-4.8-2.7-7.2-7.5-7.9 4.8-.7 6.9-3.1 7.5-7.9Z" fill={COLORS[i % COLORS.length]} />
          </motion.svg>
        );
      })}
    </span>
  );
}
