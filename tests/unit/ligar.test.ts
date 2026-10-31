import { describe, expect, it } from "vitest";
import { createLigarRound, initialLigarState, isLigarComplete, ligarReducer } from "@/games/ligar/engine";
import { DIFFICULTY_SIZE } from "@/content/types";
import { createRng } from "@/lib/random";
import { concepts } from "./fixtures";

describe("Ligue as imagens — rodada", () => {
  it.each(Object.entries(DIFFICULTY_SIZE))("nível %s tem %i pares distintos", (level, size) => {
    const round = createLigarRound(concepts(9), level as keyof typeof DIFFICULTY_SIZE, createRng(3));
    expect(round.pairs).toHaveLength(size);
    expect(new Set(round.pairs.map((p) => p.id)).size).toBe(size);
    expect([...round.imageOrder].sort()).toEqual([...round.wordOrder].sort());
  });

  it("a coluna de imagens nunca fica alinhada com a de palavras", () => {
    for (let s = 0; s < 100; s++) {
      const r = createLigarRound(concepts(9), "facil", createRng(s));
      expect(r.imageOrder).not.toEqual(r.wordOrder);
    }
  });

  it("não repete pares mesmo com conceitos duplicados na entrada", () => {
    const list = [...concepts(6), ...concepts(6)];
    const r = createLigarRound(list, "dificil", createRng(1));
    expect(new Set(r.pairs.map((p) => p.id)).size).toBe(6);
  });
});

describe("Ligue as imagens — regras", () => {
  it("associação correta é confirmada", () => {
    let s = initialLigarState(3);
    s = ligarReducer(s, { type: "select", side: "word", id: "c1" });
    expect(s.selectedWord).toBe("c1");
    s = ligarReducer(s, { type: "select", side: "image", id: "c1" });
    expect(s.matched).toEqual(["c1"]);
    expect(s.hit?.id).toBe("c1");
    expect(s.selectedWord).toBeNull();
  });

  it("associação incorreta gera feedback e permite nova tentativa", () => {
    let s = initialLigarState(3);
    s = ligarReducer(s, { type: "select", side: "word", id: "c1" });
    s = ligarReducer(s, { type: "select", side: "image", id: "c2" });
    expect(s.matched).toEqual([]);
    expect(s.miss).toMatchObject({ wordId: "c1", imageId: "c2" });
    s = ligarReducer(s, { type: "select", side: "word", id: "c1" });
    s = ligarReducer(s, { type: "select", side: "image", id: "c1" });
    expect(s.matched).toEqual(["c1"]);
  });

  it("também funciona começando pela imagem e permite trocar a seleção", () => {
    let s = initialLigarState(2);
    s = ligarReducer(s, { type: "select", side: "image", id: "c0" });
    s = ligarReducer(s, { type: "select", side: "image", id: "c1" });
    expect(s.selectedImage).toBe("c1");
    s = ligarReducer(s, { type: "select", side: "word", id: "c1" });
    expect(s.matched).toEqual(["c1"]);
  });

  it("itens já ligados são ignorados e o jogo termina", () => {
    let s = initialLigarState(2);
    for (const id of ["c0", "c1"]) {
      s = ligarReducer(s, { type: "select", side: "word", id });
      s = ligarReducer(s, { type: "select", side: "image", id });
    }
    expect(isLigarComplete(s)).toBe(true);
    const after = ligarReducer(s, { type: "select", side: "word", id: "c0" });
    expect(after).toBe(s);
  });
});
