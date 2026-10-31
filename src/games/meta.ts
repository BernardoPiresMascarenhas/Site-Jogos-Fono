import type { GameType } from "@/content/types";

/** Metadados de exibição de cada tipo de jogo (sem dependências de React). */
export const GAME_TYPE_META: Record<
  GameType,
  { label: string; shortLabel: string; itemNoun: string; summary: string }
> = {
  ligar: {
    label: "Ligue as imagens",
    shortLabel: "Ligar",
    itemNoun: "palavras",
    summary: "Associação de palavra e imagem",
  },
  memoria: {
    label: "Jogo da memória",
    shortLabel: "Memória",
    itemNoun: "figuras",
    summary: "Pares de cartas para encontrar",
  },
  "onde-esta": {
    label: "Onde está?",
    shortLabel: "Onde está?",
    itemNoun: "imagens",
    summary: "Identificação de imagens",
  },
};

export const GAME_TYPES = Object.keys(GAME_TYPE_META) as GameType[];
