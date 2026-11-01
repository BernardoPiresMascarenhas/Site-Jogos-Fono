import { getConcept } from "./concepts";
import { DISAPPEAR_ITEMS } from "./games/desapareceu";
import { LISTEN_GROUPS } from "./games/escute";
import { INTRUSO_QUESTIONS } from "./games/intruso";
import { SENTENCES } from "./games/monte-frase";
import { SEQUENCES } from "./games/ordem";
import { RIDDLES } from "./games/quem-sou-eu";
import { RHYME_QUESTIONS } from "./games/rima";
import { COMMANDS } from "./games/siga-comando";
import { SYLLABLE_ITEMS } from "./games/silabas";
import { INITIAL_SOUND_SETS } from "./games/som-inicial";
import type { BankActivityMap, BankGameType, CategoryId } from "./types";

/** Banco de questões de cada jogo (4 a 13). */
export const BANKS: { [T in BankGameType]: BankActivityMap[T][] } = {
  intruso: INTRUSO_QUESTIONS,
  "quem-sou-eu": RIDDLES,
  "siga-comando": COMMANDS,
  ordem: SEQUENCES,
  "monte-frase": SENTENCES,
  silabas: SYLLABLE_ITEMS,
  rima: RHYME_QUESTIONS,
  "som-inicial": INITIAL_SOUND_SETS,
  escute: LISTEN_GROUPS,
  desapareceu: DISAPPEAR_ITEMS,
};

/**
 * Categoria de um item, usada para gerar os pacotes.
 * Nos jogos de palavras soltas, vem da categoria da palavra no acervo.
 * Nos jogos fonológicos e nos que não se dividem por tema (frases misturam
 * assuntos; os comandos acontecem sempre na mesma cena), tudo fica em "Variadas".
 */
export function bankCategoryOf<T extends BankGameType>(type: T, item: BankActivityMap[T]): CategoryId {
  switch (type) {
    case "silabas":
    case "desapareceu":
      return getConcept((item as BankActivityMap["silabas"]).conceptId)?.category ?? "variadas";
    case "rima":
    case "som-inicial":
    case "escute":
    case "monte-frase":
    case "siga-comando":
      return "variadas";
    default:
      return (item as { category: CategoryId }).category;
  }
}

/** Conceitos e figuras citados por um item (para enviar ao navegador e validar). */
export function bankRefs<T extends BankGameType>(type: T, item: BankActivityMap[T]): { concepts: string[]; pictures: string[] } {
  switch (type) {
    case "intruso": {
      const q = item as BankActivityMap["intruso"];
      return { concepts: [...q.groupIds, q.intruderId], pictures: [] };
    }
    case "quem-sou-eu": {
      const q = item as BankActivityMap["quem-sou-eu"];
      return { concepts: [q.answerId, ...q.distractorIds], pictures: [] };
    }
    case "siga-comando": {
      const q = item as BankActivityMap["siga-comando"];
      return { concepts: [...q.landmarkIds, ...q.objects.map((o) => o.id)], pictures: [] };
    }
    case "ordem":
      return { concepts: [], pictures: (item as BankActivityMap["ordem"]).steps };
    case "monte-frase": {
      const q = item as BankActivityMap["monte-frase"];
      const ids = [...q.tokens.flatMap((t) => (t.imageId ? [t.imageId] : [])), ...(q.sceneIds ?? [])];
      return {
        concepts: ids.filter((id) => getConcept(id)),
        pictures: ids.filter((id) => !getConcept(id)),
      };
    }
    case "silabas":
    case "desapareceu":
      return { concepts: [(item as BankActivityMap["silabas"]).conceptId], pictures: [] };
    case "rima": {
      const q = item as BankActivityMap["rima"];
      return { concepts: [q.targetId, ...q.correctIds, ...q.distractorIds], pictures: [] };
    }
    case "som-inicial": {
      const q = item as BankActivityMap["som-inicial"];
      return { concepts: [q.exampleId, ...q.targetIds, ...q.distractorIds, ...(q.nearIds ?? [])], pictures: [] };
    }
    case "escute":
      return { concepts: (item as BankActivityMap["escute"]).wordIds, pictures: [] };
    default:
      return { concepts: [], pictures: [] };
  }
}
