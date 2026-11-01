"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Eye, EyeOff, Flag, Volume2 } from "lucide-react";
import { buttonClasses } from "@/components/button";
import { Media } from "@/components/media";
import type { Media as MediaData } from "@/content/types";
import { useSound } from "@/lib/audio/sound-context";
import { cn } from "@/lib/cn";
import { Burst } from "./burst";
import { gameTextClass } from "./game-text";

/* ------------------------------------------------------------------ */
/* Cartão da pergunta                                                  */
/* ------------------------------------------------------------------ */

export function PromptCard({
  children,
  aside,
  className,
  tone = "default",
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  tone?: "default" | "success";
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center gap-3 rounded-[2rem] py-3 pl-5 pr-3 shadow-soft ring-1 transition-colors duration-500 sm:gap-4 sm:py-4 sm:pl-7",
        tone === "success" ? "bg-sage-50 ring-sage-300" : "bg-white ring-sand-200",
        !aside && "pr-5 sm:pr-7",
        className,
      )}
    >
      <div className="min-w-0 flex-1 text-center">{children}</div>
      {aside}
    </div>
  );
}

/** Texto principal da pergunta, com tamanho fluido. */
export function PromptText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={cn("font-extrabold leading-tight text-ink text-[clamp(1.2rem,1.8vw+0.9vh+0.45rem,2.4rem)]", className)}
      aria-live="polite"
    >
      {children}
    </h2>
  );
}

/* ------------------------------------------------------------------ */
/* Áudio                                                               */
/* ------------------------------------------------------------------ */

/**
 * Botão "Ouvir". Só aparece quando realmente consegue tocar algo:
 *  - há uma gravação cadastrada; ou
 *  - (se permitido) o navegador tem voz em português.
 * `recordedOnly` impede o uso da voz sintética (jogos de discriminação fonêmica).
 */
export function ListenButton({
  text,
  audio,
  label = "Ouvir",
  recordedOnly = false,
  size = "md",
  className,
}: {
  text: string;
  audio?: string;
  label?: string;
  recordedOnly?: boolean;
  size?: "md" | "lg";
  className?: string;
}) {
  const { say, voice } = useSound();
  const synthOk = !recordedOnly && (voice === "available" || voice === "unknown");
  if (!audio && !synthOk) return null;
  return (
    <button
      type="button"
      onClick={() => say(text, audio)}
      aria-label={label}
      title={label}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-2xl bg-teal-700 font-bold text-white shadow-[0_5px_0_-1px_var(--color-teal-800)] transition hover:bg-teal-800 active:translate-y-[3px] active:shadow-[0_2px_0_-1px_var(--color-teal-800)]",
        size === "lg" ? "h-16 px-5 text-lg" : "h-12 px-4 sm:h-14",
        className,
      )}
    >
      <Volume2 className="h-6 w-6" aria-hidden />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Alternativa com imagem                                              */
/* ------------------------------------------------------------------ */

export type TileState = "idle" | "correct" | "wrong" | "dimmed" | "selected" | "missed";

