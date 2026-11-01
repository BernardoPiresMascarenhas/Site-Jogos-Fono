import { sample, shuffleDifferent, type Rng } from "@/lib/random";
import type { Difficulty, MonteFraseActivity, ResolvedActivity, SentenceQuestion } from "@/content/types";
import { itemsForLevel, minimumAvailability } from "../shared/bank";

export const SENTENCE_ROUND = 4;
export const SENTENCE_MIN = 3;

/** Fácil = 3 peças, médio = 4 ou 5, difícil = 6 ou mais. */
export function sentenceFitsLevel(s: SentenceQuestion, difficulty: Difficulty): boolean {
  const n = s.tokens.length;
  if (difficulty === "facil") return n === 3;
  if (difficulty === "medio") return n === 4 || n === 5;
  return n >= 6;
}

function usable(items: readonly SentenceQuestion[], difficulty: Difficulty) {
  return itemsForLevel(items, difficulty).filter((s) => sentenceFitsLevel(s, difficulty));
}

export function sentenceAvailability(items: readonly SentenceQuestion[], difficulty: Difficulty): string | null {
  return minimumAvailability(usable(items, difficulty).length, SENTENCE_MIN, difficulty, "frases");
}

/** Normaliza para comparação: minúsculas, sem pontuação, espaços simples. */
export function normalizeSentence(text: string): string {
  return text
    .toLocaleLowerCase("pt-BR")
    .replace(/[.,!?;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function acceptedSentences(s: SentenceQuestion): string[] {
  return [s.tokens.map((t) => t.text).join(" "), ...(s.alternatives ?? [])].map(normalizeSentence);
}

/** "o menino come a maçã" → "O menino come a maçã." */
export function formatSentence(words: readonly string[]): string {
  const text = words.join(" ");
  return text.charAt(0).toLocaleUpperCase("pt-BR") + text.slice(1) + ".";
}

export interface SentencePiece {
  key: string;
  text: string;
  imageId?: string;
}

export interface SentenceRoundQuestion {
  id: string;
  /** Peças na ordem principal. */
  pieces: SentencePiece[];
  /** Ordem embaralhada da bandeja (chaves). */
  tray: string[];
  accepted: string[];
  sceneIds: string[];
}

export function createSentenceRound(
  activity: ResolvedActivity<MonteFraseActivity>,
  difficulty: Difficulty,
  rng: Rng,
): SentenceRoundQuestion[] {
  return sample(usable(activity.items, difficulty), SENTENCE_ROUND, rng).map((s) => {
    const pieces = s.tokens.map((t, i) => ({ key: `${s.id}:${i}`, text: t.text, ...(t.imageId ? { imageId: t.imageId } : {}) }));
    const keys = pieces.map((p) => p.key);
    // A bandeja nunca começa já na ordem certa (nem em ordem aceita).
    let tray = shuffleDifferent(keys, keys, rng);
    const accepted = acceptedSentences(s);
    const textOf = new Map(pieces.map((p) => [p.key, p.text]));
    for (let i = 0; i < 6 && accepted.includes(normalizeSentence(tray.map((k) => textOf.get(k)).join(" "))); i++) {
      tray = shuffleDifferent(keys, tray, rng);
    }
    return { id: s.id, pieces, tray, accepted, sceneIds: s.sceneIds ?? [] };
  });
}

/* ------------------------------------------------------------------ */
/* Estado: espaços da frase                                             */
/* ------------------------------------------------------------------ */

export interface SentenceState {
  index: number;
  total: number;
  /** Peça em cada espaço (chave) ou null. */
  slots: (string | null)[];
  /** Espaços que divergem da resposta mais próxima após "Conferir". */
  wrongSlots: number[];
  solved: boolean;
  done: boolean;
  missNonce: number;
  /** Última peça colocada (para animar). */
  lastPlaced: string | null;
}

export type SentenceAction =
  | { type: "place"; key: string; slot?: number }
  | { type: "remove"; slot: number }
  | { type: "check"; textOf: Record<string, string>; accepted: readonly string[] }
  | { type: "next"; size: number | null };

export function initialSentenceState(round: SentenceRoundQuestion[]): SentenceState {
  return {
    index: 0,
    total: round.length,
    slots: Array(round[0]?.pieces.length ?? 0).fill(null),
    wrongSlots: [],
    solved: false,
    done: false,
    missNonce: 0,
    lastPlaced: null,
  };
}

/** Compara com cada frase aceita e devolve as posições diferentes da mais parecida. */
export function closestMismatch(words: readonly string[], accepted: readonly string[]): number[] {
  let best: number[] | null = null;
  for (const sentence of accepted) {
    const target = sentence.split(" ");
    // Uma peça pode ter mais de uma palavra ("em cima"): compara peça a peça pela sequência.
    let cursor = 0;
    const mismatches: number[] = [];
    words.forEach((w, i) => {
      const parts = normalizeSentence(w).split(" ");
      const slice = target.slice(cursor, cursor + parts.length).join(" ");
      if (slice !== parts.join(" ")) mismatches.push(i);
      cursor += parts.length;
    });
    if (!best || mismatches.length < best.length) best = mismatches;
  }
  return best ?? [];
}

export function sentenceReducer(state: SentenceState, action: SentenceAction): SentenceState {
  if (state.done) return state;
  switch (action.type) {
    case "place": {
      if (state.solved) return state;
      const from = state.slots.indexOf(action.key);
      const target = action.slot ?? state.slots.indexOf(null);
      if (target < 0 || target >= state.slots.length || target === from) return state;
      const slots = state.slots.slice();
      const occupant = slots[target];
      slots[target] = action.key;
      if (from >= 0) slots[from] = occupant; // troca de lugar entre espaços
      // se a peça veio da bandeja e o espaço estava ocupado, o ocupante volta para a bandeja
      return { ...state, slots, wrongSlots: [], lastPlaced: action.key };
    }
    case "remove": {
      if (state.solved || !state.slots[action.slot]) return state;
      const slots = state.slots.slice();
      slots[action.slot] = null;
      return { ...state, slots, wrongSlots: [], lastPlaced: null };
    }
    case "check": {
      if (state.solved || state.slots.some((s) => s === null)) return state;
      const words = state.slots.map((k) => action.textOf[k as string]);
      const built = normalizeSentence(words.join(" "));
      if (action.accepted.includes(built)) return { ...state, solved: true, wrongSlots: [] };
      return { ...state, wrongSlots: closestMismatch(words, action.accepted), missNonce: state.missNonce + 1 };
    }
    case "next":
      if (!state.solved) return state;
      if (action.size === null || state.index + 1 >= state.total) return { ...state, done: true };
      return { ...state, index: state.index + 1, slots: Array(action.size).fill(null), wrongSlots: [], solved: false, lastPlaced: null };
  }
}
