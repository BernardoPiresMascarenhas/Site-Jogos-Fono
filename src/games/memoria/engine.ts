import { sample, shuffle, type Rng } from "@/lib/random";
import { DIFFICULTY_SIZE, type Concept, type Difficulty, type MemoryMode } from "@/content/types";

export interface MemoryCardData {
  /** Id único da carta. */
  key: string;
  conceptId: string;
  face: "image" | "word";
}

export function createMemoryDeck(
  items: Concept[],
  difficulty: Difficulty,
  mode: MemoryMode,
  rng: Rng,
): { concepts: Concept[]; cards: MemoryCardData[] } {
  const unique = Array.from(new Map(items.map((c) => [c.id, c])).values());
  const concepts = sample(unique, DIFFICULTY_SIZE[difficulty], rng);
  const cards = concepts.flatMap<MemoryCardData>((c) => [
    { key: `${c.id}:a`, conceptId: c.id, face: "image" },
    { key: `${c.id}:b`, conceptId: c.id, face: mode === "palavra-imagem" ? "word" : "image" },
  ]);
  return { concepts, cards: shuffle(cards, rng) };
}

export interface MemoryState {
  cards: MemoryCardData[];
  /** Cartas viradas ainda não confirmadas (no máximo 2). */
  flipped: string[];
  /** Conceitos cujos pares já foram encontrados. */
  matched: string[];
  /** true enquanto duas cartas diferentes estão sendo mostradas antes de desvirar. */
  locked: boolean;
  moves: number;
  lastMatch: { conceptId: string; nonce: number } | null;
  lastMiss: { keys: [string, string]; nonce: number } | null;
}

export type MemoryAction = { type: "flip"; key: string } | { type: "hide" };

export function initialMemoryState(cards: MemoryCardData[]): MemoryState {
  return { cards, flipped: [], matched: [], locked: false, moves: 0, lastMatch: null, lastMiss: null };
}

export function pairsTotal(state: MemoryState): number {
  return state.cards.length / 2;
}

export function isMemoryComplete(state: MemoryState): boolean {
  return state.cards.length > 0 && state.matched.length === pairsTotal(state);
}

export function isCardFaceUp(state: MemoryState, card: MemoryCardData): boolean {
  return state.flipped.includes(card.key) || state.matched.includes(card.conceptId);
}

/**
 * Regras que evitam comportamentos estranhos com cliques rápidos:
 *  - enquanto `locked`, nenhuma carta vira;
 *  - cartas já viradas ou encontradas são ignoradas;
 *  - nunca há mais de duas cartas viradas sem par.
 */
export function memoryReducer(state: MemoryState, action: MemoryAction): MemoryState {
  if (action.type === "hide") {
    if (!state.locked) return state;
    return { ...state, flipped: [], locked: false };
  }

  if (state.locked || state.flipped.length >= 2) return state;
  const card = state.cards.find((c) => c.key === action.key);
  if (!card || isCardFaceUp(state, card)) return state;

  const flipped = [...state.flipped, card.key];
  if (flipped.length < 2) return { ...state, flipped };

  const [first, second] = flipped.map((k) => state.cards.find((c) => c.key === k)!);
  const moves = state.moves + 1;
  if (first.conceptId === second.conceptId) {
    return {
      ...state,
      flipped: [],
      matched: [...state.matched, first.conceptId],
      moves,
      lastMatch: { conceptId: first.conceptId, nonce: moves },
    };
  }
  return { ...state, flipped, locked: true, moves, lastMiss: { keys: [first.key, second.key], nonce: moves } };
}
