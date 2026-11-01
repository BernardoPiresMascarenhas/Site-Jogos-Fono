import { shuffle, type Rng } from "@/lib/random";
import { DIFFICULTY_LABEL, type BankItemBase, type Difficulty } from "@/content/types";

/** Itens de um banco que podem aparecer no nível escolhido. */
export function itemsForLevel<T extends BankItemBase>(items: readonly T[], difficulty: Difficulty): T[] {
  return items.filter((item) => !item.levels || item.levels.includes(difficulty));
}

/**
 * Regra comum de disponibilidade: a combinação categoria × nível só fica
 * habilitada se houver itens suficientes para uma partida.
 */
export function minimumAvailability(
  count: number,
  minimum: number,
  difficulty: Difficulty,
  noun: string,
): string | null {
  if (count >= minimum) return null;
  const level = DIFFICULTY_LABEL[difficulty].toLowerCase();
  if (count === 0) return `Ainda não há ${noun} no nível ${level} nesta categoria.`;
  return `Só ${count} ${count === 1 ? noun.replace(/s$/, "") : noun} no nível ${level} nesta categoria (mínimo ${minimum}).`;
}

/**
 * Embaralha as alternativas e evita que a resposta fique na mesma posição da
 * pergunta anterior (para a criança não "decorar" o lugar).
 */
export function shuffleAvoidingIndex<T>(options: readonly T[], answer: T, previousIndex: number, rng: Rng): { options: T[]; index: number } {
  let out = shuffle(options, rng);
  let idx = out.indexOf(answer);
  if (idx === previousIndex && out.length > 1) {
    const swap = (idx + 1 + Math.floor(rng() * (out.length - 1))) % out.length;
    out = out.slice();
    [out[idx], out[swap]] = [out[swap], out[idx]];
    idx = swap;
  }
  return { options: out, index: idx };
}

/* ------------------------------------------------------------------ */
/* Estado de partida para jogos de escolha única                       */
/* ------------------------------------------------------------------ */

export interface ChoiceState {
  index: number;
  total: number;
  /** Alternativas erradas já tocadas na pergunta atual. */
  wrong: string[];
  /** Alternativa certa escolhida (null enquanto não resolvida). */
  solvedId: string | null;
  done: boolean;
  missNonce: number;
}

export type ChoiceAction = { type: "answer"; id: string; correctIds: readonly string[] } | { type: "next" };

export function initialChoiceState(total: number): ChoiceState {
  return { index: 0, total, wrong: [], solvedId: null, done: false, missNonce: 0 };
}

/**
 * Regras:
 *  - depois do acerto, novos toques são ignorados até "próxima";
 *  - tocar de novo numa alternativa errada não conta outra vez;
 *  - "próxima" só funciona depois do acerto (evita pular perguntas com cliques rápidos).
 */
export function choiceReducer(state: ChoiceState, action: ChoiceAction): ChoiceState {
  if (state.done) return state;
  if (action.type === "answer") {
    if (state.solvedId !== null || state.wrong.includes(action.id)) return state;
    if (action.correctIds.includes(action.id)) return { ...state, solvedId: action.id };
    return { ...state, wrong: [...state.wrong, action.id], missNonce: state.missNonce + 1 };
  }
  if (state.solvedId === null) return state;
  if (state.index + 1 >= state.total) return { ...state, done: true };
  return { ...state, index: state.index + 1, wrong: [], solvedId: null };
}
