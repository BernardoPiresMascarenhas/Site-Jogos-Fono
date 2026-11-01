import { sample, shuffle, type Rng } from "@/lib/random";
import { DIFFICULTY_LABEL, type Concept, type DesapareceuActivity, type Difficulty, type DisappearItem, type ResolvedActivity } from "@/content/types";
import { shuffleAvoidingIndex } from "../shared/bank";

export const DISAPPEAR_ROUND = 5;

/** Objetos exibidos e alternativas por nível. */
export const DISAPPEAR_LAYOUT: Record<Difficulty, { shown: number; options: number; keepPositions: boolean }> = {
  facil: { shown: 3, options: 3, keepPositions: true },
  medio: { shown: 5, options: 4, keepPositions: false },
  dificil: { shown: 6, options: 4, keepPositions: false },
};

/** Figuras distintas necessárias: exibidas + distratores que não estavam na tela. */
export function disappearNeeded(difficulty: Difficulty): number {
  const l = DISAPPEAR_LAYOUT[difficulty];
  const visibleDistractors = l.options >= 4 ? 1 : 0;
  return l.shown + (l.options - 1 - visibleDistractors);
}

export function disappearAvailability(items: readonly DisappearItem[], difficulty: Difficulty): string | null {
  const unique = new Set(items.map((i) => i.conceptId)).size;
  const needed = disappearNeeded(difficulty);
  if (unique >= needed) return null;
  return `O nível ${DIFFICULTY_LABEL[difficulty].toLowerCase()} precisa de ${needed} figuras diferentes; esta categoria tem ${unique}.`;
}

export interface DisappearRoundQuestion {
  /** Figuras da fase de observação, na ordem exibida. */
  shown: Concept[];
  target: Concept;
  /** Fase da pergunta: figuras restantes (null = espaço vazio, só no fácil). */
  remaining: (Concept | null)[];
  options: Concept[];
}

/**
 * Garantias: o objeto que some sempre estava na fase inicial; as alternativas
 * contêm a resposta e distratores diferentes entre si (um ainda visível e os
 * demais que nunca apareceram); o mesmo objeto não some duas vezes na partida.
 */
export function createDisappearRound(
  activity: ResolvedActivity<DesapareceuActivity>,
  difficulty: Difficulty,
  rng: Rng,
): DisappearRoundQuestion[] {
  const layout = DISAPPEAR_LAYOUT[difficulty];
  const pool = Array.from(new Map(activity.items.map((i) => [i.conceptId, activity.lexicon[i.conceptId]])).values());
  const used = new Set<string>();
  const out: DisappearRoundQuestion[] = [];
  let previous = -1;
  for (let q = 0; q < DISAPPEAR_ROUND; q++) {
    const fresh = pool.filter((c) => !used.has(c.id));
    const target = sample(fresh.length ? fresh : pool, 1, rng)[0];
    used.add(target.id);
    const others = sample(pool.filter((c) => c.id !== target.id), layout.shown - 1, rng);
    const shown = shuffle([target, ...others], rng);
    const remaining = layout.keepPositions
      ? shown.map((c) => (c.id === target.id ? null : c))
      : shuffle(others, rng);
    const visibleDistractor = layout.options >= 4 ? sample(others, 1, rng) : [];
    const absent = sample(
      pool.filter((c) => !shown.some((s) => s.id === c.id)),
      layout.options - 1 - visibleDistractor.length,
      rng,
    );
    const { options, index } = shuffleAvoidingIndex([target, ...visibleDistractor, ...absent], target, previous, rng);
    previous = index;
    out.push({ shown, target, remaining, options });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Estado: observar → esconder → perguntar                              */
/* ------------------------------------------------------------------ */

export type DisappearPhase = "observe" | "hiding" | "question";

export interface DisappearState {
  index: number;
  total: number;
  phase: DisappearPhase;
  wrong: string[];
  solvedId: string | null;
  done: boolean;
  missNonce: number;
}

export type DisappearAction =
  | { type: "ready" }
  | { type: "revealed" }
  | { type: "answer"; id: string; correctId: string }
  | { type: "next" };

export function initialDisappearState(total: number): DisappearState {
  return { index: 0, total, phase: "observe", wrong: [], solvedId: null, done: false, missNonce: 0 };
}

export function disappearReducer(state: DisappearState, action: DisappearAction): DisappearState {
  if (state.done) return state;
  switch (action.type) {
    case "ready":
      return state.phase === "observe" ? { ...state, phase: "hiding" } : state;
    case "revealed":
      return state.phase === "hiding" ? { ...state, phase: "question" } : state;
    case "answer":
      if (state.phase !== "question" || state.solvedId !== null || state.wrong.includes(action.id)) return state;
      if (action.id === action.correctId) return { ...state, solvedId: action.id };
      return { ...state, wrong: [...state.wrong, action.id], missNonce: state.missNonce + 1 };
    case "next":
      if (state.solvedId === null) return state;
      if (state.index + 1 >= state.total) return { ...state, done: true };
      return { ...state, index: state.index + 1, phase: "observe", wrong: [], solvedId: null };
  }
}
