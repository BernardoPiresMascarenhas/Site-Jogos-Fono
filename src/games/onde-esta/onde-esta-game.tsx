"use client";

import { useEffect, useMemo, useReducer } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Volume2 } from "lucide-react";
import { Media } from "@/components/media";
import type { OndeEstaActivity, ResolvedActivity } from "@/content/types";
import { useSound } from "@/lib/audio/sound-context";
import { cn } from "@/lib/cn";
import { createRng } from "@/lib/random";
import { Burst } from "../shared/burst";
import { GameShell } from "../shared/game-shell";
import { gameTextClass } from "../shared/game-text";
import type { GameProps } from "../shared/types";
import { missMessage, successMessage, useFeedback } from "../shared/use-feedback";
import { useFitGrid } from "../shared/use-fit-grid";
import { createWhereRound, initialWhereState, whereReducer } from "./engine";

/** Tempo para comemorar o acerto antes de avançar para a próxima pergunta. */
const ADVANCE_DELAY_MS = 1500;

export function OndeEstaGame({ activity, seed, controls }: GameProps<ResolvedActivity<OndeEstaActivity>>) {
  const questions = useMemo(
    () => createWhereRound(activity, controls.difficulty, createRng(seed)),
    [activity, controls.difficulty, seed],
  );
  const [state, dispatch] = useReducer(whereReducer, questions.length, initialWhereState);
  const { feedback, show } = useFeedback(1400);
  const { play, say, voice } = useSound();
  const question = questions[state.index];
  const { ref, grid } = useFitGrid<HTMLDivElement>(question.options.length, 1, 16, 260);

  useEffect(() => {
    if (!state.solved) return;
    const last = state.index + 1 >= state.total;
    play(last ? "complete" : "success");
    if (!last) show("success", successMessage(state.index));
    const t = setTimeout(() => dispatch({ type: "next" }), last ? 900 : ADVANCE_DELAY_MS);
    return () => clearTimeout(t);
  }, [state.solved, state.index, state.total, play, show]);

  useEffect(() => {
    if (state.missNonce === 0) return;
    play("error");
    show("miss", missMessage(state.missNonce));
  }, [state.missNonce, play, show]);

  const answer = (id: string) => dispatch({ type: "answer", id, correctId: question.target.id });

  const canSpeak = Boolean(question.audio) || voice === "available" || voice === "unknown";
  const voiceHint =
    voice === "unsupported"
      ? "Este navegador não tem leitura em voz alta."
      : voice === "no-portuguese"
        ? "Não encontramos voz em português neste dispositivo."
        : null;

  const solvedCount = state.index + (state.solved ? 1 : 0);
  const cellWidth = grid?.cellWidth ?? 0;

  return (
    <GameShell
      title={activity.title}
      instruction={activity.instruction}
      accent={activity.accent}
      controls={controls}
      progress={{
        current: state.done ? state.total : solvedCount,
        total: state.total,
        label: `Pergunta ${Math.min(state.index + 1, state.total)} de ${state.total}`,
      }}
      feedback={feedback}
      completed={state.done}
      completionSummary={`Você encontrou ${state.total} imagens.`}
    >
      <div className="flex h-full flex-col items-center px-3 pb-20 pt-1 sm:px-6 sm:pb-24">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={state.index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full max-w-3xl shrink-0 flex-col items-center"
          >
            <div className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-white py-3 pl-6 pr-3 shadow-soft ring-1 ring-sand-200 sm:gap-4 sm:py-4 sm:pl-8">
              <h2
                className={cn(
                  "min-w-0 flex-1 text-center font-extrabold leading-tight text-ink text-[clamp(1.35rem,2.2vw+1vh+0.5rem,2.75rem)]",
                  gameTextClass,
                )}
                aria-live="polite"
              >
                {question.prompt}
              </h2>
              <button
                type="button"
                onClick={() => say(question.prompt, question.audio)}
                disabled={!canSpeak}
                aria-label="Ouvir a pergunta"
                title={voiceHint ?? "Ouvir a pergunta"}
                className="flex h-14 shrink-0 items-center gap-2 rounded-2xl bg-rose-700 px-4 font-bold text-white shadow-[0_5px_0_-1px_var(--color-rose-800)] transition hover:bg-rose-800 active:translate-y-[3px] active:shadow-[0_2px_0_-1px_var(--color-rose-800)] disabled:bg-sand-300 disabled:text-ink-soft disabled:shadow-none sm:h-16 sm:px-5"
              >
                <Volume2 className="h-6 w-6" aria-hidden />
                <span className="hidden sm:inline">Ouvir</span>
              </button>
            </div>
            {voiceHint && !question.audio && <p className="mt-2 text-center text-xs text-ink-faint">{voiceHint}</p>}
          </motion.div>
        </AnimatePresence>

        <div ref={ref} className="mt-[clamp(0.75rem,2.5vh,2rem)] flex min-h-0 w-full flex-1 items-center justify-center">
          <div
            key={state.index}
            role="group"
            aria-label="Alternativas"
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${grid?.cols ?? 3}, ${cellWidth ? `${cellWidth}px` : "minmax(0, 10rem)"})`,
              visibility: grid ? "visible" : "hidden",
            }}
          >
            {question.options.map((option, i) => {
              const correct = state.solved && option.id === question.target.id;
              const wrong = state.wrong.includes(option.id);
              const dimmed = state.solved && !correct;
              return (
                <motion.button
                  key={option.id}
                  type="button"
                  onClick={() => answer(option.id)}
                  aria-label={option.media.alt}
                  aria-disabled={state.solved || wrong || undefined}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: dimmed ? 0.45 : wrong ? 0.55 : 1, scale: correct ? 1.06 : 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 24, delay: state.solved || wrong ? 0 : i * 0.05 }}
                  className={cn(
                    "relative flex aspect-square items-center justify-center rounded-[clamp(1.25rem,3vw,2.25rem)] bg-white shadow-soft ring-4 transition-shadow",
                    correct ? "z-10 bg-sage-50 shadow-lift ring-sage-500" : wrong ? "ring-peach-300" : "ring-white hover:shadow-lift hover:ring-rose-200",
                    wrong && state.wrong[state.wrong.length - 1] === option.id && "animate-[gentle-shake_0.4s_ease-in-out]",
                    (state.solved || wrong) && "cursor-default",
                  )}
                >
                  <Media media={option.media} size={160} decorative className="h-[70%] w-[70%]" />
                  {correct && (
                    <>
                      <span className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-sage-600 text-white shadow-soft ring-4 ring-white" aria-hidden="true">
                        <Check className="h-5 w-5" strokeWidth={3.5} />
                      </span>
                      <Burst radius={cellWidth * 0.75 || 90} count={12} />
                    </>
                  )}
                  {wrong && (
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-peach-100 px-2.5 py-0.5 text-xs font-bold text-peach-700" aria-hidden="true">
                      Tente outra
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </GameShell>
  );
}
