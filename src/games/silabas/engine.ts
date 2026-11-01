import { sample, type Rng } from "@/lib/random";
import { SYLLABLE_CHOICES } from "@/content/games/silabas";
import type { Concept, Difficulty, ResolvedActivity, SilabasActivity, SyllableItem } from "@/content/types";
import { itemsForLevel, minimumAvailability } from "../shared/bank";

export const SYLLABLE_ROUND = 6;
export const SYLLABLE_MIN = 4;

function usable(items: readonly SyllableItem[], difficulty: Difficulty) {
  const choices = SYLLABLE_CHOICES[difficulty];
  return itemsForLevel(items, difficulty).filter((i) => choices.includes(i.syllableCount));
}

export function syllableAvailability(items: readonly SyllableItem[], difficulty: Difficulty): string | null {
  return minimumAvailability(usable(items, difficulty).length, SYLLABLE_MIN, difficulty, "palavras");
}

export interface SyllableRoundQuestion {
  id: string;
  concept: Concept;
  syllables: string[];
  count: number;
  choices: number[];
}

export function createSyllableRound(
  activity: ResolvedActivity<SilabasActivity>,
  difficulty: Difficulty,
  rng: Rng,
): SyllableRoundQuestion[] {
  const chosen = sample(usable(activity.items, difficulty), SYLLABLE_ROUND, rng);
  // Evita três respostas iguais seguidas quando há variedade suficiente.
  const ordered: SyllableItem[] = [];
  const rest = chosen.slice();
  while (rest.length) {
    const idx = rest.findIndex(
      (item) => !(ordered.length >= 2 && ordered.at(-1)!.syllableCount === item.syllableCount && ordered.at(-2)!.syllableCount === item.syllableCount),
    );
    ordered.push(rest.splice(idx < 0 ? 0 : idx, 1)[0]);
  }
  return ordered.map((item) => ({
    id: item.id,
    concept: activity.lexicon[item.conceptId],
    syllables: item.syllables,
    count: item.syllableCount,
    choices: SYLLABLE_CHOICES[difficulty],
  }));
}
