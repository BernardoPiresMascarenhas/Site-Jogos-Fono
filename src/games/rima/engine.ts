import { sample, type Rng } from "@/lib/random";
import { DIFFICULTY_SIZE, type Concept, type Difficulty, type ResolvedActivity, type RhymeQuestion, type RimaActivity } from "@/content/types";
import { itemsForLevel, minimumAvailability, shuffleAvoidingIndex } from "../shared/bank";

export const RHYME_ROUND = 5;
export const RHYME_MIN = 4;

export function rhymeAvailability(items: readonly RhymeQuestion[], difficulty: Difficulty): string | null {
  return minimumAvailability(itemsForLevel(items, difficulty).length, RHYME_MIN, difficulty, "rimas");
}

export interface RhymeRoundQuestion {
  id: string;
  target: Concept;
  /** A alternativa que rima (exatamente uma por pergunta). */
  answer: Concept;
  options: Concept[];
}

/**
 * Cada pergunta mostra UMA palavra que rima (sorteada entre as cadastradas)
 * e distratores que não rimam — assim nunca há duas respostas possíveis.
 */
export function createRhymeRound(activity: ResolvedActivity<RimaActivity>, difficulty: Difficulty, rng: Rng): RhymeRoundQuestion[] {
  const chosen = sample(itemsForLevel(activity.items, difficulty), RHYME_ROUND, rng);
  const size = DIFFICULTY_SIZE[difficulty];
  let previous = -1;
  return chosen.map((q) => {
    const [answerId] = sample(q.correctIds, 1, rng);
    const answer = activity.lexicon[answerId];
    const distractors = sample(q.distractorIds, size - 1, rng).map((id) => activity.lexicon[id]);
    const { options, index } = shuffleAvoidingIndex([answer, ...distractors], answer, previous, rng);
    previous = index;
    return { id: q.id, target: activity.lexicon[q.targetId], answer, options };
  });
}
