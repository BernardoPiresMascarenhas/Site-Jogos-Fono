"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Media } from "@/components/media";
import type { LigarActivity, ResolvedActivity } from "@/content/types";
import { useSound } from "@/lib/audio/sound-context";
import { cn } from "@/lib/cn";
import { createRng } from "@/lib/random";
import { Burst } from "../shared/burst";
import { GameShell } from "../shared/game-shell";
import { gameTextClass } from "../shared/game-text";
import { PAIR_COLORS } from "../shared/pair-colors";
import type { GameProps } from "../shared/types";
import { missMessage, successMessage, useFeedback } from "../shared/use-feedback";
import { createLigarRound, initialLigarState, isLigarComplete, ligarReducer, type Side } from "./engine";

interface Line {
  id: string;
  d: string;
  color: string;
}

export function LigarGame({ activity, seed, controls }: GameProps<ResolvedActivity<LigarActivity>>) {
  const round = useMemo(
    () => createLigarRound(activity.items, controls.difficulty, createRng(seed)),
    [activity.items, controls.difficulty, seed],
  );
  const byId = useMemo(() => new Map(round.pairs.map((p) => [p.id, p])), [round]);
  const [state, dispatch] = useReducer(ligarReducer, round.pairs.length, initialLigarState);
  const { feedback, show } = useFeedback();
  const { play } = useSound();
  const complete = isLigarComplete(state);

  // Feedback de acerto/erro.
  useEffect(() => {
    if (!state.hit) return;
    if (state.matched.length === state.total) play("complete");
    else {
      play("success");
      show("success", successMessage(state.hit.nonce));
    }
  }, [state.hit, state.matched.length, state.total, play, show]);

  useEffect(() => {
    if (!state.miss) return;
    play("error");
    show("miss", missMessage(state.miss.nonce));
    const t = setTimeout(() => dispatch({ type: "clearMiss" }), 650);
    return () => clearTimeout(t);
  }, [state.miss, play, show]);

  const select = (side: Side, id: string) => {
    if (state.matched.includes(id)) return;
    const willComplete =
      (side === "word" ? state.selectedImage : state.selectedWord) !== null;
    if (!willComplete) play("select");
    dispatch({ type: "select", side, id });
  };

  // ---- Linhas entre os pares ----
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef(new Map<string, HTMLButtonElement>());
  const imageRefs = useRef(new Map<string, HTMLButtonElement>());
  const [lines, setLines] = useState<Line[]>([]);
  const [layoutTick, setLayoutTick] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setLayoutTick((t) => t + 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const box = container.getBoundingClientRect();
    const next: Line[] = [];
    state.matched.forEach((id, i) => {
      const w = wordRefs.current.get(id)?.getBoundingClientRect();
      const m = imageRefs.current.get(id)?.getBoundingClientRect();
      if (!w || !m) return;
      const x1 = w.right - box.left;
      const y1 = w.top + w.height / 2 - box.top;
      const x2 = m.left - box.left;
      const y2 = m.top + m.height / 2 - box.top;
      const dx = Math.max(24, (x2 - x1) * 0.5);
      next.push({ id, d: `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`, color: PAIR_COLORS[i % PAIR_COLORS.length] });
    });
    setLines(next);
  }, [state.matched]);

  useLayoutEffect(measure, [measure, layoutTick]);

  const pairNumber = (id: string) => state.matched.indexOf(id) + 1;

  return (
    <GameShell
      title={activity.title}
      instruction={activity.instruction}
      accent={activity.accent}
      controls={controls}
      progress={{ current: state.matched.length, total: state.total, label: `${state.matched.length} de ${state.total} ligações feitas` }}
      feedback={feedback}
      completed={complete}
      completionSummary={`Você ligou ${state.total} palavras às imagens certas.`}
    >
      <div className="flex h-full items-center justify-center px-3 pb-20 pt-2 sm:px-6 sm:pb-24">
        <div ref={containerRef} className="relative flex h-full max-h-[44rem] w-full max-w-4xl items-stretch gap-[clamp(2.75rem,9vw,8rem)]">
          <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible" aria-hidden="true">
            {lines.map((line) => (
              <motion.path
                key={line.id}
                d={line.d}
                fill="none"
                stroke={line.color}
                strokeWidth={5}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </svg>

          <div role="group" aria-label="Palavras" className="relative z-10 flex flex-[1.25] flex-col justify-center gap-[clamp(0.5rem,1.6vh,1rem)]">
            {round.wordOrder.map((id) => {
              const concept = byId.get(id)!;
              const matched = state.matched.includes(id);
              const selected = state.selectedWord === id;
              const missed = state.miss?.wordId === id;
              const n = pairNumber(id);
              return (
                <button
                  key={id}
                  ref={(el) => {
                    if (el) wordRefs.current.set(id, el);
                    else wordRefs.current.delete(id);
                  }}
                  type="button"
                  onClick={() => select("word", id)}
                  aria-pressed={selected}
                  aria-disabled={matched || undefined}
                  aria-label={matched ? `${concept.word}, ligada` : concept.word}
                  className={cn(
                    "relative flex min-h-14 flex-1 basis-0 items-center justify-center rounded-3xl px-3 text-center font-extrabold leading-tight text-ink shadow-soft ring-2 transition-[transform,box-shadow,background-color] duration-200 ease-out",
                    "max-h-28 text-[clamp(1rem,1.2vw+0.9vh+0.45rem,2rem)]",
                    gameTextClass,
                    matched
                      ? "cursor-default bg-sage-50 ring-sage-400"
                      : selected
                        ? "-translate-y-0.5 scale-[1.03] bg-rose-50 shadow-lift ring-[3px] ring-rose-600"
                        : "bg-white ring-transparent hover:-translate-y-0.5 hover:ring-rose-300",
                    missed && "animate-[gentle-shake_0.4s_ease-in-out]",
                  )}
                >
                  <span className="text-balance break-words">{concept.word}</span>
                  {matched && <PairBadge n={n} side="right" />}
                  {selected && <SelectedDot side="right" />}
                </button>
              );
            })}
          </div>

          <div role="group" aria-label="Imagens" className="relative z-10 flex flex-1 flex-col justify-center gap-[clamp(0.5rem,1.6vh,1rem)]">
            {round.imageOrder.map((id) => {
              const concept = byId.get(id)!;
              const matched = state.matched.includes(id);
              const selected = state.selectedImage === id;
              const missed = state.miss?.imageId === id;
              const justHit = state.hit?.id === id;
              const n = pairNumber(id);
              return (
                <button
                  key={id}
                  ref={(el) => {
                    if (el) imageRefs.current.set(id, el);
                    else imageRefs.current.delete(id);
                  }}
                  type="button"
                  onClick={() => select("image", id)}
                  aria-pressed={selected}
                  aria-disabled={matched || undefined}
                  aria-label={matched ? `Imagem: ${concept.media.alt}, ligada` : `Imagem: ${concept.media.alt}`}
                  className={cn(
                    "relative flex min-h-14 max-h-28 flex-1 basis-0 items-center justify-center rounded-3xl shadow-soft ring-2 transition-[transform,box-shadow,background-color] duration-200 ease-out",
                    matched
                      ? "cursor-default bg-sage-50 ring-sage-400"
                      : selected
                        ? "-translate-y-0.5 scale-[1.03] bg-rose-50 shadow-lift ring-[3px] ring-rose-600"
                        : "bg-white ring-transparent hover:-translate-y-0.5 hover:ring-rose-300",
                    missed && "animate-[gentle-shake_0.4s_ease-in-out]",
                  )}
                >
                  <Media media={concept.media} size={96} decorative className="h-[72%] w-auto max-w-[80%]" />
                  {matched && <PairBadge n={n} side="left" />}
                  {selected && <SelectedDot side="left" />}
                  {justHit && <Burst key={state.hit?.nonce} radius={70} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </GameShell>
  );
}

function PairBadge({ n, side }: { n: number; side: "left" | "right" }) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      className={cn(
        "absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-soft ring-[3px] ring-white",
        side === "right" ? "-right-4" : "-left-4",
      )}
      style={{ backgroundColor: PAIR_COLORS[(n - 1) % PAIR_COLORS.length] }}
      aria-hidden="true"
    >
      <Check className="h-4 w-4" strokeWidth={3.5} />
    </motion.span>
  );
}

function SelectedDot({ side }: { side: "left" | "right" }) {
  return (
    <span
      className={cn(
        "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-rose-600 ring-4 ring-rose-100",
        side === "right" ? "-right-2" : "-left-2",
      )}
      aria-hidden="true"
    />
  );
}
