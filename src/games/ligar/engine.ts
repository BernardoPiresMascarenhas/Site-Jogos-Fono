import { sample, shuffle, shuffleDifferent, type Rng } from "@/lib/random";
import { DIFFICULTY_SIZE, type Concept, type Difficulty } from "@/content/types";

export interface LigarRound {
  pairs: Concept[];
  /** Ordem das palavras (coluna da esquerda). */
  wordOrder: string[];
  /** Ordem das imagens (coluna da direita), sempre diferente da ordem das palavras. */
  imageOrder: string[];
}

export function createLigarRound(items: Concept[], difficulty: Difficulty, rng: Rng): LigarRound {
  const unique = Array.from(new Map(items.map((c) => [c.id, c])).values());
  const pairs = sample(unique, DIFFICULTY_SIZE[difficulty], rng);
  const wordOrder = shuffle(pairs.map((p) => p.id), rng);
  const imageOrder = shuffleDifferent(wordOrder, wordOrder, rng);
  return { pairs, wordOrder, imageOrder };
}

export type Side = "word" | "image";

export interface LigarState {
  selectedWord: string | null;
  selectedImage: string | null;
  /** Ids associados corretamente, na ordem em que foram encontrados. */
  matched: string[];
  /** Última tentativa errada (para animação de feedback). */
  miss: { wordId: string; imageId: string; nonce: number } | null;
  /** Último acerto (para animação de comemoração). */
  hit: { id: string; nonce: number } | null;
  attempts: number;
  total: number;
}

export type LigarAction = { type: "select"; side: Side; id: string } | { type: "clearMiss" };

export function initialLigarState(total: number): LigarState {
  return { selectedWord: null, selectedImage: null, matched: [], miss: null, hit: null, attempts: 0, total };
}

export function isLigarComplete(state: LigarState): boolean {
  return state.total > 0 && state.matched.length === state.total;
}

/**
 * A criança pode começar pela palavra ou pela imagem. Quando os dois lados estão
 * selecionados, verificamos o par: acerto confirma a associação; erro limpa a
 * seleção com um feedback suave para nova tentativa.
 */
export function ligarReducer(state: LigarState, action: LigarAction): LigarState {
  if (action.type === "clearMiss") return { ...state, miss: null };

  const { side, id } = action;
  if (state.matched.includes(id) || isLigarComplete(state)) return state;

  const selectedWord = side === "word" ? (state.selectedWord === id ? null : id) : state.selectedWord;
  const selectedImage = side === "image" ? (state.selectedImage === id ? null : id) : state.selectedImage;

  if (!selectedWord || !selectedImage) {
    return { ...state, selectedWord, selectedImage, miss: null };
  }

  const nonce = state.attempts + 1;
  if (selectedWord === selectedImage) {
    return {
      ...state,
      selectedWord: null,
      selectedImage: null,
      matched: [...state.matched, selectedWord],
      hit: { id: selectedWord, nonce },
      miss: null,
      attempts: nonce,
    };
  }
  return {
    ...state,
    selectedWord: null,
    selectedImage: null,
    miss: { wordId: selectedWord, imageId: selectedImage, nonce },
    attempts: nonce,
  };
}
