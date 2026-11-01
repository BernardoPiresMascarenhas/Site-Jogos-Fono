"use client";

import { useMemo, useReducer } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { Media } from "@/components/media";
import { categoryLabel } from "@/content/categories";
import type { ResolvedActivity, SilabasActivity } from "@/content/types";
import { cn } from "@/lib/cn";
import { createRng } from "@/lib/random";
import { choiceReducer, initialChoiceState } from "../shared/bank";
import { Burst } from "../shared/burst";
import { GameShell } from "../shared/game-shell";
import { gameTextClass } from "../shared/game-text";
import { GAME_TYPE_META } from "../meta";
import type { GameProps } from "../shared/types";
import { ActionBar, ListenButton, SuccessBar } from "../shared/ui";
import { useRoundFeedback } from "../shared/use-round-feedback";
import { createSyllableRound } from "./engine";

const SYLLABLE_COLORS = ["bg-rose-100 text-rose-800 ring-rose-300", "bg-sage-100 text-sage-800 ring-sage-300", "bg-butter-100 text-butter-700 ring-butter-300", "bg-sky-100 text-sky-700 ring-sky-300", "bg-lilac-100 text-lilac-700 ring-lilac-300"];

export function SilabasGame({ activity, seed, controls }: GameProps<ResolvedActivity<SilabasActivity>>) {
  const round = useMemo(() => createSyllableRound(activity, controls.difficulty, createRng(seed)), [activity, controls.difficulty, seed]);
  const [state, dispatch] = useReducer(choiceReducer, round.length, initialChoiceState);
  const question = round[state.index];
  const solved = state.solvedId !== null;
  const { feedback, successText } = useRoundFeedback({
    solvedKey: solved ? `${state.index}` : null,
    missNonce: state.missNonce,
    done: state.done,
    missText: "Quase! Bata palmas a cada pedacinho e conte de novo.",
  });
  const word = question.concept.word;

  return (
    <GameShell
      title={GAME_TYPE_META.silabas.label}
      subtitle={categoryLabel(activity.category)}
      instruction="Fale a palavra batendo palmas e conte os pedacinhos."
      accent={activity.accent}
      controls={controls}
      progress={{
        current: state.done ? state.total : state.index + (solved ? 1 : 0),
        total: state.total,
        label: `Palavra ${Math.min(state.index + 1, state.total)} de ${state.total}`,
      }}
      feedback={feedback}
      completed={state.done}
      completionSummary={`Você contou as sílabas de ${state.total} palavras.`}
      raisedToast
    >
      <div className="flex h-full flex-col items-center px-3 pt-1 sm:px-6">
        <div className="flex min-h-0 w-full max-w-3xl flex-1 flex-col items-center justify-center gap-[clamp(0.75rem,3vh,2rem)]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={state.index}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="relative flex w-full flex-col items-center gap-[clamp(0.5rem,2vh,1.25rem)] rounded-[2.25rem] bg-white px-4 py-[clamp(0.75rem,3vh,2rem)] shadow-soft ring-1 ring-sand-200"
            >
              <div className="relative flex h-[clamp(5rem,20vh,11rem)] w-[clamp(5rem,20vh,11rem)] items-center justify-center rounded-[2rem] bg-rose-50">
                <Media media={question.concept.media} size={176} decorative className="h-[80%] w-[80%]" />
                {solved && <Burst radius={110} count={14} />}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {solved ? (
                  <p className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2" aria-label={`Sílabas: ${question.syllables.join(", ")}`}>
                    {question.syllables.map((syl, i) => (
                      <motion.span key={i} className="flex items-center gap-1.5 sm:gap-2" initial={{ opacity: 0, y: 14, scale: 0.7 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.25 * i, type: "spring", stiffness: 420, damping: 18 }}>
                        <span className={cn("rounded-2xl px-3 py-1.5 font-extrabold ring-2 text-[clamp(1.6rem,3vw+1.5vh,3.25rem)] leading-none", SYLLABLE_COLORS[i % SYLLABLE_COLORS.length], gameTextClass)}>
                          {syl}
                        </span>
                        {i < question.syllables.length - 1 && <span className="text-2xl font-extrabold text-ink-faint" aria-hidden="true">-</span>}
                      </motion.span>
                    ))}
                  </p>
                ) : (
                  <h2 className={cn("font-extrabold leading-none text-ink text-[clamp(1.8rem,3.5vw+1.5vh,3.75rem)]", gameTextClass)}>{word}</h2>
                )}
                <ListenButton text={word} audio={question.concept.audio} label="Ouvir a palavra" />
              </div>
            </motion.div>
          </AnimatePresence>

          <div role="group" aria-label="Quantas sílabas?" className="flex flex-wrap items-center justify-center gap-[clamp(0.6rem,2vw,1.25rem)]">
            {question.choices.map((n) => {
              const id = String(n);
              const correct = solved && n === question.count;
              const wrong = state.wrong.includes(id);
              return (
                <motion.button
                  key={`${state.index}-${n}`}
                  type="button"
                  onClick={() => dispatch({ type: "answer", id, correctIds: [String(question.count)] })}
                  aria-label={`${n} ${n === 1 ? "sílaba" : "sílabas"}`}
                  aria-disabled={solved || wrong || undefined}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: solved && !correct ? 0.4 : wrong ? 0.55 : 1, y: 0, scale: correct ? 1.08 : 1 }}
                  whileTap={solved || wrong ? undefined : { scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 380, damping: 24 }}
                  className={cn(
                    "relative flex h-[clamp(4.5rem,13vh,7rem)] w-[clamp(4.5rem,13vh,7rem)] flex-col items-center justify-center gap-1 rounded-[1.75rem] bg-white shadow-soft ring-4 transition-shadow",
                    correct ? "bg-sage-50 ring-sage-500" : wrong ? "animate-[gentle-shake_0.4s_ease-in-out] ring-peach-300" : "ring-white hover:shadow-lift hover:ring-rose-200",
                  )}
                >
                  <span className="font-display-soft text-[clamp(1.75rem,3vw+1vh,3rem)] font-semibold leading-none text-ink">{n}</span>
                  <span className="flex gap-1" aria-hidden="true">
                    {Array.from({ length: n }, (_, i) => (
                      <span key={i} className={cn("h-2 w-2 rounded-full", correct ? "bg-sage-600" : "bg-rose-400")} />
                    ))}
                  </span>
                  {correct && (
                    <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-sage-600 text-white ring-4 ring-white" aria-hidden="true">
                      <Check className="h-5 w-5" strokeWidth={3.5} />
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        <ActionBar>
          {solved ? (
            <SuccessBar
              key={state.index}
              message={`${successText(state.index)} ${question.count} ${question.count === 1 ? "sílaba" : "sílabas"}.`}
              last={state.index + 1 >= state.total}
              onNext={() => dispatch({ type: "next" })}
            />
          ) : (
            <p className="text-center text-sm font-semibold text-ink-faint">Sem pressa: explore a palavra quantas vezes quiser.</p>
          )}
        </ActionBar>
      </div>
    </GameShell>
  );
}
