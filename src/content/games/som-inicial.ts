import type { InitialSoundSet } from "../types";

/**
 * JOGO 11 — CAÇA AO SOM INICIAL
 *
 * ONSETS: o primeiro FONEMA de cada palavra (não a primeira letra), cadastrado
 * à mão. Exemplos de diferença entre letra e som:
 *  - "cenoura" e "cereja" começam com a letra C, mas com o som /s/;
 *  - "casa" começa com C e com o som /k/; "queijo" começa com QU e também /k/;
 *  - "chave" começa com C, mas com o som /ʃ/.
 * Os testes conferem que todo alvo começa com o fonema do conjunto e que
 * nenhum distrator começa.
 *
 * Evitamos alvos com /ʁ/ inicial ("rato"), cuja realização varia muito entre
 * regiões.
 */
export const ONSETS: Record<string, string> = {
  pato: "/p/", pipoca: "/p/", porco: "/p/", pao: "/p/", pe: "/p/", peixe: "/p/", pera: "/p/", pente: "/p/", pipa: "/p/",
  bola: "/b/", banana: "/b/", boca: "/b/", bolo: "/b/", barco: "/b/", balao: "/b/", bone: "/b/", bicicleta: "/b/", bala: "/b/",
  mao: "/m/", macaco: "/m/", maca: "/m/", meia: "/m/", milho: "/m/", moto: "/m/", morango: "/m/", mala: "/m/", minhoca: "/m/",
  faca: "/f/", foca: "/f/", fogo: "/f/", formiga: "/f/", flor: "/f/", foguete: "/f/", feijao: "/f/",
  vaca: "/v/", vela: "/v/", vestido: "/v/", violao: "/v/", vassoura: "/v/",
  sol: "/s/", sapo: "/s/", sorvete: "/s/", cenoura: "/s/", cereja: "/s/", sino: "/s/", sapato: "/s/", sacola: "/s/",
  casa: "/k/", carro: "/k/", cama: "/k/", cavalo: "/k/", coelho: "/k/", queijo: "/k/", cachorro: "/k/", cadeira: "/k/",
  lua: "/l/", leao: "/l/", limao: "/l/", livro: "/l/", lapis: "/l/", leite: "/l/", laranja: "/l/",
  // Distratores
  gato: "/g/", uva: "/u/", dente: "/d/", nariz: "/n/", chave: "/ʃ/", zebra: "/z/", rato: "/ʁ/", ovo: "/o/", tartaruga: "/t/",
};

export const INITIAL_SOUND_SETS: InitialSoundSet[] = [
  {
    id: "p",
    phoneme: "/p/",
    exampleId: "pato",
    targetIds: ["pipoca", "porco", "pao", "pe", "peixe", "pera", "pente", "pipa"],
    distractorIds: ["gato", "sol", "uva", "mao", "casa", "vaca", "dente", "lua"],
    nearIds: ["bola", "banana", "bone"],
  },
  {
    id: "b",
    phoneme: "/b/",
    exampleId: "bola",
    targetIds: ["banana", "boca", "bolo", "barco", "balao", "bone", "bicicleta", "bala"],
    distractorIds: ["sol", "uva", "casa", "gato", "mao", "leite", "faca", "lua"],
    nearIds: ["pato", "pera", "pipoca"],
  },
  {
    id: "m",
    phoneme: "/m/",
    exampleId: "mao",
    targetIds: ["macaco", "maca", "meia", "milho", "moto", "morango", "mala", "minhoca"],
    distractorIds: ["sol", "uva", "gato", "casa", "faca", "leite", "dente", "vela"],
    nearIds: ["nariz", "bola", "pato"],
  },
  {
    id: "f",
    phoneme: "/f/",
    exampleId: "faca",
    targetIds: ["foca", "fogo", "formiga", "flor", "foguete", "feijao"],
    distractorIds: ["casa", "gato", "uva", "mao", "sol", "lua", "dente"],
    nearIds: ["vaca", "vela", "violao"],
  },
  {
    id: "v",
    phoneme: "/v/",
    exampleId: "vaca",
    targetIds: ["vela", "vestido", "violao", "vassoura"],
    distractorIds: ["casa", "gato", "mao", "sol", "pipoca", "lua", "dente"],
    nearIds: ["faca", "foca", "fogo"],
    reviewNote: "Conjunto menor (4 alvos). Avaliar se vale incluir mais palavras com /v/.",
  },
  {
    id: "s",
    phoneme: "/s/",
    exampleId: "sol",
    targetIds: ["sapo", "sorvete", "cenoura", "cereja", "sino", "sapato", "sacola"],
    distractorIds: ["gato", "uva", "mao", "bola", "pato", "lua", "dente"],
    nearIds: ["casa", "chave", "zebra"],
    reviewNote: "Inclui alvos escritos com C (cenoura, cereja) e distrator com C e som /k/ (casa).",
  },
  {
    id: "k",
    phoneme: "/k/",
    exampleId: "casa",
    targetIds: ["carro", "cama", "cavalo", "coelho", "queijo", "cachorro", "cadeira"],
    distractorIds: ["uva", "mao", "bola", "pato", "sol", "lua", "dente"],
    nearIds: ["cenoura", "cereja", "gato"],
    reviewNote: "Inclui alvo escrito com QU (queijo) e distratores escritos com C e som /s/ (cenoura, cereja).",
  },
  {
    id: "l",
    phoneme: "/l/",
    exampleId: "lua",
    targetIds: ["leao", "limao", "livro", "lapis", "leite", "laranja"],
    distractorIds: ["gato", "uva", "casa", "pato", "sol", "mao", "bola"],
    nearIds: ["dente", "nariz", "rato"],
  },
];
