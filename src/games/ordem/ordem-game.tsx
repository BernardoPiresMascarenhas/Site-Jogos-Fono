"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { BookOpen, CheckCheck, Check, Undo2, X } from "lucide-react";
import { buttonClasses } from "@/components/button";
import { Media } from "@/components/media";
import { categoryLabel } from "@/content/categories";
import type { OrdemActivity, Picture, ResolvedActivity } from "@/content/types";
import { cn } from "@/lib/cn";
import { createRng } from "@/lib/random";
import { GameShell } from "../shared/game-shell";
import { GAME_TYPE_META } from "../meta";
import type { GameProps } from "../shared/types";
import { ActionBar, ListenButton, PromptCard, PromptText, SuccessBar } from "../shared/ui";
import { useDragDrop } from "../shared/use-drag-drop";
import { useFitGrid } from "../shared/use-fit-grid";
import { useRoundFeedback } from "../shared/use-round-feedback";
import { createSequenceRound, initialSequenceState, sequenceReducer } from "./engine";

export function OrdemGame({ activity, seed, controls }: GameProps<ResolvedActivity<OrdemActivity>>) {
  const round = useMemo(() => createSequenceRound(activity, controls.difficulty, createRng(seed)), [activity, controls.difficulty, seed]);
  const [state, dispatch] = useReducer(sequenceReducer, round, initialSequenceState);
  const [story, setStory] = useState(false);
  const question = round[state.index];
  const byId = useMemo(() => new Map(question.steps.map((p) => [p.id, p])), [question]);
  const correct = useMemo(() => question.steps.map((p) => p.id), [question]);
  const wrongCount = state.checked ? state.checked.filter((ok) => !ok).length : 0;
  const { feedback, successText } = useRoundFeedback({
    solvedKey: state.solved ? `${state.index}` : null,
    missNonce: state.missNonce,
    done: state.done,
    missText: wrongCount === 1 ? "Quase! Só uma figura está fora do lugar." : `Quase! ${wrongCount} figuras estão fora do lugar.`,
  });
  const { ref, grid } = useFitGrid<HTMLDivElement>(question.steps.length, 4 / 5, 14, 230);
  const { bind, dragging, over, ghostStyle } = useDragDrop<number>({
    enabled: !state.solved,
    onDrop: (from, target) => dispatch({ type: "swap", a: from, b: Number(target) }),
  });

  return (
    <GameShell
      title={GAME_TYPE_META.ordem.label}
      subtitle={categoryLabel(activity.category)}
      instruction="Toque em duas figuras para trocá-las (ou arraste)."
      accent={activity.accent}
      controls={controls}
      progress={{
        current: state.done ? state.total : state.index + (state.solved ? 1 : 0),
        total: state.total,
        label: `Sequência ${Math.min(state.index + 1, state.total)} de ${state.total}`,
      }}
      feedback={feedback}
      completed={state.done}
      completionSummary={`Você organizou ${state.total} sequências.`}
      raisedToast
    >
      <div className="flex h-full flex-col items-center px-3 pt-1 sm:px-6">
        <div className="w-full max-w-3xl shrink-0">
          <PromptCard
            tone={state.solved ? "success" : "default"}
            aside={state.solved ? <ListenButton text={question.description} label="Ouvir a história" /> : undefined}
          >
            <PromptText key={`${state.index}-${state.solved}`} className={state.solved ? "text-[clamp(1rem,1.2vw+0.8vh+0.4rem,1.7rem)]" : undefined}>
              {state.solved ? question.description : question.title}
            </PromptText>
          </PromptCard>
        </div>

        <div ref={ref} className="mt-[clamp(0.75rem,2.5vh,1.75rem)] flex min-h-0 w-full flex-1 items-center justify-center">
          <LayoutGroup id={`seq-${state.index}`}>
            <ol
              aria-label="Sequência"
              className="grid gap-3.5"
              style={{
                gridTemplateColumns: `repeat(${grid?.cols ?? 3}, ${grid?.cellWidth ? `${grid.cellWidth}px` : "minmax(0, 10rem)"})`,
                visibility: grid ? "visible" : "hidden",
              }}
            >
              {state.arrangement.map((id, position) => {
                const picture = byId.get(id)!;
                const mark = state.checked?.[position];
                const selected = state.selected === position;
                return (
                  <li key={position} data-drop={String(position)} className="relative">
                    <span
                      className={cn(
                        "absolute -left-2 -top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full text-base font-extrabold shadow-soft ring-4 ring-white",
                        mark === true ? "bg-sage-600 text-white" : mark === false ? "bg-peach-600 text-white" : "bg-butter-300 text-ink",
                      )}
                      aria-hidden="true"
                    >
                      {position + 1}
                    </span>
                    <motion.button
                      layoutId={`card-${state.index}-${id}`}
                      type="button"
                      {...bind(position)}
                      onClick={() => dispatch({ type: "select", position })}
                      aria-label={`Posição ${position + 1}: ${picture.label}${selected ? ", selecionada" : ""}${mark === true ? ", no lugar certo" : mark === false ? ", fora do lugar" : ""}`}
                      aria-pressed={selected}
                      aria-disabled={state.solved || undefined}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      animate={{ scale: selected ? 0.95 : 1, opacity: dragging === position ? 0.4 : 1 }}
                      className={cn(
                        "relative flex aspect-[4/5] w-full touch-none flex-col items-center justify-center gap-[5%] rounded-[clamp(1.1rem,2.4vw,1.8rem)] bg-white p-[7%] shadow-soft ring-4 transition-shadow",
                        selected ? "ring-sky-600" : mark === true ? "ring-sage-500" : mark === false ? "ring-peach-300" : over === String(position) ? "ring-sky-300" : "ring-white hover:ring-rose-200",
                        state.solved && "cursor-default",
                      )}
                    >
                      <Media media={picture.media} size={160} decorative className="h-[62%] w-[62%]" />
                      <span className="line-clamp-2 text-center font-extrabold leading-tight text-ink" style={{ fontSize: Math.max(12, Math.min(19, (grid?.cellWidth ?? 120) / 9)) }}>
                        {picture.label}
                      </span>
                      {mark !== undefined && (
                        <span
                          className={cn(
                            "absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white",
                            mark ? "bg-sage-600 text-white" : "bg-peach-100 text-peach-700",
                          )}
                          aria-hidden="true"
                        >
                          {mark ? <Check className="h-4 w-4" strokeWidth={3.5} /> : <Undo2 className="h-4 w-4" strokeWidth={3} />}
                        </span>
                      )}
                    </motion.button>
                  </li>
                );
              })}
            </ol>
          </LayoutGroup>
        </div>

        <ActionBar>
          {state.solved ? (
            <SuccessBar
              key={state.index}
              message={successText(state.index)}
              last={state.index + 1 >= state.total}
              onNext={() => dispatch({ type: "next", initial: round[state.index + 1]?.initial ?? null })}
              extra={
                <button type="button" onClick={() => setStory(true)} className={buttonClasses("secondary", "lg")}>
                  <BookOpen className="h-5 w-5" aria-hidden />
                  Contar a história
                </button>
              }
            />
          ) : (
            <button type="button" onClick={() => dispatch({ type: "check", correct })} className={buttonClasses("primary", "lg")}>
              <CheckCheck className="h-5 w-5" aria-hidden />
              Conferir
            </button>
          )}
        </ActionBar>
      </div>

      {dragging !== null && ghostStyle && (
        <div style={ghostStyle} className="flex flex-col items-center justify-center rounded-[1.5rem] bg-white p-[7%] shadow-lift ring-4 ring-sky-600" aria-hidden="true">
          <Media media={byId.get(state.arrangement[dragging])!.media} size={160} decorative className="h-[62%] w-[62%]" />
        </div>
      )}

      <AnimatePresence>{story && <StoryView title={question.title} steps={question.steps} onClose={() => setStory(false)} />}</AnimatePresence>
    </GameShell>
  );
}

