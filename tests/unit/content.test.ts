import { describe, expect, it } from "vitest";
import { ACTIVITIES, getActivitySummaries, resolveActivity } from "@/content";
import { CONCEPTS } from "@/content/concepts";
import { validateContent } from "@/content/validate";
import { createWhereRound } from "@/games/onde-esta/engine";
import { createLigarRound } from "@/games/ligar/engine";
import { createMemoryDeck } from "@/games/memoria/engine";
import { DIFFICULTIES, type OndeEstaActivity, type ResolvedActivity } from "@/content/types";
import { createRng } from "@/lib/random";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("conteúdo", () => {
  it("é consistente (ids, slugs, conjuntos mínimos)", () => {
    expect(validateContent(ACTIVITIES)).toEqual([]);
  });

  it("tem pelo menos 30 conceitos e 12 atividades dos três tipos", () => {
    expect(CONCEPTS.length).toBeGreaterThanOrEqual(30);
    expect(ACTIVITIES.length).toBeGreaterThanOrEqual(12);
    expect(new Set(ACTIVITIES.map((a) => a.type))).toEqual(new Set(["ligar", "memoria", "onde-esta"]));
    expect(new Set(CONCEPTS.map((c) => c.category)).size).toBeGreaterThanOrEqual(5);
  });

  it("todas as imagens locais existem (sem imagens quebradas)", () => {
    for (const c of CONCEPTS) {
      if (c.media.kind !== "emoji") expect(existsSync(join("public", c.media.src)), c.media.src).toBe(true);
    }
  });

  it("todas as atividades funcionam em todos os níveis", () => {
    for (const activity of ACTIVITIES) {
      const resolved = resolveActivity(activity);
      for (const level of DIFFICULTIES) {
        const rng = createRng(11);
        if (resolved.type === "ligar") expect(createLigarRound(resolved.items, level, rng).pairs.length).toBeGreaterThan(0);
        if (resolved.type === "memoria")
          expect(createMemoryDeck(resolved.items, level, resolved.mode, rng).cards.length).toBeGreaterThan(0);
        if (resolved.type === "onde-esta") {
          const qs = createWhereRound(resolved as ResolvedActivity<OndeEstaActivity>, level, rng);
          expect(qs.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("gera resumos para a biblioteca", () => {
    const summaries = getActivitySummaries();
    expect(summaries).toHaveLength(ACTIVITIES.length);
    expect(summaries.every((s) => s.cover.length > 0)).toBe(true);
  });
});
