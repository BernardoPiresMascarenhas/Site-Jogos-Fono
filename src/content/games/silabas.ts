import type { Difficulty, SyllableItem } from "../types";

/**
 * JOGO 9 — QUANTAS SÍLABAS?
 * Separação silábica cadastrada à mão, segundo a norma do português brasileiro.
 * Nunca é calculada automaticamente.
 *
 * Palavras deixadas de fora de propósito, porque a contagem oral costuma
 * divergir da separação escrita (ditongos e hiatos instáveis na fala):
 * avião (a-vi-ão), leão (le-ão), policial (po-li-ci-al), relógio (re-ló-gio).
 *
 * Níveis: 1 sílaba → fácil · 2 → fácil e médio · 3 → médio e difícil · 4+ → difícil.
 */

function levelsFor(count: number): Difficulty[] {
  if (count === 1) return ["facil"];
  if (count === 2) return ["facil", "medio"];
  if (count === 3) return ["medio", "dificil"];
  return ["dificil"];
}

/** Atalho: s("banana", "ba-na-na"). */
function s(conceptId: string, separation: string, reviewNote?: string): SyllableItem {
  const syllables = separation.split("-");
  return {
    id: conceptId,
    conceptId,
    syllables,
    syllableCount: syllables.length,
    levels: levelsFor(syllables.length),
    ...(reviewNote ? { reviewNote } : {}),
  };
}

export const SYLLABLE_ITEMS: SyllableItem[] = [
  // 1 sílaba
  s("pao", "pão"),
  s("pe", "pé"),
  s("mao", "mão"),
  s("trem", "trem"),
  s("sol", "sol"),
  s("flor", "flor"),
  s("cao", "cão"),

  // 2 sílabas
  s("bola", "bo-la"),
  s("gato", "ga-to"),
  s("casa", "ca-sa"),
  s("uva", "u-va"),
  s("ovo", "o-vo"),
  s("sapo", "sa-po"),
  s("vaca", "va-ca"),
  s("dente", "den-te"),
  s("boca", "bo-ca"),
  s("pato", "pa-to"),
  s("peixe", "pei-xe"),
  s("queijo", "quei-jo"),
  s("lua", "lu-a", "Hiato: lu-a."),
  s("vela", "ve-la"),
  s("faca", "fa-ca"),
  s("mala", "ma-la"),
  s("cama", "ca-ma"),
  s("chave", "cha-ve"),
  s("luva", "lu-va"),
  s("moto", "mo-to"),
  s("bolo", "bo-lo"),
  s("fogo", "fo-go"),
  s("urso", "ur-so"),
  s("meia", "mei-a", "Ditongo + vogal: mei-a."),
  s("zebra", "ze-bra"),

  // 3 sílabas
  s("banana", "ba-na-na"),
  s("macaco", "ma-ca-co"),
  s("sapato", "sa-pa-to"),
  s("pipoca", "pi-po-ca"),
  s("cavalo", "ca-va-lo"),
  s("galinha", "ga-li-nha"),
  s("cadeira", "ca-dei-ra"),
  s("tesoura", "te-sou-ra"),
  s("cenoura", "ce-nou-ra"),
  s("morango", "mo-ran-go"),
  s("sorvete", "sor-ve-te"),
  s("caminhao", "ca-mi-nhão"),
  s("coelho", "co-e-lho", "Hiato: co-e-lho."),
  s("janela", "ja-ne-la"),
  s("girafa", "gi-ra-fa"),
  s("coruja", "co-ru-ja"),
  s("abelha", "a-be-lha"),
  s("foguete", "fo-gue-te"),
  s("martelo", "mar-te-lo"),
  s("castelo", "cas-te-lo"),
  s("formiga", "for-mi-ga"),
  s("onibus", "ô-ni-bus"),
  s("oculos", "ó-cu-los"),
  s("escola", "es-co-la"),
  s("mochila", "mo-chi-la"),
  s("jacare", "ja-ca-ré"),
  s("minhoca", "mi-nho-ca"),

  // 4 sílabas ou mais
  s("borboleta", "bor-bo-le-ta"),
  s("elefante", "e-le-fan-te"),
  s("tartaruga", "tar-ta-ru-ga"),
  s("bicicleta", "bi-ci-cle-ta"),
  s("abacaxi", "a-ba-ca-xi"),
  s("melancia", "me-lan-ci-a", "Hiato final: ci-a."),
  s("televisao", "te-le-vi-são"),
  s("passarinho", "pas-sa-ri-nho"),
  s("astronauta", "as-tro-nau-ta"),
  s("cozinheiro", "co-zi-nhei-ro"),
  s("agricultor", "a-gri-cul-tor"),
  s("mecanico", "me-câ-ni-co"),
  s("helicoptero", "he-li-cóp-te-ro"),
];

/** Alternativas numéricas por nível. */
export const SYLLABLE_CHOICES: Record<Difficulty, number[]> = {
  facil: [1, 2, 3],
  medio: [1, 2, 3, 4],
  dificil: [2, 3, 4, 5],
};
