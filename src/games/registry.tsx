"use client";

import type { ComponentType } from "react";
import type { GameType, ResolvedActivity } from "@/content/types";
import { LigarGame } from "./ligar/ligar-game";
import { MemoriaGame } from "./memoria/memoria-game";
import { OndeEstaGame } from "./onde-esta/onde-esta-game";
import type { GameProps } from "./shared/types";

/**
 * Registro dos motores de jogo. Para um novo tipo de jogo:
 *  1. adicione o tipo em src/content/types.ts (GameType + interface da atividade);
 *  2. crie a pasta src/games/<tipo> com engine.ts (regras) e <tipo>-game.tsx (tela);
 *  3. registre aqui e em src/games/meta.ts / src/games/icons.tsx.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- cada motor recebe a sua variante de atividade
export const GAME_COMPONENTS: Record<GameType, ComponentType<GameProps<any>>> = {
  ligar: LigarGame,
  memoria: MemoriaGame,
  "onde-esta": OndeEstaGame,
};

export function getGameComponent(activity: ResolvedActivity): ComponentType<GameProps> {
  return GAME_COMPONENTS[activity.type];
}
