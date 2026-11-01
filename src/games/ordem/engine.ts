import { sample, shuffleDifferent, type Rng } from "@/lib/random";
import type { Difficulty, OrdemActivity, Picture, ResolvedActivity, SequenceQuestion } from "@/content/types";
import { DIFFICULTY_LABEL } from "@/content/types";

export const SEQUENCE_ROUND = 3;
export const SEQUENCE_MIN = 2;

/** O nível vem do tamanho: fácil 3 figuras, médio 4, difícil 5 ou 6. */
export function sequenceFitsLevel(seq: SequenceQuestion, difficulty: Difficulty): boolean {
  const n = seq.steps.length;
  if (difficulty === "facil") return n === 3;
  if (difficulty === "medio") return n === 4;
  return n >= 5;
}

export function sequenceAvailability(items: readonly SequenceQuestion[], difficulty: Difficulty): string | null {
  const count = items.filter((s) => sequenceFitsLevel(s, difficulty)).length;
  if (count >= SEQUENCE_MIN) return null;
  const level = DIFFICULTY_LABEL[difficulty].toLowerCase();
  return count === 0
    ? `Ainda não há sequências no nível ${level} nesta categoria.`
    : `Só 1 sequência no nível ${level} nesta categoria (mínimo ${SEQUENCE_MIN}).`;
}

export interface SequenceRoundQuestion {
  id: string;
  title: string;
  description: string;
  /** Figuras na ordem correta. */
  steps: Picture[];
  /** Ordem inicial embaralhada (ids), sempre diferente da correta. */
  initial: string[];
}

export function createSequenceRound(
  activity: ResolvedActivity<OrdemActivity>,
  difficulty: Difficulty,
  rng: Rng,
): SequenceRoundQuestion[] {
  const fitting = activity.items.filter((s) => sequenceFitsLevel(s, difficulty));
  return sample(fitting, SEQUENCE_ROUND, rng).map((seq) => ({
    id: seq.id,
    title: seq.title,
    description: seq.description,
    steps: seq.steps.map((id) => activity.pictures[id]),
    initial: shuffleDifferent(seq.steps, seq.steps, rng),
  }));
}

/* ------------------------------------------------------------------ */
/* Estado: arranjo atual, seleção para troca e conferência              */
/* ------------------------------------------------------------------ */

export interface SequenceState {
  index: number;
  total: number;
  arrangement: string[];
  selected: number | null;
  /** Resultado da última conferência (por posição), ou null se mudou algo depois. */
  checked: boolean[] | null;
  solved: boolean;
  done: boolean;
  missNonce: number;
}

export type SequenceAction =
  | { type: "select"; position: number }
  | { type: "swap"; a: number; b: number }
  | { type: "check"; correct: readonly string[] }
  | { type: "next"; initial: string[] | null };

export function initialSequenceState(round: SequenceRoundQuestion[]): SequenceState {
  return {
    index: 0,
    total: round.length,
    arrangement: round[0]?.initial ?? [],
    selected: null,
    checked: null,
    solved: false,
    done: false,
    missNonce: 0,
  };
}

function swap(list: string[], a: number, b: number): string[] {
  const out = list.slice();
  [out[a], out[b]] = [out[b], out[a]];
  return out;
}

export function sequenceReducer(state: SequenceState, action: SequenceAction): SequenceState {
  if (state.done) return state;
  switch (action.type) {
    case "select": {
      if (state.solved || action.position < 0 || action.position >= state.arrangement.length) return state;
      if (state.selected === null) return { ...state, selected: action.position };
      if (state.selected === action.position) return { ...state, selected: null };
      return { ...state, arrangement: swap(state.arrangement, state.selected, action.position), selected: null, checked: null };
    }
    case "swap": {
      const { a, b } = action;
      const n = state.arrangement.length;
      if (state.solved || a === b || a < 0 || b < 0 || a >= n || b >= n) return state;
      return { ...state, arrangement: swap(state.arrangement, a, b), selected: null, checked: null };
    }
    case "check": {
      if (state.solved) return state;
      const checked = state.arrangement.map((id, i) => id === action.correct[i]);
      const solved = checked.every(Boolean);
      return { ...state, checked, solved, selected: null, missNonce: solved ? state.missNonce : state.missNonce + 1 };
    }
    case "next":
      if (!state.solved) return state;
      if (!action.initial || state.index + 1 >= state.total) return { ...state, done: true };
      return { ...state, index: state.index + 1, arrangement: action.initial, selected: null, checked: null, solved: false };
  }
}
