import { sample, shuffle, type Rng } from "@/lib/random";
import type { Concept, Difficulty, EscuteActivity, ListenGroup, ResolvedActivity } from "@/content/types";
import { itemsForLevel, minimumAvailability, shuffleAvoidingIndex } from "../shared/bank";

export const LISTEN_ROUND = 6;
export const LISTEN_MIN = 3;
/** Nível → número de alternativas. */
export const LISTEN_OPTIONS: Record<Difficulty, number> = { facil: 2, medio: 3, dificil: 4 };

export type ListenMode = "profissional" | "audio";

/** Grupos cujas palavras têm todas uma gravação cadastrada. */
export function groupsWithAudio(groups: readonly ListenGroup[], hasAudio: (wordId: string) => boolean): ListenGroup[] {
  return groups.filter((g) => g.wordIds.every(hasAudio));
}

export function listenAvailability(items: readonly ListenGroup[], difficulty: Difficulty): string | null {
  return minimumAvailability(itemsForLevel(items, difficulty).length, LISTEN_MIN, difficulty, "pares mínimos");
}

export interface ListenRoundQuestion {
  id: string;
  contrast: string;
  target: Concept;
  options: Concept[];
}

/**
 * Alternativas: o alvo + os parceiros do par mínimo; se faltar alternativa
 * (pares no nível médio/difícil), completa com palavras de outros grupos.
 * No modo áudio, só entram grupos com gravação de todas as palavras.
 */
export function createListenRound(
  activity: ResolvedActivity<EscuteActivity>,
  difficulty: Difficulty,
  mode: ListenMode,
  rng: Rng,
): ListenRoundQuestion[] {
  let groups = itemsForLevel(activity.items, difficulty);
  if (mode === "audio") groups = groupsWithAudio(groups, (id) => Boolean(activity.lexicon[id]?.audio));
  const size = LISTEN_OPTIONS[difficulty];
  const allWords = Array.from(new Set(activity.items.flatMap((g) => g.wordIds)));
  const chosen = sample(groups, LISTEN_ROUND, rng);
  let previous = -1;
  return chosen.map((group) => {
    const [targetId] = sample(group.wordIds, 1, rng);
    const partners = shuffle(group.wordIds.filter((id) => id !== targetId), rng).slice(0, size - 1);
    const fill = sample(
      allWords.filter((id) => id !== targetId && !partners.includes(id)),
      size - 1 - partners.length,
      rng,
    );
    const target = activity.lexicon[targetId];
    const { options, index } = shuffleAvoidingIndex(
      [target, ...[...partners, ...fill].map((id) => activity.lexicon[id])],
      target,
      previous,
      rng,
    );
    previous = index;
    return { id: group.id, contrast: group.contrast, target, options };
  });
}
