"use client";

import { useMemo, useReducer } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCheck } from "lucide-react";
import { buttonClasses } from "@/components/button";
import { Media } from "@/components/media";
import type { ResolvedActivity, SomInicialActivity } from "@/content/types";
import { cn } from "@/lib/cn";
import { createRng } from "@/lib/random";
import { GameShell } from "../shared/game-shell";
import { gameTextClass } from "../shared/game-text";
import { GAME_TYPE_META } from "../meta";
import type { GameProps } from "../shared/types";
import { ActionBar, ListenButton, OptionTile, SuccessBar, type TileState } from "../shared/ui";
import { useFitGrid } from "../shared/use-fit-grid";
import { useRoundFeedback } from "../shared/use-round-feedback";
import { createSoundRound, initialSoundState, soundReducer } from "./engine";

export function SomInicialGame({ activity, seed, controls, options }: GameProps<ResolvedActivity<SomInicialActivity>>) {
  const round = useMemo(() => createSoundRound(activity, controls.difficulty, createRng(seed)), [activity, controls.difficulty, seed]);
  const [state, dispatch] = useReducer(soundReducer, round.length, initialSoundState);
  const question = round[state.index];
  const showNames = options.nomes !== "ocultar";
  const check = state.checked;
  const missText = check
    ? check.wrong.length && check.missed.length
      ? "Quase! Tem figura sobrando e figura faltando."
      : check.wrong.length
        ? "Quase! Alguma figura marcada não começa com esse som."
        : "Quase! Ainda falta encontrar figura."
    : undefined;
  const { feedback, successText } = useRoundFeedback({
    solvedKey: state.solved ? `${state.index}` : null,
    missNonce: state.missNonce,
    done: state.done,
    missText,
  });
  const { ref, grid } = useFitGrid<HTMLDivElement>(question.options.length, showNames ? 1 : 1, 14, 200);
  const example = question.example;

  return (
    <GameShell
      title={GAME_TYPE_META["som-inicial"].label}
      instruction="Marque todas as figuras que começam com este som."
      accent={activity.accent}
      controls={controls}
      progress={{
        current: state.done ? state.total : state.index + (state.solved ? 1 : 0),
        total: state.total,
        label: `Som ${Math.min(state.index + 1, state.total)} de ${state.total}`,
      }}
      feedback={feedback}
      completed={state.done}
      completionSummary={`Você caçou ${state.total} sons.`}
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
              "flex w-full max-w-3xl shrink-0 items-center gap-3 rounded-[2rem] py-2.5 pl-2.5 pr-4 shadow-soft ring-1 transition-colors sm:gap-5",
              state.solved ? "bg-sage-50 ring-sage-300" : "bg-white ring-sand-200",
            )}
          >
            <span className="flex h-[clamp(4rem,11vh,6rem)] min-w-[clamp(4rem,11vh,6rem)] shrink-0 items-center justify-center rounded-[1.5rem] bg-sky-600 px-3 font-display-soft text-[clamp(1.75rem,3vw+1vh,3rem)] font-semibold text-white" aria-hidden="true">
              {question.phoneme}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-extrabold leading-tight text-ink text-[clamp(1.1rem,1.6vw+0.8vh+0.4rem,2rem)]" aria-live="polite">
                Som {question.phoneme}
              </h2>
              <p className="flex flex-wrap items-center gap-2 text-ink-soft">
                como no começo de
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 py-0.5 pl-1 pr-3 font-extrabold text-sky-700">
                  <Media media={example.media} size={32} decorative className="h-7 w-7" />
                  <span className={gameTextClass}>{example.word}</span>
                </span>
              </p>
            </div>
            {/* Só gravações: o som da fala não é sintetizado pela plataforma. */}
            <ListenButton text={example.word} audio={example.audio} recordedOnly label="Ouvir o exemplo" />
          </motion.div>
        </AnimatePresence>

        <div ref={ref} className="mt-[clamp(0.75rem,2.5vh,1.75rem)] flex min-h-0 w-full flex-1 items-center justify-center">
          <div
            key={state.index}
            role="group"
            aria-label="Figuras (seleção múltipla)"
            className="grid gap-3.5"
            style={{
              gridTemplateColumns: `repeat(${grid?.cols ?? 3}, ${grid?.cellWidth ? `${grid.cellWidth}px` : "minmax(0, 9rem)"})`,
              visibility: grid ? "visible" : "hidden",
            }}
          >
            {question.options.map((option, i) => {
              const selected = state.selected.includes(option.id);
              const isTarget = question.targetIds.includes(option.id);
              let tile: TileState = selected ? "selected" : "idle";
              if (state.solved) tile = isTarget ? "correct" : "dimmed";
              else if (check) {
                if (check.correct.includes(option.id)) tile = "correct";
                else if (check.wrong.includes(option.id)) tile = "wrong";
                else if (check.missed.includes(option.id)) tile = "missed";
              }
              const status = tile === "correct" ? ", começa com o som" : tile === "wrong" ? ", não começa com o som" : tile === "missed" ? ", faltou marcar" : "";
              return (
                <OptionTile
                  key={option.id}
                  media={option.media}
                  label={option.word}
                  ariaLabel={`${option.word}${selected ? ", marcada" : ""}${status}`}
                  showLabel={showNames || state.solved}
                  state={tile}
                  index={i}
                  width={grid?.cellWidth || 130}
                  pressed={selected}
                  shake={tile === "wrong"}
                  disabled={state.solved}
                  onClick={() => !state.solved && dispatch({ type: "toggle", id: option.id })}
                />
              );
            })}
          </div>
        </div>

        <ActionBar>
          {state.solved ? (
            <SuccessBar key={state.index} message={successText(state.index)} last={state.index + 1 >= state.total} onNext={() => dispatch({ type: "next" })} />
          ) : (
            <>
              <span className="text-sm font-bold text-ink-soft" aria-live="polite">
                {state.selected.length === 0 ? "Nenhuma figura marcada" : `${state.selected.length} marcada${state.selected.length > 1 ? "s" : ""}`}
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: "check", targetIds: question.targetIds })}
                disabled={state.selected.length === 0}
                className={buttonClasses("primary", "lg")}
              >
                <CheckCheck className="h-5 w-5" aria-hidden />
                Conferir
              </button>
            </>
          )}
        </ActionBar>
      </div>
    </GameShell>
  );
}
