import { sample, type Rng } from "@/lib/random";
import {
  DIFFICULTY_SIZE,
  type Concept,
  type Difficulty,
  type QuemSouEuActivity,
  type ResolvedActivity,
  type RiddleQuestion,
} from "@/content/types";
import { choiceReducer, initialChoiceState, itemsForLevel, minimumAvailability, shuffleAvoidingIndex, type ChoiceAction, type ChoiceState } from "../shared/bank";

export const RIDDLE_ROUND = 5;
export const RIDDLE_MIN = 3;

export function riddleAvailability(items: readonly RiddleQuestion[], difficulty: Difficulty): string | null {
  return minimumAvailability(itemsForLevel(items, difficulty).length, RIDDLE_MIN, difficulty, "adivinhas");
}

export interface RiddleRoundQuestion {
  id: string;
  answer: Concept;
  clues: string[];
  options: Concept[];
}

export function createRiddleRound(
  activity: ResolvedActivity<QuemSouEuActivity>,
  difficulty: Difficulty,
  rng: Rng,
): RiddleRoundQuestion[] {
  const chosen = sample(itemsForLevel(activity.items, difficulty), RIDDLE_ROUND, rng);
  const size = DIFFICULTY_SIZE[difficulty];
  let previous = -1;
  return chosen.map((q) => {
    const answer = activity.lexicon[q.answerId];
    const distractors = sample(q.distractorIds, size - 1, rng).map((id) => activity.lexicon[id]);
    const { options, index } = shuffleAvoidingIndex([answer, ...distractors], answer, previous, rng);
    previous = index;
    return { id: q.id, answer, clues: q.clues, options };
  });
}

/* Estado: escolha única + quantas pistas já foram reveladas. */

export interface RiddleState extends ChoiceState {
  revealed: number;
}

export type RiddleAction = ChoiceAction | { type: "reveal"; max: number };

export function initialRiddleState(total: number): RiddleState {
  return { ...initialChoiceState(total), revealed: 1 };
}

export function riddleReducer(state: RiddleState, action: RiddleAction): RiddleState {
  if (action.type === "reveal") {
    if (state.done || state.solvedId !== null || state.revealed >= action.max) return state;
    return { ...state, revealed: state.revealed + 1 };
  }
  const next = choiceReducer(state, action);
  if (next === state) return state;
  const advanced = next.index !== state.index;
  return { ...next, revealed: advanced ? 1 : state.revealed };
}
