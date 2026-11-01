import { sample, shuffle, type Rng } from "@/lib/random";
import type { Concept, Difficulty, InitialSoundSet, ResolvedActivity, SomInicialActivity } from "@/content/types";
import { itemsForLevel, minimumAvailability } from "../shared/bank";

export const SOUND_ROUND = 3;
export const SOUND_MIN = 3;

/** Quantas figuras-alvo e quantos distratores por nível; `near` = máximo de distratores de som próximo. */
export const SOUND_LAYOUT: Record<Difficulty, { targets: number; distractors: number; near: number }> = {
  facil: { targets: 2, distractors: 2, near: 0 },
  medio: { targets: 3, distractors: 3, near: 1 },
  dificil: { targets: 3, distractors: 5, near: 3 },
};

export function soundAvailability(items: readonly InitialSoundSet[], difficulty: Difficulty): string | null {
  return minimumAvailability(itemsForLevel(items, difficulty).length, SOUND_MIN, difficulty, "sons");
}

export interface SoundRoundQuestion {
  id: string;
  phoneme: string;
  example: Concept;
  options: Concept[];
  targetIds: string[];
}

export function createSoundRound(activity: ResolvedActivity<SomInicialActivity>, difficulty: Difficulty, rng: Rng): SoundRoundQuestion[] {
  const layout = SOUND_LAYOUT[difficulty];
  return sample(itemsForLevel(activity.items, difficulty), SOUND_ROUND, rng).map((set) => {
    const targets = sample(set.targetIds, layout.targets, rng);
    const near = sample(set.nearIds ?? [], layout.near, rng);
    const far = sample(set.distractorIds, layout.distractors - near.length, rng);
    const options = shuffle([...targets, ...near, ...far], rng).map((id) => activity.lexicon[id]);
    return { id: set.id, phoneme: set.phoneme, example: activity.lexicon[set.exampleId], options, targetIds: targets };
  });
}

/* ------------------------------------------------------------------ */
/* Estado: seleção múltipla + conferência                              */
/* ------------------------------------------------------------------ */

export interface SoundCheck {
  correct: string[];
  wrong: string[];
  missed: string[];
}

export interface SoundState {
  index: number;
  total: number;
  selected: string[];
  checked: SoundCheck | null;
  solved: boolean;
  done: boolean;
  missNonce: number;
}

export type SoundAction =
  | { type: "toggle"; id: string }
  | { type: "check"; targetIds: readonly string[] }
  | { type: "next" };

export function initialSoundState(total: number): SoundState {
  return { index: 0, total, selected: [], checked: null, solved: false, done: false, missNonce: 0 };
}

export function evaluateSelection(selected: readonly string[], targetIds: readonly string[]): SoundCheck {
  return {
    correct: selected.filter((id) => targetIds.includes(id)),
    wrong: selected.filter((id) => !targetIds.includes(id)),
    missed: targetIds.filter((id) => !selected.includes(id)),
  };
}

export function soundReducer(state: SoundState, action: SoundAction): SoundState {
  if (state.done) return state;
  switch (action.type) {
    case "toggle": {
      if (state.solved) return state;
      const selected = state.selected.includes(action.id)
        ? state.selected.filter((id) => id !== action.id)
        : [...state.selected, action.id];
      return { ...state, selected, checked: null };
    }
    case "check": {
      if (state.solved || state.selected.length === 0) return state;
      const checked = evaluateSelection(state.selected, action.targetIds);
      const solved = checked.wrong.length === 0 && checked.missed.length === 0;
      return { ...state, checked, solved, missNonce: solved ? state.missNonce : state.missNonce + 1 };
    }
    case "next":
      if (!state.solved) return state;
      if (state.index + 1 >= state.total) return { ...state, done: true };
      return { ...state, index: state.index + 1, selected: [], checked: null, solved: false };
  }
}
