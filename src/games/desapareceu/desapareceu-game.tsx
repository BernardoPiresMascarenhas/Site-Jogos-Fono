"use client";

import { useEffect, useMemo, useReducer } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { buttonClasses } from "@/components/button";
import { Media } from "@/components/media";
import { categoryLabel } from "@/content/categories";
import type { DesapareceuActivity, ResolvedActivity } from "@/content/types";
import { cn } from "@/lib/cn";
import { createRng } from "@/lib/random";
import { GameShell } from "../shared/game-shell";
import { GAME_TYPE_META } from "../meta";
import type { GameProps } from "../shared/types";
import { ActionBar, OptionTile, PromptCard, PromptText, SuccessBar, type TileState } from "../shared/ui";
import { useFitGrid } from "../shared/use-fit-grid";
import { useRoundFeedback } from "../shared/use-round-feedback";
import { createDisappearRound, disappearReducer, initialDisappearState } from "./engine";

/** Duração da "cortina" que esconde os objetos. */
const HIDE_MS = 1100;

export function DesapareceuGame({ activity, seed, controls, options }: GameProps<ResolvedActivity<DesapareceuActivity>>) {
  const round = useMemo(() => createDisappearRound(activity, controls.difficulty, createRng(seed)), [activity, controls.difficulty, seed]);
  const [state, dispatch] = useReducer(disappearReducer, round.length, initialDisappearState);
  const reduce = useReducedMotion();
  const question = round[state.index];
  const solved = state.solvedId !== null;
  const observeSeconds = options.observacao === "5" ? 5 : options.observacao === "10" ? 10 : null;
  const { feedback, successText } = useRoundFeedback({
    solvedKey: solved ? `${state.index}` : null,
    missNonce: state.missNonce,
    done: state.done,
    missText: "Essa ainda está aqui! Tente outra.",
  });

  // Avanço automático opcional (o botão "Estou pronto" continua disponível).
  useEffect(() => {
    if (state.phase !== "observe" || observeSeconds === null) return;
    const t = setTimeout(() => dispatch({ type: "ready" }), observeSeconds * 1000);
    return () => clearTimeout(t);
  }, [state.phase, state.index, observeSeconds]);

  useEffect(() => {
    if (state.phase !== "hiding") return;
    const t = setTimeout(() => dispatch({ type: "revealed" }), reduce ? 200 : HIDE_MS);
    return () => clearTimeout(t);
  }, [state.phase, reduce]);

  const board = state.phase === "question" ? question.remaining : question.shown;
  const { ref: boardRef, grid: boardLayout } = useFitGrid<HTMLDivElement>(question.shown.length, 1, 14, 220);
  const { ref: optionsRef, grid: optionsLayout } = useFitGrid<HTMLDivElement>(question.options.length, 1, 12, 150);
  const inQuestion = state.phase === "question";
  const cell = boardLayout?.cellWidth ?? 120;

  const prompt =
    state.phase === "observe"
      ? "Observe bem todas as figuras."
      : state.phase === "hiding"
        ? "Fechando os olhos…"
        : solved
          ? `Sumiu ${question.target.article === "a" || question.target.article === "as" ? "a" : "o"} ${question.target.word.toLocaleLowerCase("pt-BR")}!`
          : "O que desapareceu?";

  return (
    <GameShell
      title={GAME_TYPE_META.desapareceu.label}
      subtitle={categoryLabel(activity.category)}
      instruction={inQuestion ? "Toque na figura que sumiu." : "Observe e toque em \"Estou pronto\"."}
      accent={activity.accent}
      controls={controls}
      progress={{
        current: state.done ? state.total : state.index + (solved ? 1 : 0),
        total: state.total,
        label: `Rodada ${Math.min(state.index + 1, state.total)} de ${state.total}`,
      }}
      feedback={feedback}
      completed={state.done}
      completionSummary={`Você descobriu o que sumiu em ${state.total} rodadas.`}
      raisedToast
    >
      <div className="flex h-full flex-col items-center px-3 pt-1 sm:px-6">
        <div className="w-full max-w-3xl shrink-0">
          <PromptCard tone={solved ? "success" : "default"}>
            <PromptText key={`${state.index}-${state.phase}-${solved}`}>{prompt}</PromptText>
          </PromptCard>
        </div>

        {/* Tabuleiro: fase de observação e depois os objetos restantes */}
        <div ref={boardRef} className={cn("relative mt-[clamp(0.6rem,2vh,1.25rem)] flex min-h-0 w-full items-center justify-center", inQuestion ? "flex-[1.1]" : "flex-1")}>
          <div
            key={`${state.index}-${inQuestion}`}
            role="list"
            aria-label={inQuestion ? "Figuras que ficaram" : "Figuras para observar"}
            className="relative grid gap-3.5 rounded-[2rem] bg-white/50 p-3.5 ring-1 ring-sand-200"
            style={{
              gridTemplateColumns: `repeat(${boardLayout?.cols ?? 3}, ${inQuestion ? Math.round(cell * 0.82) : cell}px)`,
              visibility: boardLayout ? "visible" : "hidden",
            }}
          >
            {board.map((concept, i) =>
              concept ? (
                <motion.div
                  key={concept.id}
                  role="listitem"
                  aria-label={concept.word}
                  initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.07 }}
                  className="flex aspect-square items-center justify-center rounded-[1.5rem] bg-white shadow-soft ring-4 ring-white"
                >
                  <Media media={concept.media} size={180} decorative className="h-[72%] w-[72%]" />
                </motion.div>
              ) : (
                <div key={`vazio-${i}`} role="listitem" aria-label="Espaço vazio" className="flex aspect-square items-center justify-center rounded-[1.5rem] border-4 border-dashed border-sage-300 bg-sage-50/60">
                  <span className="font-display-soft text-4xl font-semibold text-sage-500" aria-hidden="true">?</span>
                </div>
              ),
            )}

            {/* Cortina suave */}
            <AnimatePresence>
              {state.phase === "hiding" && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center rounded-[2rem] bg-sage-600"
                  initial={{ clipPath: "inset(0 0 100% 0 round 2rem)" }}
                  animate={{ clipPath: "inset(0 0 0% 0 round 2rem)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                  aria-hidden="true"
                >
                  <EyeOff className="h-14 w-14 text-white/90" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Alternativas */}
        {/* Sempre montado (medido pelo ResizeObserver); só aparece na fase da pergunta. */}
        <div ref={optionsRef} className={cn("mt-3 min-h-0 w-full flex-[0.8] items-center justify-center", inQuestion ? "flex" : "hidden")}>
          {inQuestion && (
            <div
              key={state.index}
              role="group"
              aria-label="Qual desapareceu?"
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${optionsLayout?.cols ?? 4}, ${optionsLayout?.cellWidth ? `${optionsLayout.cellWidth}px` : "minmax(0, 7rem)"})`,
                visibility: optionsLayout ? "visible" : "hidden",
              }}
            >
              {question.options.map((option, i) => {
                const isAnswer = option.id === question.target.id;
                const wrong = state.wrong.includes(option.id);
                const tile: TileState = solved ? (isAnswer ? "correct" : "dimmed") : wrong ? "wrong" : "idle";
                return (
                  <OptionTile
                    key={option.id}
                    media={option.media}
                    label={option.word}
                    state={tile}
                    index={i}
                    width={optionsLayout?.cellWidth || 110}
                    shake={wrong && state.wrong.at(-1) === option.id}
                    disabled={solved || wrong}
                    onClick={() => dispatch({ type: "answer", id: option.id, correctId: question.target.id })}
                  />
                );
              })}
            </div>
          )}
        </div>

        <ActionBar>
          {solved ? (
            <SuccessBar key={state.index} message={successText(state.index)} last={state.index + 1 >= state.total} onNext={() => dispatch({ type: "next" })} />
          ) : state.phase === "observe" ? (
            <button type="button" onClick={() => dispatch({ type: "ready" })} className={buttonClasses("primary", "lg")} autoFocus>
              <Eye className="h-5 w-5" aria-hidden />
              Estou pronto
            </button>
          ) : (
            <p className="text-center text-sm font-semibold text-ink-faint">{state.phase === "hiding" ? "Um, dois, três…" : "Sem pressa. Olhe as figuras que ficaram."}</p>
          )}
        </ActionBar>
      </div>
    </GameShell>
  );
}
