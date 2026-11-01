"use client";

import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { ArrowLeft, RotateCcw, SlidersHorizontal, Volume2, VolumeX } from "lucide-react";
import { ACCENTS } from "@/config/accents";
import { DIFFICULTIES, DIFFICULTY_LABEL, type AccentKey, type Availability, type Difficulty } from "@/content/types";
import { useSound } from "@/lib/audio/sound-context";
import { cn } from "@/lib/cn";
import { CompletionScreen } from "./completion-screen";
import { FeedbackToast } from "./feedback-toast";
import type { GameControls } from "./types";
import type { Feedback } from "./use-feedback";

interface GameShellProps {
  title: string;
  instruction: string;
  accent: AccentKey;
  controls: GameControls;
  progress: { current: number; total: number; label: string };
  feedback: Feedback | null;
  completed: boolean;
  completionSummary?: string;
  /** Categoria ou pacote (exibido ao lado do título). */
  subtitle?: string;
  /** Controles extras na linha da instrução (ex.: revelação para a profissional). */
  tools?: React.ReactNode;
  /** Sobe o aviso de acerto/erro para não cobrir a barra de ações do jogo. */
  raisedToast?: boolean;
  children: React.ReactNode;
}

/**
 * Moldura comum a todos os jogos: voltar, título, nível, som, reiniciar,
 * instrução, progresso, área do jogo, feedback e tela de conclusão.
 */
export function GameShell({
  title,
  instruction,
  accent,
  controls,
  progress,
  feedback,
  completed,
  completionSummary,
  subtitle,
  tools,
  raisedToast,
  children,
}: GameShellProps) {
  const colors = ACCENTS[accent];
  return (
    <div className={cn("relative flex h-dvh flex-col overflow-hidden", colors.tint)}>
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <header className="relative z-20 flex h-16 shrink-0 items-center gap-1.5 px-3 sm:h-[4.5rem] sm:gap-3 sm:px-5">
        <Link
          href="/biblioteca"
          className="flex h-11 shrink-0 items-center gap-2 rounded-2xl bg-white px-3 font-bold text-ink shadow-soft ring-1 ring-sand-200 transition hover:ring-rose-300 sm:h-12 sm:px-4"
          aria-label="Voltar para a biblioteca"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
          <span className="hidden md:inline">Voltar</span>
        </Link>
        <div className="flex min-w-0 flex-1 items-baseline gap-2 px-1">
          <h1 className="min-w-0 truncate font-display-soft text-lg font-semibold text-ink sm:text-2xl">{title}</h1>
          {subtitle && (
            <span className="hidden shrink-0 rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider text-ink-soft ring-1 ring-sand-200 lg:inline">
              {subtitle}
            </span>
          )}
        </div>
        <DifficultyControl value={controls.difficulty} onChange={controls.onDifficultyChange} availability={controls.availability} />
        <SoundButton />
        {controls.settingsHref && (
          <Link
            href={controls.settingsHref}
            aria-label="Configurar atividade"
            title="Configurar atividade"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-ink shadow-soft ring-1 ring-sand-200 transition hover:ring-rose-300 active:scale-95 sm:h-12 sm:w-12"
          >
            <SlidersHorizontal className="h-5 w-5" aria-hidden />
          </Link>
        )}
        <IconButton label="Reiniciar jogo" onClick={controls.onRestart}>
          <RotateCcw className="h-5 w-5" aria-hidden />
        </IconButton>
      </header>

      <div className="relative z-10 flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pb-2 sm:px-6 sm:pb-3">
        <p className="text-base font-bold text-ink-soft sm:text-lg">{instruction}</p>
        <div className="flex items-center gap-3">
          {tools}
          <ProgressDots {...progress} accentClass={colors.solid} />
        </div>
      </div>

      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto">{children}</main>

      <FeedbackToast feedback={completed ? null : feedback} raised={raisedToast} />
      <AnimatePresence>
        {completed && <CompletionScreen onPlayAgain={controls.onRestart} summary={completionSummary} />}
      </AnimatePresence>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
  pressed,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-ink shadow-soft ring-1 ring-sand-200 transition hover:ring-rose-300 active:scale-95 sm:h-12 sm:w-12"
    >
      {children}
    </button>
  );
}

function SoundButton() {
  const { enabled, toggle } = useSound();
  return (
    <IconButton label={enabled ? "Desligar sons" : "Ligar sons"} onClick={toggle} pressed={!enabled}>
      {enabled ? <Volume2 className="h-5 w-5" aria-hidden /> : <VolumeX className="h-5 w-5 text-ink-faint" aria-hidden />}
    </IconButton>
  );
}

function DifficultyControl({
  value,
  onChange,
  availability,
}: {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
  availability?: Availability;
}) {
  return (
    <>
      <div
        role="radiogroup"
        aria-label="Nível de dificuldade"
        className="hidden h-12 shrink-0 items-center gap-1 rounded-2xl bg-white p-1 shadow-soft ring-1 ring-sand-200 md:flex"
      >
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={value === d}
            disabled={Boolean(availability?.[d]) && value !== d}
            title={availability?.[d] ?? undefined}
            onClick={() => value !== d && onChange(d)}
            className={cn(
              "h-10 rounded-xl px-3.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:text-ink-faint disabled:line-through",
              value === d ? "bg-navy-600 text-white" : "text-ink-soft hover:bg-sand-100 hover:text-ink",
            )}
          >
            {DIFFICULTY_LABEL[d]}
          </button>
        ))}
      </div>
      <label className="relative shrink-0 md:hidden">
        <span className="sr-only">Nível de dificuldade</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as Difficulty)}
          className="h-11 appearance-none rounded-2xl bg-white pl-3 pr-8 text-sm font-bold text-ink shadow-soft ring-1 ring-sand-200 sm:h-12"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d} disabled={Boolean(availability?.[d]) && value !== d}>
              {DIFFICULTY_LABEL[d]}
              {availability?.[d] && value !== d ? " (indisponível)" : ""}
            </option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </label>
    </>
  );
}

function ProgressDots({
  current,
  total,
  label,
  accentClass,
}: {
  current: number;
  total: number;
  label: string;
  accentClass: string;
}) {
  return (
    <div className="flex items-center gap-3" role="status" aria-label={label}>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-3 rounded-full transition-all duration-500 ease-out",
              i < current ? cn(accentClass, "w-6") : "w-3 bg-white ring-1 ring-sand-300",
            )}
          />
        ))}
      </div>
      <span className="text-sm font-extrabold tabular-nums text-ink-soft" aria-hidden="true">
        {current}/{total}
      </span>
    </div>
  );
}