export function OptionTile({
  media,
  label,
  showLabel = false,
  state,
  width,
  index = 0,
  shake,
  onClick,
  disabled,
  ariaLabel,
  pressed,
}: {
  media: MediaData;
  label: string;
  showLabel?: boolean;
  state: TileState;
  width: number;
  index?: number;
  shake?: boolean;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  /** Para seleção múltipla (botão alternável). */
  pressed?: boolean;
}) {
  const fontSize = Math.max(12, Math.min(22, width / Math.max(6, label.length * 0.75)));
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      aria-pressed={pressed}
      aria-disabled={disabled || undefined}
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{
        opacity: state === "dimmed" ? 0.42 : state === "wrong" ? 0.6 : 1,
        scale: state === "correct" ? 1.05 : state === "selected" ? 0.96 : 1,
        y: 0,
      }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      transition={{ type: "spring", stiffness: 380, damping: 24, delay: state === "idle" ? index * 0.04 : 0 }}
      className={cn(
        "relative flex aspect-square flex-col items-center justify-center gap-[4%] rounded-[clamp(1.1rem,2.6vw,2rem)] bg-white shadow-soft ring-4 transition-shadow",
        state === "correct" && "z-10 bg-sage-50 shadow-lift ring-sage-500",
        state === "wrong" && "ring-peach-300",
        state === "selected" && "bg-sky-100/60 ring-sky-600",
        state === "missed" && "ring-sage-500 [outline:3px_dashed_var(--color-sage-600)] outline-offset-4",
        (state === "idle" || state === "dimmed") && "ring-white hover:shadow-lift hover:ring-rose-200",
        shake && "animate-[gentle-shake_0.4s_ease-in-out]",
        disabled && "cursor-default",
      )}
      style={{ width }}
    >
      <Media media={media} size={160} decorative className={showLabel ? "h-[56%] w-[56%]" : "h-[70%] w-[70%]"} />
      {showLabel && (
        <span className={cn("max-w-[92%] truncate font-extrabold text-ink", gameTextClass)} style={{ fontSize }}>
          {label}
        </span>
      )}
      {state === "correct" && (
        <>
          <Badge className="bg-sage-600 text-white">
            <Check className="h-5 w-5" strokeWidth={3.5} />
          </Badge>
          <Burst radius={width * 0.75} count={12} />
        </>
      )}
      {state === "selected" && (
        <Badge className="bg-sky-600 text-white">
          <Check className="h-5 w-5" strokeWidth={3.5} />
        </Badge>
      )}
      {state === "missed" && (
        <Badge className="bg-white text-sage-700 ring-2 ring-sage-500">
          <Flag className="h-4 w-4" strokeWidth={3} />
        </Badge>
      )}
      {state === "wrong" && (
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-peach-100 px-2.5 py-0.5 text-xs font-bold text-peach-700" aria-hidden="true">
          Tente outra
        </span>
      )}
    </motion.button>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full shadow-soft ring-4 ring-white", className)} aria-hidden="true">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Barra de ações                                                      */
/* ------------------------------------------------------------------ */

/** Faixa inferior de altura estável para botões como Conferir e Próxima. */
export function ActionBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-[4.75rem] w-full shrink-0 flex-wrap items-center justify-center gap-3 px-3 pb-3 pt-2 sm:min-h-[5.5rem] sm:pb-5", className)}>
      {children}
    </div>
  );
}

/** Mensagem de acerto + botão para continuar (recebe o foco). */
export function SuccessBar({ message, onNext, last, extra }: { message: string; onNext: () => void; last: boolean; extra?: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <motion.div
      className="flex flex-wrap items-center justify-center gap-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <span className="flex items-center gap-2 rounded-full bg-sage-600 px-4 py-2.5 text-lg font-extrabold text-white shadow-soft" role="status">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25">
          <Check className="h-4 w-4" strokeWidth={3.5} aria-hidden />
        </span>
        {message}
      </span>
      {extra}
      <button ref={ref} type="button" onClick={onNext} className={buttonClasses("primary", "lg")}>
        {last ? "Concluir" : "Próxima"}
        <ArrowRight className="h-5 w-5" aria-hidden />
      </button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Revelação discreta para a profissional                              */
/* ------------------------------------------------------------------ */

/**
 * Mostra uma informação só quando a profissional pede (ex.: palavra-alvo).
 * Fica escondida por padrão e volta a se esconder quando `resetKey` muda.
 * Não é uma "tela separada": criança e profissional olham o mesmo aparelho.
 */
export function ProfessionalReveal({ label, children, resetKey }: { label: string; children: React.ReactNode; resetKey: string | number }) {
  const [open, setOpen] = useState(false);
  const [lastKey, setLastKey] = useState(resetKey);
  if (lastKey !== resetKey) {
    setLastKey(resetKey);
    setOpen(false);
  }
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-11 items-center gap-2 rounded-2xl bg-white/80 px-3 text-sm font-bold text-ink-soft ring-1 ring-sand-300 transition hover:text-ink hover:ring-rose-300"
      >
        {open ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        {open ? "Esconder" : label}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-[calc(100%+0.5rem)] z-30 min-w-[13rem] rounded-2xl bg-ink px-4 py-3 text-white shadow-lift"
            role="note"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
