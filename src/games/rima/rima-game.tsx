"use client";

import { useMemo, useReducer } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Media } from "@/components/media";
import type { ResolvedActivity, RimaActivity } from "@/content/types";
import { cn } from "@/lib/cn";
import { createRng } from "@/lib/random";
import { choiceReducer, initialChoiceState } from "../shared/bank";
import { GameShell } from "../shared/game-shell";
import { gameTextClass } from "../shared/game-text";
import { GAME_TYPE_META } from "../meta";
import type { GameProps } from "../shared/types";
import { ActionBar, ListenButton, OptionTile, SuccessBar, type TileState } from "../shared/ui";
import { useFitGrid } from "../shared/use-fit-grid";
import { useRoundFeedback } from "../shared/use-round-feedback";
import { createRhymeRound } from "./engine";

export function RimaGame({ activity, seed, controls }: GameProps<ResolvedActivity<RimaActivity>>) {
  const round = useMemo(() => createRhymeRound(activity, controls.difficulty, createRng(seed)), [activity, controls.difficulty, seed]);
  const [state, dispatch] = useReducer(choiceReducer, round.length, initialChoiceState);
  const question = round[state.index];
  const solved = state.solvedId !== null;
  const { feedback, successText } = useRoundFeedback({
    solvedKey: solved ? `${state.index}` : null,
    missNonce: state.missNonce,
    done: state.done,
    missText: "Hmm, essa não rima. Fale as duas palavras e escute o final.",
  });
  const { ref, grid } = useFitGrid<HTMLDivElement>(question.options.length, 1, 14, 210);
  const target = question.target;
  const lower = (w: string) => w.toLocaleLowerCase("pt-BR");

  return (
    <GameShell
      title={GAME_TYPE_META.rima.label}
      instruction="Toque na figura que rima com a palavra do topo."
      accent={activity.accent}
      controls={controls}
      progress={{
        current: state.done ? state.total : state.index + (solved ? 1 : 0),
        total: state.total,
        label: `Rima ${Math.min(state.index + 1, state.total)} de ${state.total}`,
      }}
      feedback={feedback}
      completed={state.done}
      completionSummary={`Você encontrou ${state.total} rimas.`}
      raisedToast
    >
      <div className="flex h-full flex-col items-center px-3 pt-1 sm:px-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={state.index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "flex w-full max-w-3xl shrink-0 items-center gap-3 rounded-[2rem] py-2.5 pl-2.5 pr-3 shadow-soft ring-1 transition-colors sm:gap-5 sm:py-3",
              solved ? "bg-sage-50 ring-sage-300" : "bg-white ring-sand-200",
            )}
          >
            <span className="flex h-[clamp(4rem,11vh,6.5rem)] w-[clamp(4rem,11vh,6.5rem)] shrink-0 items-center justify-center rounded-[1.5rem] bg-peach-100">
              <Media media={target.media} size={104} decorative className="h-[78%] w-[78%]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink-soft sm:text-base">Qual palavra rima com</p>
              <h2 className={cn("font-extrabold leading-tight text-ink text-[clamp(1.5rem,2.4vw+1vh+0.4rem,3rem)]", gameTextClass)} aria-live="polite">
                {solved ? (
                  <span className="flex flex-wrap items-baseline gap-x-3">
                    <RhymeWord word={target.word} />
                    <span className="text-[0.6em] font-bold text-ink-faint">rima com</span>
                    <RhymeWord word={question.answer.word} delay={0.2} />
                  </span>
                ) : (
                  <>{target.word}?</>
                )}
              </h2>
            </div>
            <ListenButton
              text={solved ? `${lower(target.word)}, ${lower(question.answer.word)}` : lower(target.word)}
              audio={solved ? undefined : target.audio}
              label={solved ? "Ouvir as duas palavras" : "Ouvir a palavra"}
            />
          </motion.div>
        </AnimatePresence>

        <div ref={ref} className="mt-[clamp(0.75rem,2.5vh,1.75rem)] flex min-h-0 w-full flex-1 items-center justify-center">
          <div
            key={state.index}
            role="group"
            aria-label="Alternativas"
            className="grid gap-3.5"
            style={{
              gridTemplateColumns: `repeat(${grid?.cols ?? 3}, ${grid?.cellWidth ? `${grid.cellWidth}px` : "minmax(0, 9rem)"})`,
              visibility: grid ? "visible" : "hidden",
            }}
          >
            {question.options.map((option, i) => {
              const isAnswer = option.id === question.answer.id;
              const wrong = state.wrong.includes(option.id);
              const tile: TileState = solved ? (isAnswer ? "correct" : "dimmed") : wrong ? "wrong" : "idle";
              return (
                <OptionTile
                  key={option.id}
                  media={option.media}
                  label={option.word}
                  showLabel
                  state={tile}
                  index={i}
                  width={grid?.cellWidth || 130}
                  shake={wrong && state.wrong.at(-1) === option.id}
                  disabled={solved || wrong}
                  onClick={() => dispatch({ type: "answer", id: option.id, correctIds: [question.answer.id] })}
                />
              );
            })}
          </div>
        </div>

        <ActionBar>
          {solved ? (
            <SuccessBar key={state.index} message={successText(state.index)} last={state.index + 1 >= state.total} onNext={() => dispatch({ type: "next" })} />
          ) : (
            <p className="text-center text-sm font-semibold text-ink-faint">Dica: fale as duas palavras em voz alta e escute como terminam.</p>
          )}
        </ActionBar>
      </div>
    </GameShell>
  );
}

/** Palavra que "pula" ao ser destacada como rima. */
function RhymeWord({ word, delay = 0 }: { word: string; delay?: number }) {
  return (
    <motion.span
      className="inline-block rounded-2xl bg-sage-100 px-2.5 text-sage-800 ring-2 ring-sage-300"
      initial={{ scale: 0.8, y: 6 }}
      animate={{ scale: [0.8, 1.12, 1], y: 0 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {word}
    </motion.span>
  );
}
