import { sample, shuffle, type Rng } from "@/lib/random";
import { siteConfig } from "@/config/site";
import {
  DIFFICULTY_SIZE,
  type Article,
  type Concept,
  type Difficulty,
  type ResolvedActivity,
  type OndeEstaActivity,
  type WhereQuestion,
} from "@/content/types";

export interface WhereRoundQuestion {
  target: Concept;
  prompt: string;
  options: Concept[];
  audio?: string;
}

const VERB: Record<Article, string> = { o: "está", a: "está", os: "estão", as: "estão" };

export function defaultPrompt(concept: Concept): string {
  return `Onde ${VERB[concept.article]} ${concept.article} ${concept.word.toLocaleLowerCase("pt-BR")}?`;
}

/**
 * Monta a sequência de perguntas de uma partida.
 * - Perguntas fixas (se houver) ou sorteadas do conjunto da atividade.
 * - Alternativas sem repetição, com a resposta certa em posição variada,
 *   evitando repetir a posição da pergunta anterior.
 */
export function createWhereRound(
  activity: ResolvedActivity<OndeEstaActivity>,
  difficulty: Difficulty,
  rng: Rng,
): WhereRoundQuestion[] {
  const optionCount = DIFFICULTY_SIZE[difficulty];
  const pool = activity.items;
  const byId = new Map([...activity.extras, ...pool].map((c) => [c.id, c]));
  const count = activity.questionsPerRound ?? siteConfig.defaultQuestionsPerRound;

  const specs =
    activity.questions && activity.questions.length > 0
      ? shuffle(activity.questions, rng).slice(0, count)
      : sample(pool, count, rng).map((c): WhereQuestion => ({ targetId: c.id }));

  let previousIndex = -1;
  return specs.map((spec) => {
    const target = byId.get(spec.targetId);
    if (!target) throw new Error(`Alvo inexistente: ${spec.targetId}`);

    const fixed = (spec.distractorIds ?? [])
      .map((id) => byId.get(id))
      .filter((c): c is Concept => !!c && c.id !== target.id);
    const fixedIds = new Set(fixed.map((c) => c.id));
    const extra = sample(
      pool.filter((c) => c.id !== target.id && !fixedIds.has(c.id)),
      optionCount - 1,
      rng,
    );
    const distractors = [...shuffle(fixed, rng), ...extra].slice(0, optionCount - 1);

    let options = shuffle([target, ...distractors], rng);
    let idx = options.indexOf(target);
    if (idx === previousIndex && options.length > 1) {
      const swap = (idx + 1 + Math.floor(rng() * (options.length - 1))) % options.length;
      options = options.slice();
      [options[idx], options[swap]] = [options[swap], options[idx]];
      idx = swap;
    }
    previousIndex = idx;

    return { target, options, prompt: spec.prompt ?? defaultPrompt(target), audio: spec.audio };
  });
}

export interface WhereState {
  index: number;
  total: number;
  /** Alternativas erradas já tocadas na pergunta atual. */
  wrong: string[];
  solved: boolean;
  done: boolean;
  missNonce: number;
}

export type WhereAction = { type: "answer"; id: string; correctId: string } | { type: "next" };

export function initialWhereState(total: number): WhereState {
  return { index: 0, total, wrong: [], solved: false, done: false, missNonce: 0 };
}

export function whereReducer(state: WhereState, action: WhereAction): WhereState {
  if (state.done) return state;
  if (action.type === "answer") {
    if (state.solved || state.wrong.includes(action.id)) return state;
    if (action.id === action.correctId) return { ...state, solved: true };
    return { ...state, wrong: [...state.wrong, action.id], missNonce: state.missNonce + 1 };
  }
  if (!state.solved) return state;
  if (state.index + 1 >= state.total) return { ...state, done: true };
  return { ...state, index: state.index + 1, wrong: [], solved: false };
}
