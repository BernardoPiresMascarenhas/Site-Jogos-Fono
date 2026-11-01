import type { ListenGroup } from "../types";

/**
 * JOGO 12 — ESCUTE E ESCOLHA
 * Pares (ou trios) mínimos verdadeiros: as palavras diferem em um único fonema.
 * Palavras apenas parecidas não entram aqui.
 *
 * Fora do acervo por enquanto: "pato / bato" (citado como exemplo) — "bato" é um
 * verbo difícil de representar com uma imagem inequívoca.
 *
 * Áudio: cada palavra pode receber uma gravação em `audio` no acervo
 * (src/content/concept-data.ts). O modo "Áudio gravado" só fica disponível
 * quando todas as palavras de pelo menos 3 grupos têm gravação. A voz sintética
 * do navegador NÃO é usada neste jogo.
 */
export const LISTEN_GROUPS: ListenGroup[] = [
  { id: "faca-vaca", wordIds: ["faca", "vaca"], contrast: "/f/ × /v/" },
  { id: "pato-gato-rato", wordIds: ["pato", "gato", "rato"], contrast: "/p/ × /g/ × /ʁ/", reviewNote: "O /ʁ/ inicial de \"rato\" varia entre regiões." },
  { id: "mao-pao-cao", wordIds: ["mao", "pao", "cao"], contrast: "/m/ × /p/ × /k/" },
  { id: "mala-bala", wordIds: ["mala", "bala"], contrast: "/m/ × /b/" },
  { id: "gato-galo", wordIds: ["gato", "galo"], contrast: "/t/ × /l/" },
  { id: "bola-bolo", wordIds: ["bola", "bolo"], contrast: "/a/ × /u/ (vogal final)", reviewNote: "Além da vogal final, o 'o' tônico também muda (aberto × fechado)." },
  { id: "foca-boca", wordIds: ["foca", "boca"], contrast: "/f/ × /b/", reviewNote: "O 'o' de foca é aberto e o de boca é fechado; confirmar se o par serve ao objetivo." },
  { id: "pena-pera", wordIds: ["pena", "pera"], contrast: "/n/ × /ɾ/", reviewNote: "A vogal de \"pena\" costuma ser nasalizada na fala." },
];
