import { describe, expect, it } from "vitest";
import { ACTIVITIES, getGameSummaries, resolveActivity } from "@/content";
import { BANKS } from "@/content/banks";
import { CONCEPTS, PICTURES } from "@/content/concepts";
import { validateContent } from "@/content/validate";
import { createWhereRound } from "@/games/onde-esta/engine";
import { createLigarRound } from "@/games/ligar/engine";
import { createMemoryDeck } from "@/games/memoria/engine";
import { createGameRound } from "@/games/rounds";
import { GAME_TYPES } from "@/games/meta";
import { DIFFICULTIES, isPoolActivity, type OndeEstaActivity, type ResolvedActivity } from "@/content/types";
import { createRng } from "@/lib/random";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("conteúdo", () => {
  it("é consistente (ids, slugs, regras de revisão de cada jogo)", () => {
    expect(validateContent(ACTIVITIES)).toEqual([]);
  });

  it("tem os 13 tipos de jogo, cada um com conteúdo", () => {
    expect(GAME_TYPES).toHaveLength(13);
    expect(new Set(ACTIVITIES.map((a) => a.type))).toEqual(new Set(GAME_TYPES));
    expect(CONCEPTS.length).toBeGreaterThanOrEqual(100);
  });

  it("cada jogo novo tem pelo menos 8 desafios distintos", () => {
    for (const [type, items] of Object.entries(BANKS)) {
      expect(items.length, type).toBeGreaterThanOrEqual(8);
      expect(new Set(items.map((i) => i.id)).size, `${type}: ids únicos`).toBe(items.length);
    }
  });

  it("os jogos com categorias têm pelo menos 3 categorias próprias", () => {
    const summaries = getGameSummaries();
    for (const type of ["intruso", "quem-sou-eu", "ordem", "silabas", "desapareceu"] as const) {
      const s = summaries.find((g) => g.type === type)!;
      expect(s.categories.length, type).toBeGreaterThanOrEqual(3);
    }
  });

  it("todas as imagens locais existem (sem imagens quebradas)", () => {
    for (const item of [...CONCEPTS, ...PICTURES]) {
      if (item.media.kind !== "emoji") expect(existsSync(join("public", item.media.src)), item.media.src).toBe(true);
    }
  });

  it("o pacote Variadas de cada jogo funciona nos 3 níveis", () => {
    for (const s of getGameSummaries()) {
      const variadas = s.packs.find((p) => p.category === "variadas");
      expect(variadas, s.type).toBeTruthy();
      for (const d of DIFFICULTIES) expect(variadas!.availability[d], `${s.type} ${d}`).toBeNull();
    }
  });

  it("todo pacote disponível gera partidas válidas em todos os níveis liberados", () => {
    for (const activity of ACTIVITIES) {
      const resolved = resolveActivity(activity);
      for (const level of DIFFICULTIES) {
        const rng = createRng(11);
        if (resolved.type === "ligar") expect(createLigarRound(resolved.items, level, rng).pairs.length).toBeGreaterThan(0);
        else if (resolved.type === "memoria") expect(createMemoryDeck(resolved.items, level, resolved.mode, rng).cards.length).toBeGreaterThan(0);
        else if (resolved.type === "onde-esta") expect(createWhereRound(resolved as ResolvedActivity<OndeEstaActivity>, level, rng).length).toBeGreaterThan(0);
        else {
          const summary = getGameSummaries().find((g) => g.type === activity.type)!.packs.find((p) => p.slug === activity.slug)!;
          if (summary.availability[level] !== null) continue;
          const round = createGameRound(resolved, level, rng, {});
          expect(round.length, `${activity.slug} ${level}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("gera os cards da biblioteca", () => {
    const summaries = getGameSummaries();
    expect(summaries).toHaveLength(13);
    for (const s of summaries) {
      expect(s.cover.length, s.type).toBe(3);
      expect(s.packs.length, s.type).toBeGreaterThan(0);
      expect(s.difficulties, s.type).toEqual(DIFFICULTIES);
      expect(s.itemCount, s.type).toBeGreaterThan(0);
    }
  });

  it("os pacotes dos três jogos originais continuam com o mesmo endereço", () => {
    const slugs = ACTIVITIES.filter(isPoolActivity).map((a) => a.slug);
    for (const slug of ["ligue-os-bichos", "memoria-palavras-da-cozinha", "onde-esta-o-bicho", "onde-esta-no-corpo"]) {
      expect(slugs).toContain(slug);
    }
  });
});
