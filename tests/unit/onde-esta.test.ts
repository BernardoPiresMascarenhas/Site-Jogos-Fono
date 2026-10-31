import { describe, expect, it } from "vitest";
import { createWhereRound, defaultPrompt, initialWhereState, whereReducer } from "@/games/onde-esta/engine";
import type { OndeEstaActivity, ResolvedActivity } from "@/content/types";
import { DIFFICULTY_SIZE } from "@/content/types";
import { createRng } from "@/lib/random";
import { concepts } from "./fixtures";

function activity(extra: Partial<ResolvedActivity<OndeEstaActivity>> = {}): ResolvedActivity<OndeEstaActivity> {
  return {
    id: "t",
    slug: "t",
    type: "onde-esta",
    title: "T",
    description: "",
    category: "animais",
    difficulty: "facil",
    instruction: "",
    accent: "rose",
    items: concepts(10),
    extras: [],
    ...extra,
  };
}

describe("Onde está? — rodada", () => {
  it.each(Object.entries(DIFFICULTY_SIZE))("nível %s tem %i alternativas distintas com a resposta", (level, size) => {
    const qs = createWhereRound(activity(), level as keyof typeof DIFFICULTY_SIZE, createRng(5));
    for (const q of qs) {
      expect(q.options).toHaveLength(size);
      expect(new Set(q.options.map((o) => o.id)).size).toBe(size);
      expect(q.options.some((o) => o.id === q.target.id)).toBe(true);
    }
  });

  it("perguntas de uma partida não se repetem", () => {
    const qs = createWhereRound(activity({ questionsPerRound: 6 }), "medio", createRng(2));
    expect(qs).toHaveLength(6);
    expect(new Set(qs.map((q) => q.target.id)).size).toBe(6);
  });

  it("a posição da resposta muda entre perguntas consecutivas", () => {
    for (let s = 0; s < 50; s++) {
      const qs = createWhereRound(activity(), "medio", createRng(s));
      const pos = qs.map((q) => q.options.indexOf(q.target));
      for (let i = 1; i < pos.length; i++) expect(pos[i]).not.toBe(pos[i - 1]);
    }
  });

  it("usa perguntas fixas e alternativas fixas (inclusive extras)", () => {
    const extra = { id: "x", word: "Maçã", article: "a" as const, category: "alimentos" as const, media: { kind: "emoji" as const, emoji: "🍎", alt: "Maçã" } };
    const qs = createWhereRound(
      activity({ questions: [{ targetId: "c1", distractorIds: ["x"] }], extras: [extra] }),
      "facil",
      createRng(1),
    );
    expect(qs).toHaveLength(1);
    expect(qs[0].target.id).toBe("c1");
    expect(qs[0].options.map((o) => o.id)).toContain("x");
    expect(qs[0].options).toHaveLength(3);
  });

  it("monta a pergunta com o artigo correto", () => {
    const [c] = concepts(1);
    expect(defaultPrompt({ ...c, word: "Cachorro", article: "o" })).toBe("Onde está o cachorro?");
    expect(defaultPrompt({ ...c, word: "Óculos", article: "os" })).toBe("Onde estão os óculos?");
  });
});

describe("Onde está? — regras", () => {
  it("erro permite nova tentativa; acerto avança; fim após a última", () => {
    let s = initialWhereState(2);
    s = whereReducer(s, { type: "answer", id: "b", correctId: "a" });
    expect(s.wrong).toEqual(["b"]);
    expect(s.solved).toBe(false);
    expect(whereReducer(s, { type: "next" })).toBe(s); // não avança sem acertar
    s = whereReducer(s, { type: "answer", id: "a", correctId: "a" });
    expect(s.solved).toBe(true);
    s = whereReducer(s, { type: "next" });
    expect(s).toMatchObject({ index: 1, wrong: [], solved: false });
    s = whereReducer(s, { type: "answer", id: "z", correctId: "z" });
    s = whereReducer(s, { type: "next" });
    expect(s.done).toBe(true);
  });
});
