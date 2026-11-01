import type { Availability, Difficulty, ResolvedActivity } from "@/content/types";

export interface GameControls {
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  onRestart: () => void;
  /** Níveis indisponíveis neste pacote (com o motivo). */
  availability?: Availability;
  /** Link para a tela de configuração, com as escolhas atuais. */
  settingsHref?: string;
}

/** Props recebidas por todo motor de jogo. */
export interface GameProps<A extends ResolvedActivity = ResolvedActivity> {
  activity: A;
  /** Semente do embaralhamento desta partida. */
  seed: number;
  controls: GameControls;
  /** Opções escolhidas na configuração (ver GAME_TYPE_META[tipo].options). */
  options: Record<string, string>;
}
