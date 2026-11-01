import type { BankActivityMap, BankGameType, Difficulty } from "@/content/types";
import { disappearAvailability } from "./desapareceu/engine";
import { listenAvailability } from "./escute/engine";
import { intrusoAvailability } from "./intruso/engine";
import { sentenceAvailability } from "./monte-frase/engine";
import { sequenceAvailability } from "./ordem/engine";
import { riddleAvailability } from "./quem-sou-eu/engine";
import { rhymeAvailability } from "./rima/engine";
import { commandAvailability } from "./siga-comando/engine";
import { syllableAvailability } from "./silabas/engine";
import { soundAvailability } from "./som-inicial/engine";

type AvailabilityFn<T extends BankGameType> = (items: readonly BankActivityMap[T][], d: Difficulty) => string | null;

/** Regra de disponibilidade de cada jogo com banco (mínimo de itens por nível). */
const RULES: { [T in BankGameType]: AvailabilityFn<T> } = {
  intruso: intrusoAvailability,
  "quem-sou-eu": riddleAvailability,
  "siga-comando": commandAvailability,
  ordem: sequenceAvailability,
  "monte-frase": sentenceAvailability,
  silabas: syllableAvailability,
  rima: rhymeAvailability,
  "som-inicial": soundAvailability,
  escute: listenAvailability,
  desapareceu: disappearAvailability,
};

export function bankAvailability<T extends BankGameType>(
  type: T,
  items: readonly BankActivityMap[T][],
  difficulty: Difficulty,
): string | null {
  return (RULES[type] as AvailabilityFn<T>)(items, difficulty);
}
