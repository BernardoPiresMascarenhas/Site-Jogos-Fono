"use client";

import type { ComponentType } from "react";
import type { GameType, ResolvedActivity } from "@/content/types";
import { DesapareceuGame } from "./desapareceu/desapareceu-game";
import { EscuteGame } from "./escute/escute-game";
import { IntrusoGame } from "./intruso/intruso-game";
import { LigarGame } from "./ligar/ligar-game";
import { MemoriaGame } from "./memoria/memoria-game";
import { MonteFraseGame } from "./monte-frase/monte-frase-game";
import { OndeEstaGame } from "./onde-esta/onde-esta-game";
import { OrdemGame } from "./ordem/ordem-game";
import { QuemSouEuGame } from "./quem-sou-eu/quem-sou-eu-game";
import { RimaGame } from "./rima/rima-game";
import { SigaComandoGame } from "./siga-comando/siga-comando-game";
import { SilabasGame } from "./silabas/silabas-game";
import { SomInicialGame } from "./som-inicial/som-inicial-game";
import type { GameProps } from "./shared/types";

/**
 * Registro dos motores de jogo. Para um novo tipo de jogo:
 *  1. adicione o tipo em src/content/types.ts (GameType + interface dos itens);
 *  2. crie a pasta src/games/<tipo> com engine.ts (regras) e <tipo>-game.tsx (tela);
 *  3. registre aqui, em src/games/meta.ts, src/games/icons.tsx e src/games/availability.ts;
 *  4. cadastre o banco de questões em src/content/games e em src/content/banks.ts.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- cada motor recebe a sua variante de atividade
export const GAME_COMPONENTS: Record<GameType, ComponentType<GameProps<any>>> = {
  ligar: LigarGame,
  memoria: MemoriaGame,
  "onde-esta": OndeEstaGame,
  intruso: IntrusoGame,
  "quem-sou-eu": QuemSouEuGame,
  "siga-comando": SigaComandoGame,
  ordem: OrdemGame,
  "monte-frase": MonteFraseGame,
  silabas: SilabasGame,
  rima: RimaGame,
  "som-inicial": SomInicialGame,
  escute: EscuteGame,
  desapareceu: DesapareceuGame,
};

export function getGameComponent(activity: ResolvedActivity): ComponentType<GameProps> {
  return GAME_COMPONENTS[activity.type];
}