/**
 * "Contar a história": mostra só as figuras em ordem, grandes, para a
 * profissional pedir que a criança narre oralmente. Nada é gravado.
 */
function StoryView({ title, steps, onClose }: { title: string; steps: Picture[]; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const { ref, grid } = useFitGrid<HTMLDivElement>(steps.length, 1, 16, 300);
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="historia-titulo"
      className="absolute inset-0 z-40 flex flex-col bg-butter-100 p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wider text-butter-700">Contar a história</p>
          <h2 id="historia-titulo" className="font-display-soft text-2xl font-semibold text-ink sm:text-4xl">
            {title}
          </h2>
          <p className="mt-1 text-ink-soft">Peça para a criança contar o que acontece em cada figura.</p>
        </div>
        <button ref={closeRef} type="button" onClick={onClose} className={buttonClasses("secondary", "md")}>
          <X className="h-5 w-5" aria-hidden />
          Fechar
        </button>
      </div>
      <div ref={ref} className="mt-4 flex min-h-0 flex-1 items-center justify-center">
        <ol
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${grid?.cols ?? 3}, ${grid?.cellWidth ? `${grid.cellWidth}px` : "minmax(0, 12rem)"})`,
            visibility: grid ? "visible" : "hidden",
          }}
        >
          {steps.map((p, i) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 * i, type: "spring", stiffness: 260, damping: 24 }}
              className="relative flex aspect-square items-center justify-center rounded-[2rem] bg-white shadow-soft ring-4 ring-white"
            >
              <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-butter-300 font-extrabold text-ink">{i + 1}</span>
              <Media media={p.media} size={220} decorative className="h-[68%] w-[68%]" />
              <span className="sr-only">{p.label}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    </motion.div>
  );
}
