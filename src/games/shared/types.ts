import type { Difficulty, ResolvedActivity } from "@/content/types";

export interface GameControls {
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  onRestart: () => void;
}

/** Props recebidas por todo motor de jogo. */
export interface GameProps<A extends ResolvedActivity = ResolvedActivity> {
  activity: A;
  /** Semente do embaralhamento desta partida. */
  seed: number;
  controls: GameControls;
}
