import type { SentenceQuestion, SentenceToken } from "../types";

/**
 * JOGO 8 — MONTE A FRASE
 * Peças em letras minúsculas (a exibição usa letra bastão; a frase final ganha
 * maiúscula inicial e ponto). O nível vem do número de peças:
 * fácil = 3, médio = 4 ou 5, difícil = 6 ou mais.
 *
 * Ordens alternativas: quando outra ordem também é gramatical e natural
 * (ex.: deslocar "em cima da cama" para o começo, ou trocar "o pato e o sapo"),
 * ela é cadastrada em `alternatives`. Trocas que só produzem frases sem sentido
 * (ex.: "a maçã come o menino") não são aceitas; a cena exibida no modo com
 * imagens deixa a ordem esperada inequívoca.
 */

/** Atalho: "o gato:gato dorme:acao-dormir" → peças com imagem opcional. */
function t(spec: string): SentenceToken[] {
  return spec.split(" ").map((part) => {
    const [text, imageId] = part.split(":");
    return { text: text.replaceAll("_", " "), ...(imageId ? { imageId } : {}) };
  });
}

export const SENTENCES: SentenceQuestion[] = [
  // 3 peças
  { id: "gato-dorme", category: "animais", tokens: t("o gato:gato dorme:acao-dormir"), sceneIds: ["gato", "acao-dormir"] },
  { id: "bebe-chora", category: "variadas", tokens: t("o bebê:bebe chora:acao-chorar"), sceneIds: ["bebe", "acao-chorar"] },
  { id: "pato-nada", category: "animais", tokens: t("o pato:pato nada:acao-nadar"), sceneIds: ["pato", "lago"] },
  { id: "menina-corre", category: "variadas", tokens: t("a menina:menina corre:acao-correr"), sceneIds: ["menina", "acao-correr"] },
  { id: "cachorro-late", category: "animais", tokens: t("o cachorro:cachorro late"), sceneIds: ["cachorro"] },
  { id: "sapo-pula", category: "animais", tokens: t("o sapo:sapo pula"), sceneIds: ["sapo"] },

  // 4 ou 5 peças
  {
    id: "cachorro-bebe-agua",
    category: "animais",
    tokens: t("o cachorro:cachorro bebe:acao-beber água:agua"),
    sceneIds: ["cachorro", "agua"],
  },
  {
    id: "menino-come-maca",
    category: "alimentos",
    tokens: t("o menino:menino come:acao-comer a maçã:maca"),
    sceneIds: ["menino", "maca"],
  },
  {
    id: "menina-le-livro",
    category: "objetos",
    tokens: t("a menina:menina lê:acao-ler um livro:livro"),
    sceneIds: ["menina", "livro"],
  },
  {
    id: "macaco-come-banana",
    category: "alimentos",
    tokens: t("o macaco:macaco come:acao-comer banana:banana"),
    sceneIds: ["macaco", "banana"],
  },
  { id: "gato-bebe-leite", category: "animais", tokens: t("o gato:gato bebe:acao-beber leite:leite"), sceneIds: ["gato", "leite"] },
  { id: "galinha-bota-ovo", category: "animais", tokens: t("a galinha:galinha bota um ovo:ovo"), sceneIds: ["galinha", "ovo"] },

  // 6 peças ou mais
  {
    id: "menina-brinca-bola",
    category: "objetos",
    tokens: t("a menina:menina brinca com a bola:bola"),
    alternatives: ["com a bola a menina brinca"],
    sceneIds: ["menina", "bola"],
  },
  {
    id: "gato-dorme-cama",
    category: "animais",
    tokens: t("o gato:gato dorme:acao-dormir em_cima da cama:cama"),
    alternatives: ["em cima da cama o gato dorme"],
    sceneIds: ["gato", "cama"],
    reviewNote: "\"em cima\" é uma peça só, para manter a locução junta.",
  },
  {
    id: "menino-banho-chuveiro",
    category: "higiene",
    tokens: t("o menino:menino toma banho no chuveiro:chuveiro"),
    alternatives: ["no chuveiro o menino toma banho"],
    sceneIds: ["menino", "chuveiro"],
  },
  {
    id: "cachorro-corre-bola",
    category: "animais",
    tokens: t("o cachorro:cachorro corre:acao-correr atrás da bola:bola"),
    alternatives: ["atrás da bola o cachorro corre"],
    sceneIds: ["cachorro", "bola"],
  },
  {
    id: "bombeiro-apaga-fogo",
    category: "profissoes",
    tokens: t("o bombeiro:bombeiro apaga o fogo:fogo com água:agua"),
    alternatives: ["com água o bombeiro apaga o fogo"],
    sceneIds: ["bombeiro", "fogo"],
  },
  {
    id: "menino-escova-dentes",
    category: "higiene",
    tokens: t("o menino:menino escova:escova-de-dentes os dentes:dente depois do almoço:almoco"),
    alternatives: ["depois do almoço o menino escova os dentes"],
    sceneIds: ["menino", "escova-de-dentes"],
  },
  {
    id: "pato-sapo-lago",
    category: "animais",
    tokens: t("o pato:pato e o sapo:sapo nadam:acao-nadar no lago:lago"),
    alternatives: ["o sapo e o pato nadam no lago", "no lago o pato e o sapo nadam", "no lago o sapo e o pato nadam"],
    sceneIds: ["pato", "sapo", "lago"],
  },
];
