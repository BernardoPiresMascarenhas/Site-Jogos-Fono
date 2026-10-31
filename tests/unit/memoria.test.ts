import { describe, expect, it } from "vitest";
import { createMemoryDeck, initialMemoryState, isMemoryComplete, memoryReducer, type MemoryState } from "@/games/memoria/engine";
import { createRng } from "@/lib/random";
import { concepts } from "./fixtures";

function deck(mode: "imagem-imagem" | "palavra-imagem" = "imagem-imagem", seed = 1) {
  return createMemoryDeck(concepts(9), "medio", mode, createRng(seed));
}

function keysOf(state: MemoryState, conceptId: string) {
  return state.cards.filter((c) => c.conceptId === conceptId).map((c) => c.key);
}

describe("Jogo da memória — baralho", () => {
  it("cria 2 cartas por par, com o número de pares do nível", () => {
    expect(createMemoryDeck(concepts(9), "facil", "imagem-imagem", createRng(1)).cards).toHaveLength(6);
    expect(deck().cards).toHaveLength(8);
    expect(createMemoryDeck(concepts(9), "dificil", "imagem-imagem", createRng(1)).cards).toHaveLength(12);
  });

  it("modo palavra-imagem tem uma carta de palavra e uma de imagem por par", () => {
    const { cards, concepts: cs } = deck("palavra-imagem");
    for (const c of cs) {
      const faces = cards.filter((k) => k.conceptId === c.id).map((k) => k.face).sort();
      expect(faces).toEqual(["image", "word"]);
    }
  });

  it("embaralha de forma diferente a cada partida", () => {
    const orders = new Set(Array.from({ length: 10 }, (_, s) => deck("imagem-imagem", s).cards.map((c) => c.key).join()));
    expect(orders.size).toBeGreaterThan(5);
  });
});

describe("Jogo da memória — regras", () => {
  it("par correto permanece revelado", () => {
    let s = initialMemoryState(deck().cards);
    const [a, b] = keysOf(s, s.cards[0].conceptId);
    s = memoryReducer(s, { type: "flip", key: a });
    s = memoryReducer(s, { type: "flip", key: b });
    expect(s.matched).toEqual([s.cards.find((c) => c.key === a)!.conceptId]);
    expect(s.flipped).toEqual([]);
    expect(s.locked).toBe(false);
  });

  it("par errado bloqueia cliques até desvirar", () => {
    let s = initialMemoryState(deck().cards);
    const first = s.cards[0];
    const other = s.cards.find((c) => c.conceptId !== first.conceptId)!;
    const third = s.cards.find((c) => c.key !== first.key && c.key !== other.key)!;
    s = memoryReducer(s, { type: "flip", key: first.key });
    s = memoryReducer(s, { type: "flip", key: other.key });
    expect(s.locked).toBe(true);
    // Cliques rápidos durante a verificação são ignorados
    const blocked = memoryReducer(s, { type: "flip", key: third.key });
    expect(blocked).toBe(s);
    s = memoryReducer(s, { type: "hide" });
    expect(s.flipped).toEqual([]);
    expect(s.locked).toBe(false);
  });

  it("clicar duas vezes na mesma carta não conta como par", () => {
    let s = initialMemoryState(deck().cards);
    s = memoryReducer(s, { type: "flip", key: s.cards[0].key });
    const again = memoryReducer(s, { type: "flip", key: s.cards[0].key });
    expect(again).toBe(s);
    expect(again.flipped).toHaveLength(1);
  });

  it("sequência rápida de cliques nunca deixa mais de 2 cartas viradas", () => {
    let s = initialMemoryState(deck("imagem-imagem", 9).cards);
    for (const card of s.cards) s = memoryReducer(s, { type: "flip", key: card.key });
    expect(s.flipped.length).toBeLessThanOrEqual(2);
  });

  it("termina quando todos os pares são encontrados", () => {
    let s = initialMemoryState(deck().cards);
    const ids = Array.from(new Set(s.cards.map((c) => c.conceptId)));
    for (const id of ids) {
      const [a, b] = keysOf(s, id);
      s = memoryReducer(s, { type: "flip", key: a });
      s = memoryReducer(s, { type: "flip", key: b });
    }
    expect(isMemoryComplete(s)).toBe(true);
    expect(s.moves).toBe(ids.length);
  });
});
