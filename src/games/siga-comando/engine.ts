import { sample, type Rng } from "@/lib/random";
import { LANDMARK_ZONES } from "@/content/games/siga-comando";
import type {
  CommandGoal,
  CommandQuestion,
  Difficulty,
  Relation,
  ResolvedActivity,
  ScenePosition,
  SigaComandoActivity,
} from "@/content/types";
import { itemsForLevel, minimumAvailability } from "../shared/bank";

export const COMMAND_ROUND = 4;
export const COMMAND_MIN = 3;
/** Quantos objetos cabem em cada área de destino. */
export const ZONE_CAPACITY = 2;

export function commandAvailability(items: readonly CommandQuestion[], difficulty: Difficulty): string | null {
  return minimumAvailability(itemsForLevel(items, difficulty).length, COMMAND_MIN, difficulty, "comandos");
}

export function createCommandRound(
  activity: ResolvedActivity<SigaComandoActivity>,
  difficulty: Difficulty,
  rng: Rng,
): CommandQuestion[] {
  return sample(itemsForLevel(activity.items, difficulty), COMMAND_ROUND, rng);
}

export function zonesOf(landmarkId: string): Relation[] {
  return LANDMARK_ZONES[landmarkId] ?? ["em-cima", "embaixo", "ao-lado"];
}

export function samePosition(a: ScenePosition, b: ScenePosition): boolean {
  if (a.at === "chao" || b.at === "chao") return a.at === b.at;
  return a.at === b.at && "relation" in a && "relation" in b && a.relation === b.relation;
}

export function positionKey(p: ScenePosition): string {
  return p.at === "chao" ? "chao" : `${p.at}:${(p as { relation: Relation }).relation}`;
}

export function goalSatisfied(goal: CommandGoal, pos: ScenePosition | undefined): boolean {
  if (!pos) return false;
  if (goal.relation === "fora") return !(pos.at === goal.landmarkId && "relation" in pos && pos.relation === "dentro");
  return pos.at === goal.landmarkId && "relation" in pos && pos.relation === goal.relation;
}

export type CheckResult = "ok" | "incomplete" | "extra" | "order";

/**
 * Confere a cena:
 *  - todas as metas cumpridas na posição final;
 *  - nenhum outro objeto fora do lugar inicial (só se move o que o comando pede);
 *  - nos comandos com ordem, a última ação de cada objeto-meta segue a ordem das metas.
 */
export function checkCommand(
  command: CommandQuestion,
  positions: Record<string, ScenePosition>,
  history: readonly { objectId: string }[],
): CheckResult {
  if (!command.goals.every((g) => goalSatisfied(g, positions[g.objectId]))) return "incomplete";
  const goalObjects = new Set(command.goals.map((g) => g.objectId));
  const moved = command.objects.some((o) => !goalObjects.has(o.id) && !samePosition(positions[o.id], o.start));
  if (moved) return "extra";
  if (command.ordered) {
    const lastMove = command.goals.map((g) => {
      for (let i = history.length - 1; i >= 0; i--) if (history[i].objectId === g.objectId) return i;
      return -1;
    });
    for (let i = 1; i < lastMove.length; i++) if (lastMove[i] <= lastMove[i - 1]) return "order";
  }
  return "ok";
}

/* ------------------------------------------------------------------ */
/* Estado da cena                                                      */
/* ------------------------------------------------------------------ */

export interface CommandState {
  index: number;
  total: number;
  positions: Record<string, ScenePosition>;
  history: { objectId: string; to: ScenePosition }[];
  selected: string | null;
  result: { kind: CheckResult; nonce: number } | null;
  /** Avisos sem erro (ex.: lugar cheio). */
  notice: { kind: "full"; nonce: number } | null;
  solved: boolean;
  done: boolean;
}

export type CommandAction =
  | { type: "select"; objectId: string }
  | { type: "move"; objectId: string; to: ScenePosition }
  | { type: "place"; to: ScenePosition }
  | { type: "check"; command: CommandQuestion }
  | { type: "reset"; command: CommandQuestion }
  | { type: "next"; nextCommand: CommandQuestion | null };

export function startPositions(command: CommandQuestion): Record<string, ScenePosition> {
  return Object.fromEntries(command.objects.map((o) => [o.id, o.start]));
}

export function initialCommandState(round: CommandQuestion[]): CommandState {
  return {
    index: 0,
    total: round.length,
    positions: round[0] ? startPositions(round[0]) : {},
    history: [],
    selected: null,
    result: null,
    notice: null,
    solved: false,
    done: false,
  };
}

function occupancy(positions: Record<string, ScenePosition>, to: ScenePosition, except: string): number {
  return Object.entries(positions).filter(([id, p]) => id !== except && samePosition(p, to)).length;
}

function moveObject(state: CommandState, objectId: string, to: ScenePosition): CommandState {
  const current = state.positions[objectId];
  if (!current) return state;
  if (samePosition(current, to)) return { ...state, selected: null };
  if (to.at !== "chao" && occupancy(state.positions, to, objectId) >= ZONE_CAPACITY) {
    return { ...state, selected: null, notice: { kind: "full", nonce: (state.notice?.nonce ?? 0) + 1 } };
  }
  return {
    ...state,
    positions: { ...state.positions, [objectId]: to },
    history: [...state.history, { objectId, to }],
    selected: null,
    result: null,
  };
}

export function commandReducer(state: CommandState, action: CommandAction): CommandState {
  if (state.done) return state;
  switch (action.type) {
    case "select":
      if (state.solved || !(action.objectId in state.positions)) return state;
      return { ...state, selected: state.selected === action.objectId ? null : action.objectId };
    case "move":
      if (state.solved) return state;
      return moveObject(state, action.objectId, action.to);
    case "place":
      if (state.solved || !state.selected) return state;
      return moveObject(state, state.selected, action.to);
    case "check": {
      if (state.solved) return state;
      const kind = checkCommand(action.command, state.positions, state.history);
      const nonce = (state.result?.nonce ?? 0) + 1;
      return { ...state, selected: null, result: { kind, nonce }, solved: kind === "ok" };
    }
    case "reset":
      if (state.solved) return state;
      return { ...state, positions: startPositions(action.command), history: [], selected: null, result: null };
    case "next":
      if (!state.solved) return state;
      if (!action.nextCommand || state.index + 1 >= state.total) return { ...state, done: true };
      return {
        ...state,
        index: state.index + 1,
        positions: startPositions(action.nextCommand),
        history: [],
        selected: null,
        result: null,
        notice: null,
        solved: false,
      };
  }
}
