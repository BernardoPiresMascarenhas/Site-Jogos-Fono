"use client";

import { useMemo, useReducer, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Lightbulb } from "lucide-react";
import { buttonClasses } from "@/components/button";
import { categoryLabel } from "@/content/categories";
import type { IntrusoActivity, ResolvedActivity } from "@/content/types";
import { createRng } from "@/lib/random";
import { choiceReducer, initialChoiceState } from "../shared/bank";
import { GameShell } from "../shared/game-shell";
import { GAME_TYPE_META } from "../meta";
import type { GameProps } from "../shared/types";
import { ActionBar, ListenButton, OptionTile, PromptCard, PromptText, SuccessBar, type TileState } from "../shared/ui";
import { useFitGrid } from "../shared/use-fit-grid";
import { useRoundFeedback } from "../shared/use-round-feedback";
import { createIntrusoRound } from "./engine";

export function IntrusoGame({ activity, seed, controls }: GameProps<ResolvedActivity<IntrusoActivity>>) {
  const round = useMemo(() => createIntrusoRound(activity, controls.difficulty, createRng(seed)), [activity, controls.difficulty, seed]);
  const [state, dispatch] = useReducer(choiceReducer, round.length, initialChoiceState);
  const [explain, setExplain] = useState<number | null>(null);
  const question = round[state.index];
  const solved = state.solvedId !== null;
  const { feedback, successText } = useRoundFeedback({
    solvedKey: solved ? `${state.index}` : null,
    missNonce: state.missNonce,
    done: state.done,
  });
  const { ref, grid } = useFitGrid<HTMLDivElement>(question.options.length, 1, 16, 240);
  const showExplanation = solved && explain === state.index;
  const meta = GAME_TYPE_META.intruso;

  return (
    <GameShell
      title={meta.label}
      subtitle={categoryLabel(activity.category)}
      instruction="Toque na imagem que não combina com as outras."
      accent={activity.accent}
      controls={controls}
      progress={{
        current: state.done ? state.total : state.index + (solved ? 1 : 0),
        total: state.total,
        label: `Desafio ${Math.min(state.index + 1, state.total)} de ${state.total}`,
      }}
      feedback={feedback}
      completed={state.done}
      completionSummary={`Você encontrou ${state.total} intrusos.`}
      raisedToast
    >
      <div className="flex h-full flex-col items-center px-3 pt-1 sm:px-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${state.index}-${showExplanation}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-3xl shrink-0"
          >
            <PromptCard
              tone={showExplanation ? "success" : "default"}
              aside={<ListenButton text={showExplanation ? question.explanation : question.prompt} label={showExplanation ? "Ouvir a explicação" : "Ouvir a pergunta"} />}
            >
              <PromptText className={showExplanation ? "text-[clamp(1.05rem,1.4vw+0.8vh+0.4rem,1.9rem)]" : undefined}>
                {showExplanation ? question.explanation : question.prompt}
              </PromptText>
            </PromptCard>
          </motion.div>
        </AnimatePresence>

        <div ref={ref} className="mt-[clamp(0.75rem,2.5vh,1.75rem)] flex min-h-0 w-full flex-1 items-center justify-center">
          <div
            key={state.index}
            role="group"
            aria-label="Imagens do grupo"
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${grid?.cols ?? 3}, ${grid?.cellWidth ? `${grid.cellWidth}px` : "minmax(0, 10rem)"})`,
              visibility: grid ? "visible" : "hidden",
            }}
          >
            {question.options.map((option, i) => {
              const isAnswer = option.id === question.intruder.id;
              const wrong = state.wrong.includes(option.id);
              const tile: TileState = solved ? (isAnswer ? "correct" : "dimmed") : wrong ? "wrong" : "idle";
              return (
                <OptionTile
                  key={option.id}
                  media={option.media}
                  label={option.word}
                  showLabel={solved}
                  state={tile}
                  index={i}
                  width={grid?.cellWidth || 140}
                  shake={wrong && state.wrong.at(-1) === option.id}
                  disabled={solved || wrong}
                  onClick={() => dispatch({ type: "answer", id: option.id, correctIds: [question.intruder.id] })}
                />
              );
            })}
          </div>
        </div>

        <ActionBar>
          {solved ? (
            <SuccessBar
              key={state.index}
              message={successText(state.index)}
              last={state.index + 1 >= state.total}
              onNext={() => dispatch({ type: "next" })}
              extra={
                !showExplanation && (
                  <button type="button" onClick={() => setExplain(state.index)} className={buttonClasses("secondary", "lg")}>
                    <Lightbulb className="h-5 w-5" aria-hidden />
                    Por quê?
                  </button>
                )
              }
            />
          ) : (
            <p className="text-center text-sm font-semibold text-ink-faint">Se errar, é só tentar outra imagem.</p>
          )}
        </ActionBar>
      </div>
    </GameShell>
  );
}
