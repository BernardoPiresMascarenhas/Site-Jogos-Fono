import type { Rng } from "@/lib/random";
import type { BankActivity, Difficulty, ResolvedActivity } from "@/content/types";
import { createDisappearRound } from "./desapareceu/engine";
import { createListenRound, type ListenMode } from "./escute/engine";
import { createIntrusoRound } from "./intruso/engine";
import { createSentenceRound } from "./monte-frase/engine";
import { createSequenceRound } from "./ordem/engine";
import { createRiddleRound } from "./quem-sou-eu/engine";
import { createRhymeRound } from "./rima/engine";
import { createCommandRound } from "./siga-comando/engine";
import { createSyllableRound } from "./silabas/engine";
import { createSoundRound } from "./som-inicial/engine";

/**
 * Cria a partida de qualquer jogo com banco de questões (usado pelos testes
 * para conferir todo o acervo; cada tela chama o gerador do próprio jogo).
 */
export function createGameRound(
  activity: ResolvedActivity,
  difficulty: Difficulty,
  rng: Rng,
  options: Record<string, string>,
): unknown[] {
  const a = activity as ResolvedActivity<BankActivity>;
  switch (a.type) {
    case "intruso":
      return createIntrusoRound(a, difficulty, rng);
    case "quem-sou-eu":
      return createRiddleRound(a, difficulty, rng);
    case "siga-comando":
      return createCommandRound(a, difficulty, rng);
    case "ordem":
      return createSequenceRound(a, difficulty, rng);
    case "monte-frase":
      return createSentenceRound(a, difficulty, rng);
    case "silabas":
      return createSyllableRound(a, difficulty, rng);
    case "rima":
      return createRhymeRound(a, difficulty, rng);
    case "som-inicial":
      return createSoundRound(a, difficulty, rng);
    case "escute":
      return createListenRound(a, difficulty, (options.modo as ListenMode) ?? "profissional", rng);
    case "desapareceu":
      return createDisappearRound(a, difficulty, rng);
    default:
      return [];
  }
}
