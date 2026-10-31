"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { LayoutGrid, RotateCcw } from "lucide-react";
import { buttonClasses } from "@/components/button";
import { Media } from "@/components/media";
import { uiIllustrationMedia } from "./ui-media";

const CONFETTI = ["#c39eb0", "#a8c4b5", "#f2d68f", "#f2b8a0", "#b5cde0", "#cbbde3"];

export function CompletionScreen({ onPlayAgain, summary }: { onPlayAgain: () => void; summary?: string }) {
  const reduce = useReducedMotion();
  const primary = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primary.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="conclusao-titulo"
      className="absolute inset-0 z-40 flex items-center justify-center overflow-hidden bg-sand-50/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {!reduce &&
        Array.from({ length: 22 }, (_, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className="absolute top-0 block rounded-sm"
            style={{
              left: `${(i * 37) % 100}%`,
              width: 8 + (i % 3) * 3,
              height: 12 + (i % 4) * 3,
              background: CONFETTI[i % CONFETTI.length],
            }}
            initial={{ y: -40, rotate: 0, opacity: 0 }}
            animate={{ y: "105vh", rotate: 360 + i * 20, opacity: [0, 1, 1, 0.8] }}
            transition={{ duration: 3.2 + (i % 5) * 0.4, delay: (i % 7) * 0.12, ease: "easeIn" }}
          />
        ))}

      <motion.div
        className="relative w-full max-w-md rounded-5xl bg-white px-6 pb-7 pt-8 text-center shadow-lift ring-1 ring-sand-200 sm:px-10 sm:pb-9"
        initial={{ scale: 0.85, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
      >
        <div className="relative mx-auto -mt-20 flex h-32 w-32 items-center justify-center rounded-full bg-butter-100 ring-8 ring-white sm:h-36 sm:w-36">
          <motion.div
            initial={{ rotate: -12, scale: 0.6 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.25 }}
          >
            <Media media={uiIllustrationMedia("trofeu", "Troféu")} size={88} decorative className="h-20 w-20 sm:h-24 sm:w-24" />
          </motion.div>
          <Media media={uiIllustrationMedia("brilho")} size={36} decorative className="absolute -right-3 top-1 h-9 w-9" />
          <Media media={uiIllustrationMedia("estrela")} size={30} decorative className="absolute -left-4 bottom-3 h-8 w-8" />
        </div>
        <h2 id="conclusao-titulo" className="mt-5 font-display-soft text-3xl font-semibold text-ink sm:text-4xl">
          Parabéns!
          <br />
          Você conseguiu!
        </h2>
        {summary && <p className="mt-2 text-ink-soft">{summary}</p>}
        <div className="mt-7 flex flex-col gap-3">
          <button ref={primary} type="button" onClick={onPlayAgain} className={buttonClasses("primary", "lg", "w-full")}>
            <RotateCcw className="h-5 w-5" aria-hidden />
            Jogar novamente
          </button>
          <Link href="/biblioteca" className={buttonClasses("secondary", "lg", "w-full")}>
            <LayoutGrid className="h-5 w-5" aria-hidden />
            Escolher outro jogo
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
