"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { Media } from "@/components/media";
import type { Concept } from "@/content/types";
import { cn } from "@/lib/cn";
import { Burst } from "../shared/burst";
import { gameTextClass } from "../shared/game-text";
import type { MemoryCardData } from "./engine";

interface MemoryCardProps {
  card: MemoryCardData;
  concept: Concept;
  index: number;
  faceUp: boolean;
  matched: boolean;
  missed: boolean;
  celebrate: number | null;
  width: number;
  onFlip: () => void;
}

export function MemoryCard({ card, concept, index, faceUp, matched, missed, celebrate, width, onFlip }: MemoryCardProps) {
  const label = faceUp
    ? `Carta ${index + 1}: ${card.face === "word" ? `palavra ${concept.word}` : concept.media.alt}${matched ? ", par encontrado" : ""}`
    : `Carta ${index + 1}, virada para baixo`;
  const wordSize = Math.max(14, Math.min(34, width / Math.max(5, concept.word.length * 0.62)));

  return (
    <button
      type="button"
      onClick={onFlip}
      aria-label={label}
      aria-disabled={faceUp || undefined}
      className={cn("group relative block aspect-[4/5] w-full rounded-[var(--card-r)] [--card-r:clamp(0.9rem,2.2vw,1.6rem)] [perspective:1000px]", faceUp && "cursor-default")}
    >
      <motion.span
        className="preserve-3d absolute inset-0 block"
        initial={false}
        animate={{ rotateY: faceUp ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        {/* Verso */}
        <span className="backface-hidden absolute inset-0 flex items-center justify-center overflow-hidden rounded-[var(--card-r)] bg-rose-600 shadow-soft ring-4 ring-white transition-transform duration-200 group-hover:scale-[1.02] group-active:scale-[0.98]">
          <span className="absolute inset-2 rounded-[calc(var(--card-r)-0.4rem)] border-2 border-dashed border-white/35" />
          <span className="flex h-[42%] w-[42%] items-center justify-center rounded-full bg-white/90">
            <LogoMark className="h-3/4 w-3/4" />
          </span>
        </span>
        {/* Frente */}
        <span
          className={cn(
            "backface-hidden absolute inset-0 flex items-center justify-center rounded-[var(--card-r)] bg-white p-[8%] shadow-soft ring-4 [transform:rotateY(180deg)]",
            matched ? "ring-sage-500" : missed ? "ring-peach-300" : "ring-white",
          )}
        >
          {card.face === "image" ? (
            <Media media={concept.media} size={128} decorative className="h-[78%] w-[78%]" />
          ) : (
            <span
              className={cn("text-balance break-words text-center font-extrabold leading-tight text-ink", gameTextClass)}
              style={{ fontSize: wordSize }}
            >
              {concept.word}
            </span>
          )}
          {matched && (
            <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-sage-600 text-white shadow-soft" aria-hidden="true">
              <Check className="h-4 w-4" strokeWidth={3.5} />
            </span>
          )}
        </span>
      </motion.span>
      {celebrate !== null && <Burst key={celebrate} radius={width * 0.7} />}
    </button>
  );
}
