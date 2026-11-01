import type { RhymeQuestion } from "../types";

/**
 * JOGO 10 — QUAL PALAVRA RIMA?
 *
 * RHYME_KEYS: a parte da palavra que conta para a rima (da vogal tônica até o
 * fim), escrita à mão em transcrição fonológica simplificada do português
 * brasileiro. Não é derivada das letras — por exemplo:
 *  - "bola" (ɔla, o aberto) não rima com "cebola" (ola, o fechado);
 *  - "pipoca" (ɔka) não rima com "boca" (oka).
 * Os testes conferem que cada resposta certa tem a mesma chave do alvo e que
 * nenhum distrator tem.
 */
export const RHYME_KEYS: Record<string, string> = {
  pao: "ɐ̃w̃", mao: "ɐ̃w̃", cao: "ɐ̃w̃", limao: "ɐ̃w̃", balao: "ɐ̃w̃", caminhao: "ɐ̃w̃", feijao: "ɐ̃w̃",
  gato: "atu", pato: "atu", rato: "atu", sapato: "atu",
  bola: "ɔla", escola: "ɔla", sacola: "ɔla",
  castelo: "ɛlu", martelo: "ɛlu", chinelo: "ɛlu",
  janela: "ɛla", vela: "ɛla",
  coelho: "eʎu", espelho: "eʎu",
  sorvete: "etʃi", foguete: "etʃi",
  pipoca: "ɔka", minhoca: "ɔka",
  tesoura: "oɾa", cenoura: "oɾa", vassoura: "oɾa",
  cadeira: "eɾa", mamadeira: "eɾa",
  abelha: "eʎa", ovelha: "eʎa", orelha: "eʎa",
  sino: "inu", pepino: "inu",
  bone: "ɛ", jacare: "ɛ", pe: "ɛ", cafe: "ɛ",
  dente: "ẽtʃi", pente: "ẽtʃi",
  // Distratores
  uva: "uva", casa: "aza", peixe: "ejʃi", sapo: "apu", galo: "alu", bolo: "olu", cavalo: "alu",
  sol: "ɔw", chave: "avi", cama: "ɐ̃ma", abacaxi: "i", pipa: "ipa", macaco: "aku", leite: "ejtʃi",
  livro: "ivɾu", flor: "oɾ", lua: "ua", mala: "ala", olho: "oʎu", milho: "iʎu",
};

export const RHYME_QUESTIONS: RhymeQuestion[] = [
  {
    id: "pao",
    targetId: "pao",
    correctIds: ["mao", "limao", "balao"],
    distractorIds: ["gato", "bola", "uva", "sapo", "casa", "peixe"],
    levels: ["facil", "medio"],
  },
  {
    id: "gato",
    targetId: "gato",
    correctIds: ["pato", "rato", "sapato"],
    distractorIds: ["galo", "bola", "mao", "casa", "uva", "peixe"],
    levels: ["facil", "medio", "dificil"],
    reviewNote: "\"galo\" é um distrator próximo (mesmo início), usado de propósito.",
  },
  {
    id: "bola",
    targetId: "bola",
    correctIds: ["escola", "sacola"],
    distractorIds: ["bolo", "gato", "uva", "casa", "peixe", "mao"],
    levels: ["facil", "medio"],
    reviewNote: "\"bolo\" é um distrator próximo (mesmo início).",
  },
  {
    id: "bone",
    targetId: "bone",
    correctIds: ["jacare", "pe", "cafe"],
    distractorIds: ["bola", "gato", "uva", "mao", "sol", "casa"],
    levels: ["facil", "medio"],
  },
  {
    id: "dente",
    targetId: "dente",
    correctIds: ["pente"],
    distractorIds: ["gato", "bola", "uva", "mao", "sol", "casa"],
    levels: ["facil"],
  },
  {
    id: "sino",
    targetId: "sino",
    correctIds: ["pepino"],
    distractorIds: ["sapo", "bola", "gato", "uva", "mao", "casa"],
    levels: ["facil", "medio"],
  },
  {
    id: "janela",
    targetId: "janela",
    correctIds: ["vela"],
    distractorIds: ["bola", "gato", "casa", "uva", "mao", "chave"],
    levels: ["medio", "dificil"],
  },
  {
    id: "sorvete",
    targetId: "sorvete",
    correctIds: ["foguete"],
    distractorIds: ["sapato", "bola", "mao", "uva", "casa", "leite"],
    levels: ["medio", "dificil"],
    reviewNote: "\"leite\" termina parecido, mas não rima (ejtʃi × etʃi).",
  },
  {
    id: "pipoca",
    targetId: "pipoca",
    correctIds: ["minhoca"],
    distractorIds: ["pipa", "gato", "uva", "mao", "sol", "macaco"],
    levels: ["medio", "dificil"],
    reviewNote: "\"boca\" foi excluída: o 'o' fechado faz uma rima imperfeita que pode confundir.",
  },
  {
    id: "coelho",
    targetId: "coelho",
    correctIds: ["espelho"],
    distractorIds: ["cavalo", "uva", "bola", "mao", "sol", "olho"],
    levels: ["medio", "dificil"],
  },
  {
    id: "castelo",
    targetId: "castelo",
    correctIds: ["martelo", "chinelo"],
    distractorIds: ["cavalo", "uva", "mao", "sapo", "peixe", "sol"],
    levels: ["medio", "dificil"],
    reviewNote: "\"janela\" (ɛla) foi mantida fora para evitar rima parcial com castelo (ɛlu).",
  },
  {
    id: "tesoura",
    targetId: "tesoura",
    correctIds: ["cenoura", "vassoura"],
    distractorIds: ["cadeira", "bola", "gato", "uva", "mao", "sol"],
    levels: ["dificil"],
  },
  {
    id: "cadeira",
    targetId: "cadeira",
    correctIds: ["mamadeira"],
    distractorIds: ["cama", "casa", "gato", "uva", "sol", "bola"],
    levels: ["dificil"],
  },
  {
    id: "abelha",
    targetId: "abelha",
    correctIds: ["ovelha", "orelha"],
    distractorIds: ["abacaxi", "bola", "gato", "uva", "mao", "milho"],
    levels: ["dificil"],
  },
];
