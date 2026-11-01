"use client";

import { useMemo, useReducer } from "react";
import { motion } from "motion/react";
import { CheckCheck } from "lucide-react";
import { buttonClasses } from "@/components/button";
import { Media } from "@/components/media";
import type { MonteFraseActivity, ResolvedActivity } from "@/content/types";
import { cn } from "@/lib/cn";
import { createRng } from "@/lib/random";
import { GameShell } from "../shared/game-shell";
import { gameTextClass } from "../shared/game-text";
import { GAME_TYPE_META } from "../meta";
import type { GameProps } from "../shared/types";
import { ActionBar, ListenButton, PromptCard, PromptText, SuccessBar } from "../shared/ui";
import { useDragDrop } from "../shared/use-drag-drop";
import { useRoundFeedback } from "../shared/use-round-feedback";
import { createSentenceRound, formatSentence, initialSentenceState, sentenceReducer, type SentencePiece } from "./engine";

export function MonteFraseGame({ activity, seed, controls, options }: GameProps<ResolvedActivity<MonteFraseActivity>>) {
  const round = useMemo(() => createSentenceRound(activity, controls.difficulty, createRng(seed)), [activity, controls.difficulty, seed]);
  const [state, dispatch] = useReducer(sentenceReducer, round, initialSentenceState);
  const withImages = options.modo !== "palavras";
  const question = round[state.index];
  const pieceByKey = useMemo(() => new Map(question.pieces.map((p) => [p.key, p])), [question]);
  const textOf = useMemo(() => Object.fromEntries(question.pieces.map((p) => [p.key, p.text])), [question]);
  const full = state.slots.every((s) => s !== null);
  const { feedback, successText } = useRoundFeedback({
    solvedKey: state.solved ? `${state.index}` : null,
    missNonce: state.missNonce,
    done: state.done,
    missText: "Quase! Troque as peças marcadas de lugar.",
  });
  const tray = question.tray.filter((k) => !state.slots.includes(k));
  const finalText = state.solved ? formatSentence(state.slots.map((k) => textOf[k as string])) : "";

  const { bind, dragging, over, ghostStyle } = useDragDrop<string>({
    enabled: !state.solved,
    onDrop: (key, target) => {
      if (target === "bandeja") {
        const slot = state.slots.indexOf(key);
        if (slot >= 0) dispatch({ type: "remove", slot });
      } else dispatch({ type: "place", key, slot: Number(target.replace("espaco-", "")) });
    },
  });

  const mediaFor = (piece: SentencePiece) => {
    if (!withImages || !piece.imageId) return null;
    return (activity.lexicon[piece.imageId] ?? activity.pictures[piece.imageId])?.media ?? null;
  };

  const block = (piece: SentencePiece, place: "tray" | number) => {
    const media = mediaFor(piece);
    const wrong = typeof place === "number" && state.wrongSlots.includes(place);
    return (
      <motion.button
        key={`${piece.key}-${place}`}
        type="button"
        {...bind(piece.key)}
        onClick={() => (place === "tray" ? dispatch({ type: "place", key: piece.key }) : dispatch({ type: "remove", slot: place }))}
        aria-label={place === "tray" ? `Peça: ${piece.text}` : `Espaço ${place + 1}: ${piece.text}. Toque para tirar.`}
        aria-disabled={state.solved || undefined}
        initial={{ opacity: 0, scale: 0.6, y: place === "tray" ? -10 : 10 }}
        animate={{ opacity: dragging === piece.key ? 0.35 : 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 480, damping: 26 }}
        whileTap={state.solved ? undefined : { scale: 0.94 }}
        className={cn(
          "flex touch-none select-none flex-col items-center justify-center gap-1 rounded-2xl bg-white px-3 font-extrabold text-ink shadow-[0_5px_0_-1px_var(--color-sage-300)] ring-2 transition-colors",
          media ? "min-h-[clamp(4.5rem,11vh,7rem)] min-w-[clamp(4.5rem,9vw,7rem)] py-2" : "min-h-[clamp(3rem,7vh,4.25rem)] py-1.5",
          wrong ? "ring-peach-300 shadow-[0_5px_0_-1px_var(--color-peach-300)]" : state.solved ? "ring-sage-500" : "ring-sage-200 hover:ring-sage-400",
          state.solved && "cursor-default",
        )}
      >
        {media && <Media media={media} size={72} decorative className="h-[clamp(2rem,5.5vh,3.5rem)] w-[clamp(2rem,5.5vh,3.5rem)]" />}
        <span className={cn("text-[clamp(1.05rem,1.2vw+1vh+0.3rem,1.75rem)] leading-none", gameTextClass)}>{piece.text}</span>
      </motion.button>
    );
  };

  const scene = withImages && question.sceneIds.length > 0 && (
    <div className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
      {question.sceneIds.map((id) => {
        const media = (activity.lexicon[id] ?? activity.pictures[id])?.media;
        return media ? (
          <span key={id} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-50 ring-1 ring-sage-200 sm:h-16 sm:w-16">
            <Media media={media} size={64} decorative className="h-[74%] w-[74%]" />
          </span>
        ) : null;
      })}
    </div>
  );

  return (
    <GameShell
      title={GAME_TYPE_META["monte-frase"].label}
      instruction={withImages ? "Toque nas peças na ordem certa. A cena ajuda!" : "Toque nas palavras na ordem certa."}
      accent={activity.accent}
      controls={controls}
      progress={{
        current: state.done ? state.total : state.index + (state.solved ? 1 : 0),
        total: state.total,
        label: `Frase ${Math.min(state.index + 1, state.total)} de ${state.total}`,
      }}
      feedback={feedback}
      completed={state.done}
      completionSummary={`Você montou ${state.total} frases.`}
      raisedToast
    >
      <div className="flex h-full flex-col items-center px-3 pt-1 sm:px-6">
        <div className="w-full max-w-4xl shrink-0">
          <PromptCard
            tone={state.solved ? "success" : "default"}
            aside={state.solved ? <ListenButton text={finalText} label="Ouvir a frase" /> : scene || undefined}
          >
            <PromptText key={`${state.index}-${state.solved}`}>
              {state.solved ? finalText : `Monte uma frase com ${question.pieces.length} peças.`}
            </PromptText>
          </PromptCard>
        </div>

          {/* Centralização "segura": se não couber, rola sem esconder o topo. */}
          <div className="flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-y-auto py-3">
          <div className="my-auto flex w-full flex-col items-center gap-[clamp(1rem,4vh,2.5rem)]">
            {/* Espaços da frase */}
            <ol aria-label="Frase" className="flex flex-wrap items-end justify-center gap-2.5 sm:gap-3">
              {state.slots.map((key, i) => (
                <li
                  key={i}
                  data-drop={`espaco-${i}`}
                  className={cn(
                    "flex items-center justify-center rounded-2xl border-2 border-dashed p-1 transition-colors",
                    key ? "border-transparent" : over === `espaco-${i}` ? "border-sky-600 bg-sky-100/60" : "border-sage-300 bg-white/40",
                    withImages ? "min-h-[clamp(5rem,12vh,7.5rem)] min-w-[clamp(4.5rem,9vw,7rem)]" : "min-h-[clamp(3.4rem,8vh,4.75rem)] min-w-[clamp(4rem,8vw,6rem)]",
                  )}
                >
                  {key ? block(pieceByKey.get(key)!, i) : <span className="sr-only">Espaço {i + 1} vazio</span>}
                </li>
              ))}
            </ol>

            {/* Bandeja */}
            <div
              data-drop="bandeja"
              role="group"
              aria-label="Peças"
              className={cn(
                "flex min-h-[clamp(4rem,10vh,6rem)] w-full flex-wrap items-center justify-center gap-2.5 rounded-[1.75rem] border-2 border-dashed p-3 transition-colors sm:gap-3",
                over === "bandeja" ? "border-sky-600 bg-sky-100/60" : "border-sand-300 bg-white/40",
              )}
            >
              {tray.map((key) => block(pieceByKey.get(key)!, "tray"))}
              {tray.length === 0 && !state.solved && <span className="text-sm font-bold text-ink-faint">Todas as peças estão na frase. Toque em Conferir!</span>}
            </div>
          </div>
          </div>

        <ActionBar>
          {state.solved ? (
            <SuccessBar
              key={state.index}
              message={successText(state.index)}
              last={state.index + 1 >= state.total}
              onNext={() => dispatch({ type: "next", size: round[state.index + 1]?.pieces.length ?? null })}
            />
          ) : (
            <button
              type="button"
              onClick={() => dispatch({ type: "check", textOf, accepted: question.accepted })}
              disabled={!full}
              className={buttonClasses("primary", "lg")}
            >
              <CheckCheck className="h-5 w-5" aria-hidden />
              Conferir
            </button>
          )}
        </ActionBar>
      </div>

      {dragging && ghostStyle && (
        <div style={ghostStyle} className="flex items-center justify-center rounded-2xl bg-white font-extrabold text-ink shadow-lift ring-2 ring-sky-600" aria-hidden="true">
          <span className={cn("text-[clamp(1.05rem,1.2vw+1vh+0.3rem,1.75rem)]", gameTextClass)}>{pieceByKey.get(dragging)?.text}</span>
        </div>
      )}
    </GameShell>
  );
}
