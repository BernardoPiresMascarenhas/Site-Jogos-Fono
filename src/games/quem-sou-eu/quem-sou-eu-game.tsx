"use client";

import { useMemo, useReducer } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { buttonClasses } from "@/components/button";
import { Media } from "@/components/media";
import { categoryLabel } from "@/content/categories";
import type { QuemSouEuActivity, ResolvedActivity } from "@/content/types";
import { cn } from "@/lib/cn";
import { createRng } from "@/lib/random";
import { GameShell } from "../shared/game-shell";
import { GAME_TYPE_META } from "../meta";
import type { GameProps } from "../shared/types";
import { ActionBar, ListenButton, OptionTile, SuccessBar, type TileState } from "../shared/ui";
import { useFitGrid } from "../shared/use-fit-grid";
import { useRoundFeedback } from "../shared/use-round-feedback";
import { createRiddleRound, initialRiddleState, riddleReducer } from "./engine";

export function QuemSouEuGame({ activity, seed, controls }: GameProps<ResolvedActivity<QuemSouEuActivity>>) {
  const round = useMemo(() => createRiddleRound(activity, controls.difficulty, createRng(seed)), [activity, controls.difficulty, seed]);
  const [state, dispatch] = useReducer(riddleReducer, round.length, initialRiddleState);
  const question = round[state.index];
  const solved = state.solvedId !== null;
  const { feedback, successText } = useRoundFeedback({
    solvedKey: solved ? `${state.index}` : null,
    missNonce: state.missNonce,
    done: state.done,
    missText: state.revealed < question.clues.length ? "Ainda não. Que tal mais uma pista?" : undefined,
  });
  const { ref, grid } = useFitGrid<HTMLDivElement>(question.options.length, 1, 14, 210);
  const visibleClues = question.clues.slice(0, state.revealed);
  const allRevealed = state.revealed >= question.clues.length;

  return (
    <GameShell
      title={GAME_TYPE_META["quem-sou-eu"].label}
      subtitle={categoryLabel(activity.category)}
      instruction="Leia a pista e toque na resposta."
      accent={activity.accent}
      controls={controls}
      progress={{
        current: state.done ? state.total : state.index + (solved ? 1 : 0),
        total: state.total,
        label: `Adivinha ${Math.min(state.index + 1, state.total)} de ${state.total}`,
      }}
      feedback={feedback}
      completed={state.done}
      completionSummary={`Você descobriu ${state.total} adivinhas.`}
      raisedToast
    >
      <div className="flex h-full flex-col items-center px-3 pt-1 sm:px-6">
        <div key={state.index} className="flex w-full max-w-3xl shrink-0 items-stretch gap-3 sm:gap-4">
          {/* Mistério: "?" que vira a resposta */}
          <div className="relative hidden w-[clamp(5.5rem,12vw,8.5rem)] shrink-0 [perspective:800px] sm:block" aria-hidden="true">
            <motion.div
              className="preserve-3d absolute inset-0"
              initial={false}
              animate={{ rotateY: solved ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
            >
              <span className="backface-hidden absolute inset-0 flex items-center justify-center rounded-[1.75rem] bg-sky-600 font-display-soft text-6xl font-semibold text-white shadow-soft ring-4 ring-white">
                ?
              </span>
              <span className="backface-hidden absolute inset-0 flex items-center justify-center rounded-[1.75rem] bg-white shadow-soft ring-4 ring-sage-500 [transform:rotateY(180deg)]">
                <Media media={question.answer.media} size={96} decorative className="h-[72%] w-[72%]" />
              </span>
            </motion.div>
          </div>

          <ol className="flex min-w-0 flex-1 flex-col gap-2" aria-label="Pistas" aria-live="polite">
            <AnimatePresence initial={false}>
              {visibleClues.map((clue, i) => {
                const latest = i === visibleClues.length - 1;
                return (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -16, scale: 0.97 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 340, damping: 26 }}
                    className={cn(
                      "flex items-center gap-3 rounded-[1.5rem] py-2 pl-2 pr-2 shadow-soft ring-1",
                      latest ? "bg-white ring-sky-300" : "bg-white/70 ring-sand-200",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold",
                        latest ? "bg-sky-600 text-white" : "bg-sand-200 text-ink-soft",
                      )}
                    >
                      {i + 1}
                    </span>
                    <p className={cn("min-w-0 flex-1 font-bold leading-snug text-ink", latest ? "text-[clamp(1.05rem,1.3vw+0.7vh+0.4rem,1.6rem)]" : "text-[clamp(0.95rem,1vw+0.5vh+0.35rem,1.2rem)] text-ink-soft")}>
                      {clue}
                    </p>
                    {latest && <ListenButton text={clue} label="Ouvir a pista" className="sm:h-12" />}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
        </div>

        <div ref={ref} className="mt-[clamp(0.6rem,2vh,1.5rem)] flex min-h-0 w-full flex-1 items-center justify-center">
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
            <SuccessBar
              key={state.index}
              message={`${successText(state.index)} ${question.answer.article === "a" || question.answer.article === "as" ? "Era a" : "Era o"} ${question.answer.word.toLocaleLowerCase("pt-BR")}!`}
              last={state.index + 1 >= state.total}
              onNext={() => dispatch({ type: "next" })}
            />
          ) : (
            <button
              type="button"
              onClick={() => dispatch({ type: "reveal", max: question.clues.length })}
              disabled={allRevealed}
              className={buttonClasses("secondary", "lg")}
            >
              <Plus className="h-5 w-5" aria-hidden />
              {allRevealed ? "Todas as pistas já apareceram" : "Mais uma pista"}
              <span className="rounded-full bg-sand-100 px-2 py-0.5 text-sm tabular-nums text-ink-soft">
                {state.revealed}/{question.clues.length}
              </span>
            </button>
          )}
        </ActionBar>
      </div>
    </GameShell>
  );
}
