import { describe, expect, it } from "vitest";
import { createRng, sample, shuffle, shuffleDifferent } from "@/lib/random";

describe("random", () => {
  it("é determinístico para a mesma semente", () => {
    const a = shuffle([1, 2, 3, 4, 5, 6], createRng(42));
    const b = shuffle([1, 2, 3, 4, 5, 6], createRng(42));
    expect(a).toEqual(b);
  });

  it("embaralha sem perder nem repetir itens", () => {
    const out = shuffle([1, 2, 3, 4, 5, 6], createRng(7));
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("produz ordens diferentes para sementes diferentes", () => {
    const orders = new Set(Array.from({ length: 20 }, (_, s) => shuffle([1, 2, 3, 4, 5, 6], createRng(s)).join()));
    expect(orders.size).toBeGreaterThan(10);
  });

  it("sample retorna itens distintos", () => {
    const out = sample(["a", "b", "c", "d", "e"], 3, createRng(1));
    expect(new Set(out).size).toBe(3);
  });

  it("shuffleDifferent nunca devolve a mesma ordem", () => {
    for (let s = 0; s < 200; s++) {
      const ref = ["a", "b", "c"];
      expect(shuffleDifferent(ref, ref, createRng(s))).not.toEqual(ref);
    }
  });
});
