"use client";

import { useEffect, useMemo, useReducer } from "react";
import type { MemoriaActivity, ResolvedActivity } from "@/content/types";
import { useSound } from "@/lib/audio/sound-context";
import { createRng } from "@/lib/random";
import { GameShell } from "../shared/game-shell";
import type { GameProps } from "../shared/types";
import { missMessage, successMessage, useFeedback } from "../shared/use-feedback";
import { useFitGrid } from "../shared/use-fit-grid";
import { createMemoryDeck, initialMemoryState, isCardFaceUp, isMemoryComplete, memoryReducer, pairsTotal } from "./engine";
import { MemoryCard } from "./memory-card";

/** Tempo que duas cartas diferentes ficam visíveis antes de desvirar. */
const HIDE_DELAY_MS = 1100;

export function MemoriaGame({ activity, seed, controls }: GameProps<ResolvedActivity<MemoriaActivity>>) {
  const deck = useMemo(
    () => createMemoryDeck(activity.items, controls.difficulty, activity.mode, createRng(seed)),
    [activity.items, activity.mode, controls.difficulty, seed],
  );
  const byId = useMemo(() => new Map(deck.concepts.map((c) => [c.id, c])), [deck]);
  const [state, dispatch] = useReducer(memoryReducer, deck.cards, initialMemoryState);
  const { feedback, show } = useFeedback();
  const { play } = useSound();
  const total = pairsTotal(state);
  const complete = isMemoryComplete(state);
  const { ref, grid } = useFitGrid<HTMLDivElement>(state.cards.length, 4 / 5, 12, 200);

  useEffect(() => {
    if (!state.locked) return;
    const t = setTimeout(() => dispatch({ type: "hide" }), HIDE_DELAY_MS);
    return () => clearTimeout(t);
  }, [state.locked]);

  useEffect(() => {
    if (!state.lastMatch) return;
    if (state.matched.length === total) play("complete");
    else {
      play("success");
      show("success", successMessage(state.lastMatch.nonce));
    }
  }, [state.lastMatch, state.matched.length, total, play, show]);

  useEffect(() => {
    if (!state.lastMiss) return;
    play("error");
    show("miss", missMessage(state.lastMiss.nonce));
  }, [state.lastMiss, play, show]);

  const flip = (key: string) => {
    const card = state.cards.find((c) => c.key === key);
    if (!card || state.locked || state.flipped.length >= 2 || isCardFaceUp(state, card)) return;
    if (state.flipped.length === 0) play("flip");
    dispatch({ type: "flip", key });
  };

  const cols = grid?.cols ?? (state.cards.length > 6 ? 4 : 3);
  const cellWidth = grid?.cellWidth ?? 0;

  return (
    <GameShell
      title={activity.title}
      instruction={activity.instruction}
      accent={activity.accent}
      controls={controls}
      progress={{ current: state.matched.length, total, label: `${state.matched.length} de ${total} pares encontrados` }}
      feedback={feedback}
      completed={complete}
      completionSummary={`Você encontrou os ${total} pares em ${state.moves} jogadas.`}
    >
      <div className="flex h-full flex-col px-3 pb-20 pt-1 sm:px-6 sm:pb-24">
        <p className="mb-2 text-center text-sm font-bold text-ink-soft" aria-hidden="true">
          Pares encontrados: <span className="tabular-nums text-ink">{state.matched.length}</span> de {total}
        </p>
        <div ref={ref} className="flex min-h-0 flex-1 items-center justify-center">
          <div
            role="group"
            aria-label="Cartas do jogo da memória"
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${cols}, ${cellWidth ? `${cellWidth}px` : "minmax(0, 9rem)"})`,
              visibility: grid ? "visible" : "hidden",
            }}
          >
            {state.cards.map((card, i) => {
              const concept = byId.get(card.conceptId)!;
              const matched = state.matched.includes(card.conceptId);
              return (
                <MemoryCard
                  key={card.key}
                  card={card}
                  concept={concept}
                  index={i}
                  faceUp={isCardFaceUp(state, card)}
                  matched={matched}
                  missed={state.locked && state.flipped.includes(card.key)}
                  celebrate={state.lastMatch?.conceptId === card.conceptId ? state.lastMatch.nonce : null}
                  width={cellWidth || 120}
                  onFlip={() => flip(card.key)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </GameShell>
  );
}
