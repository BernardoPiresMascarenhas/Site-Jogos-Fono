"use client";

import { useMemo, useReducer } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Ear } from "lucide-react";
import type { EscuteActivity, ResolvedActivity } from "@/content/types";
import { cn } from "@/lib/cn";
import { createRng } from "@/lib/random";
import { choiceReducer, initialChoiceState } from "../shared/bank";
import { GameShell } from "../shared/game-shell";
import { gameTextClass } from "../shared/game-text";
import { GAME_TYPE_META } from "../meta";
import type { GameProps } from "../shared/types";
import { ActionBar, ListenButton, OptionTile, ProfessionalReveal, SuccessBar, type TileState } from "../shared/ui";
import { useFitGrid } from "../shared/use-fit-grid";
import { useRoundFeedback } from "../shared/use-round-feedback";
import { createListenRound, type ListenMode } from "./engine";

export function EscuteGame({ activity, seed, controls, options }: GameProps<ResolvedActivity<EscuteActivity>>) {
  const mode: ListenMode = options.modo === "audio" ? "audio" : "profissional";
  const round = useMemo(() => createListenRound(activity, controls.difficulty, mode, createRng(seed)), [activity, controls.difficulty, mode, seed]);
  const [state, dispatch] = useReducer(choiceReducer, round.length, initialChoiceState);
  const question = round[state.index];
  const solved = state.solvedId !== null;
  const { feedback, successText } = useRoundFeedback({
    solvedKey: solved ? `${state.index}` : null,
    missNonce: state.missNonce,
    done: state.done,
    missText: "Escute de novo e tente outra figura.",
  });
  const { ref, grid } = useFitGrid<HTMLDivElement>(question.options.length, 1, 18, 260);
  const target = question.target;

  return (
    <GameShell
      title={GAME_TYPE_META.escute.label}
      instruction={mode === "audio" ? "Toque em Ouvir e escolha a figura certa." : "A profissional fala a palavra; a criança toca na figura."}
      accent={activity.accent}
      controls={controls}
      progress={{
        current: state.done ? state.total : state.index + (solved ? 1 : 0),
        total: state.total,
        label: `Rodada ${Math.min(state.index + 1, state.total)} de ${state.total}`,
      }}
      feedback={feedback}
      completed={state.done}
      completionSummary={`Você escutou e escolheu em ${state.total} rodadas.`}
      raisedToast
      tools={
        mode === "profissional" && !solved ? (
          <ProfessionalReveal label="Ver palavra" resetKey={state.index}>
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">Palavra-alvo</p>
            <p className={cn("text-2xl font-extrabold", gameTextClass)}>{target.word}</p>
            <p className="mt-1 text-xs text-white/60">Contraste: {question.contrast}</p>
          </ProfessionalReveal>
        ) : undefined
      }
    >
      <div className="flex h-full flex-col items-center px-3 pt-1 sm:px-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${state.index}-${solved}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "flex w-full max-w-2xl shrink-0 items-center justify-center gap-3 rounded-[2rem] px-4 py-3 shadow-soft ring-1 sm:gap-4",
              solved ? "bg-sage-50 ring-sage-300" : "bg-white ring-sand-200",
            )}
          >
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-lilac-100 text-lilac-700" aria-hidden="true">
              <Ear className="h-8 w-8" />
              {!solved && <span className="absolute inset-0 animate-ping rounded-2xl bg-lilac-300/40 [animation-duration:2.4s]" />}
            </span>
            <h2 className="min-w-0 flex-1 text-center font-extrabold leading-tight text-ink text-[clamp(1.15rem,1.8vw+0.8vh+0.4rem,2.1rem)]" aria-live="polite">
              {solved ? (
                <>
                  Era <span className={cn("rounded-xl bg-sage-100 px-2 text-sage-800", gameTextClass)}>{target.word}</span>!
                </>
              ) : mode === "audio" ? (
                "Escute com atenção…"
              ) : (
                "Escute a palavra que eu vou falar…"
              )}
            </h2>
            {mode === "audio" && target.audio && (
              <ListenButton
                text={target.word}
                audio={target.audio}
                recordedOnly
                size="lg"
                label={solved ? "Ouvir de novo" : "Ouvir"}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div ref={ref} className="mt-[clamp(0.75rem,2.5vh,1.75rem)] flex min-h-0 w-full flex-1 items-center justify-center">
          <div
            key={state.index}
            role="group"
            aria-label="Figuras"
            className="grid gap-[18px]"
            style={{
              gridTemplateColumns: `repeat(${grid?.cols ?? 2}, ${grid?.cellWidth ? `${grid.cellWidth}px` : "minmax(0, 11rem)"})`,
              visibility: grid ? "visible" : "hidden",
            }}
          >
            {question.options.map((option, i) => {
              const isAnswer = option.id === target.id;
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
                  width={grid?.cellWidth || 150}
                  shake={wrong && state.wrong.at(-1) === option.id}
                  disabled={solved || wrong}
                  onClick={() => dispatch({ type: "answer", id: option.id, correctIds: [target.id] })}
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
                mode === "audio" && target.audio ? undefined : (
                  <span className="hidden text-sm font-semibold text-ink-soft sm:inline">Contraste: {question.contrast}</span>
                )
              }
            />
          ) : mode === "profissional" ? (
            <p className="max-w-md text-center text-sm font-semibold text-ink-faint">
              Profissional: toque em <strong className="text-ink-soft">Ver palavra</strong> (sem a criança ver), fale a palavra e peça para a criança escolher.
            </p>
          ) : (
            // A gravação só toca quando alguém toca em "Ouvir" (sem sons inesperados).
            <p className="text-center text-sm font-semibold text-ink-faint">Toque em Ouvir quantas vezes precisar.</p>
          )}
        </ActionBar>
      </div>
    </GameShell>
  );
}
