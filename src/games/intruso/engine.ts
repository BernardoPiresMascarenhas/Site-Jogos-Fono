import { sample, type Rng } from "@/lib/random";
import { DIFFICULTY_SIZE, type Concept, type Difficulty, type IntrusoQuestion, type ResolvedActivity, type IntrusoActivity } from "@/content/types";
import { itemsForLevel, minimumAvailability, shuffleAvoidingIndex } from "../shared/bank";

export const INTRUSO_ROUND = 5;
export const INTRUSO_MIN = 3;

export function intrusoAvailability(items: readonly IntrusoQuestion[], difficulty: Difficulty): string | null {
  return minimumAvailability(itemsForLevel(items, difficulty).length, INTRUSO_MIN, difficulty, "desafios");
}

export interface IntrusoRoundQuestion {
  id: string;
  prompt: string;
  intruder: Concept;
  options: Concept[];
  explanation: string;
}

/**
 * Monta a partida: questões sem repetição; em cada uma, sorteia membros do
 * grupo (2, 3 ou 5) e junta o intruso, em posição variada.
 */
export function createIntrusoRound(
  activity: ResolvedActivity<IntrusoActivity>,
  difficulty: Difficulty,
  rng: Rng,
): IntrusoRoundQuestion[] {
  const pool = itemsForLevel(activity.items, difficulty);
  const chosen = sample(pool, INTRUSO_ROUND, rng);
  const size = DIFFICULTY_SIZE[difficulty];
  let previous = -1;
  return chosen.map((q) => {
    const intruder = activity.lexicon[q.intruderId];
    const members = sample(q.groupIds, size - 1, rng).map((id) => activity.lexicon[id]);
    const { options, index } = shuffleAvoidingIndex([...members, intruder], intruder, previous, rng);
    previous = index;
    return {
      id: q.id,
      prompt: q.prompt ?? "Qual destas imagens não pertence ao grupo?",
      intruder,
      options,
      explanation: q.explanation,
    };
  });
}
