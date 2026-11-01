import { describe, expect, it } from "vitest";
import { ACTIVITIES, resolveActivity } from "@/content";
import { RHYME_KEYS } from "@/content/games/rima";
import { ONSETS } from "@/content/games/som-inicial";
import { COMMANDS } from "@/content/games/siga-comando";
import {
  DIFFICULTIES,
  DIFFICULTY_SIZE,
  type BankActivity,
  type BankGameType,
  type CommandQuestion,
  type Difficulty,
  type ResolvedActivity,
} from "@/content/types";
import { createRng } from "@/lib/random";
import { choiceReducer, initialChoiceState, shuffleAvoidingIndex } from "@/games/shared/bank";
import { createIntrusoRound } from "@/games/intruso/engine";
import { createRiddleRound, initialRiddleState, riddleReducer } from "@/games/quem-sou-eu/engine";
import { checkCommand, commandReducer, initialCommandState, startPositions, ZONE_CAPACITY } from "@/games/siga-comando/engine";
import { createSequenceRound, initialSequenceState, sequenceReducer } from "@/games/ordem/engine";
import {
  acceptedSentences,
  createSentenceRound,
  formatSentence,
  initialSentenceState,
  normalizeSentence,
  sentenceReducer,
} from "@/games/monte-frase/engine";
import { createSyllableRound } from "@/games/silabas/engine";
import { createRhymeRound } from "@/games/rima/engine";
import { createSoundRound, evaluateSelection, initialSoundState, soundReducer, SOUND_LAYOUT } from "@/games/som-inicial/engine";
import { createListenRound, groupsWithAudio, LISTEN_OPTIONS } from "@/games/escute/engine";
import { createDisappearRound, DISAPPEAR_LAYOUT, disappearReducer, initialDisappearState } from "@/games/desapareceu/engine";

function variadas<T extends BankGameType>(type: T): ResolvedActivity<BankActivity<T>> {
  const a = ACTIVITIES.find((x) => x.type === type && x.category === "variadas");
  if (!a) throw new Error(type);
  return resolveActivity(a) as ResolvedActivity<BankActivity<T>>;
}

const SEEDS = Array.from({ length: 25 }, (_, i) => i + 1);

describe("estado de escolha única (compartilhado)", () => {
  it("erro, acerto, ignora cliques depois do acerto e só avança depois de acertar", () => {
    let s = initialChoiceState(2);
    s = choiceReducer(s, { type: "next" });
    expect(s.index).toBe(0);
    s = choiceReducer(s, { type: "answer", id: "b", correctIds: ["a"] });
    expect(s.wrong).toEqual(["b"]);
    expect(s.missNonce).toBe(1);
    s = choiceReducer(s, { type: "answer", id: "b", correctIds: ["a"] });
    expect(s.missNonce).toBe(1);
    s = choiceReducer(s, { type: "answer", id: "a", correctIds: ["a"] });
    expect(s.solvedId).toBe("a");
    const same = choiceReducer(s, { type: "answer", id: "c", correctIds: ["a"] });
    expect(same).toBe(s);
    s = choiceReducer(s, { type: "next" });
    expect(s).toMatchObject({ index: 1, wrong: [], solvedId: null });
    s = choiceReducer(s, { type: "answer", id: "x", correctIds: ["x"] });
    s = choiceReducer(s, { type: "next" });
    expect(s.done).toBe(true);
  });

  it("a resposta muda de posição entre perguntas consecutivas", () => {
    const rng = createRng(3);
    let prev = -1;
    for (let i = 0; i < 200; i++) {
      const { index } = shuffleAvoidingIndex(["a", "b", "c", "d"], "a", prev, rng);
      expect(index).not.toBe(prev);
      prev = index;
    }
  });
});

describe("Jogo 4 — Qual é o intruso?", () => {
  const activity = variadas("intruso");
  it.each(DIFFICULTIES)("nível %s: quantidade de imagens, intruso presente uma vez, sem repetir questões", (d) => {
    for (const seed of SEEDS) {
      const round = createIntrusoRound(activity, d, createRng(seed));
      expect(new Set(round.map((q) => q.id)).size).toBe(round.length);
      for (const q of round) {
        expect(q.options).toHaveLength(DIFFICULTY_SIZE[d]);
        expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length);
        expect(q.options.filter((o) => o.id === q.intruder.id)).toHaveLength(1);
        const item = activity.items.find((i) => i.id === q.id)!;
        for (const o of q.options) if (o.id !== q.intruder.id) expect(item.groupIds).toContain(o.id);
        expect(q.explanation.length).toBeGreaterThan(10);
      }
    }
  });

  it("embaralha: a posição do intruso varia entre partidas", () => {
    const positions = new Set(SEEDS.map((s) => {
      const q = createIntrusoRound(activity, "medio", createRng(s))[0];
      return q.options.indexOf(q.intruder);
    }));
    expect(positions.size).toBeGreaterThan(1);
  });
});

describe("Jogo 5 — Quem sou eu?", () => {
  const activity = variadas("quem-sou-eu");
  it("revela pistas uma a uma até o limite e reinicia na próxima adivinha", () => {
    const round = createRiddleRound(activity, "medio", createRng(1));
    const max = round[0].clues.length;
    let s = initialRiddleState(round.length);
    expect(s.revealed).toBe(1);
    for (let i = 0; i < 10; i++) s = riddleReducer(s, { type: "reveal", max });
    expect(s.revealed).toBe(max);
    s = riddleReducer(s, { type: "answer", id: "errado", correctIds: [round[0].answer.id] });
    expect(s.wrong).toEqual(["errado"]);
    s = riddleReducer(s, { type: "answer", id: round[0].answer.id, correctIds: [round[0].answer.id] });
    expect(riddleReducer(s, { type: "reveal", max })).toBe(s);
    s = riddleReducer(s, { type: "next" });
    expect(s).toMatchObject({ index: 1, revealed: 1, wrong: [] });
  });

  it.each(DIFFICULTIES)("nível %s: alternativas com a resposta e sem repetição", (d) => {
    for (const seed of SEEDS) {
      for (const q of createRiddleRound(activity, d, createRng(seed))) {
        expect(q.options).toHaveLength(DIFFICULTY_SIZE[d]);
        expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length);
        expect(q.options.some((o) => o.id === q.answer.id)).toBe(true);
      }
    }
  });
});

describe("Jogo 6 — Siga o comando", () => {
  const one = COMMANDS.find((c) => c.id === "bola-dentro-caixa")!;
  const two = COMMANDS.find((c) => c.id === "bola-caixa-gato-cadeira")!;
  const ordered = COMMANDS.find((c) => c.id === "antes-gato-bola")!;
  const fora = COMMANDS.find((c) => c.id === "ursinho-fora-caixa")!;

  function play(command: CommandQuestion, moves: [string, { at: string; relation?: string }][]) {
    let s = initialCommandState([command]);
    for (const [objectId, to] of moves) {
      s = commandReducer(s, { type: "select", objectId });
      s = commandReducer(s, { type: "place", to: to as never });
    }
    return commandReducer(s, { type: "check", command });
  }

  it("alternativa por toque: seleciona o objeto e depois o lugar", () => {
    let s = initialCommandState([one]);
    s = commandReducer(s, { type: "select", objectId: "bola" });
    expect(s.selected).toBe("bola");
    s = commandReducer(s, { type: "place", to: { at: "caixa", relation: "dentro" } });
    expect(s.positions.bola).toEqual({ at: "caixa", relation: "dentro" });
    expect(s.selected).toBeNull();
    expect(s.history).toHaveLength(1);
  });

  it("valida a posição de verdade (não aceita qualquer lugar)", () => {
    expect(play(one, [["bola", { at: "caixa", relation: "dentro" }]]).solved).toBe(true);
    expect(play(one, [["bola", { at: "caixa", relation: "em-cima" }]]).result?.kind).toBe("incomplete");
    expect(play(one, [["bola", { at: "cadeira", relation: "em-cima" }]]).result?.kind).toBe("incomplete");
    // mover um objeto que o comando não pede
    expect(play(one, [["bola", { at: "caixa", relation: "dentro" }], ["gato", { at: "cadeira", relation: "em-cima" }]]).result?.kind).toBe("extra");
  });

  it("comando de duas etapas exige as duas metas", () => {
    expect(play(two, [["bola", { at: "caixa", relation: "dentro" }]]).result?.kind).toBe("incomplete");
    expect(play(two, [["gato", { at: "cadeira", relation: "em-cima" }], ["bola", { at: "caixa", relation: "dentro" }]]).solved).toBe(true);
  });

  it("antes/depois: confere a ordem das ações", () => {
    const certo = play(ordered, [["bola", { at: "cadeira", relation: "em-cima" }], ["gato", { at: "cadeira", relation: "embaixo" }]]);
    expect(certo.solved).toBe(true);
    const invertido = play(ordered, [["gato", { at: "cadeira", relation: "embaixo" }], ["bola", { at: "cadeira", relation: "em-cima" }]]);
    expect(invertido.result?.kind).toBe("order");
  });

  it("\"fora\" aceita qualquer lugar fora da caixa", () => {
    expect(play(fora, [["ursinho", { at: "chao" }]]).solved).toBe(true);
    expect(play(fora, [["ursinho", { at: "cadeira", relation: "em-cima" }]]).solved).toBe(true);
    expect(checkCommand(fora, startPositions(fora), [])).toBe("incomplete");
  });

  it("respeita a capacidade de cada lugar e o reinício da cena", () => {
    let s = initialCommandState([two]);
    const to = { at: "cadeira", relation: "em-cima" } as const;
    for (const id of ["bola", "gato", "cachorro"]) s = commandReducer(s, { type: "move", objectId: id, to });
    const onChair = Object.values(s.positions).filter((p) => p.at === "cadeira").length;
    expect(onChair).toBe(ZONE_CAPACITY);
    expect(s.notice?.kind).toBe("full");
    s = commandReducer(s, { type: "reset", command: two });
    expect(s.positions).toEqual(startPositions(two));
    expect(s.history).toEqual([]);
  });

  it("nenhum comando do acervo começa resolvido", () => {
    for (const c of COMMANDS) expect(checkCommand(c, startPositions(c), []), c.id).not.toBe("ok");
  });
});

describe("Jogo 7 — Coloque na ordem certa", () => {
  const activity = variadas("ordem");
  it.each([["facil", [3]], ["medio", [4]], ["dificil", [5, 6]]] as [Difficulty, number[]][])(
    "nível %s usa sequências de %j figuras e nunca começa na ordem certa",
    (d, sizes) => {
      for (const seed of SEEDS) {
        for (const q of createSequenceRound(activity, d, createRng(seed))) {
          expect(sizes).toContain(q.steps.length);
          expect(q.initial).not.toEqual(q.steps.map((p) => p.id));
          expect([...q.initial].sort()).toEqual(q.steps.map((p) => p.id).sort());
        }
      }
    },
  );

  it("troca por seleção, confere, marca erros e permite corrigir", () => {
    const [q] = createSequenceRound(activity, "facil", createRng(4));
    const correct = q.steps.map((p) => p.id);
    let s = initialSequenceState([q]);
    s = sequenceReducer(s, { type: "check", correct });
    expect(s.solved).toBe(false);
    expect(s.checked?.some((ok) => !ok)).toBe(true);
    expect(s.missNonce).toBe(1);
    // corrige trocando posições até ficar certo
    for (let i = 0; i < correct.length; i++) {
      const j = s.arrangement.indexOf(correct[i]);
      if (j !== i) {
        s = sequenceReducer(s, { type: "select", position: i });
        s = sequenceReducer(s, { type: "select", position: j });
        expect(s.checked).toBeNull();
      }
    }
    s = sequenceReducer(s, { type: "check", correct });
    expect(s.solved).toBe(true);
  });

  it("arrastar troca duas posições; selecionar a mesma carta desmarca", () => {
    const [q] = createSequenceRound(activity, "medio", createRng(9));
    let s = initialSequenceState([q]);
    const before = s.arrangement.slice();
    s = sequenceReducer(s, { type: "swap", a: 0, b: 3 });
    expect(s.arrangement[0]).toBe(before[3]);
    expect(s.arrangement[3]).toBe(before[0]);
    s = sequenceReducer(s, { type: "select", position: 1 });
    s = sequenceReducer(s, { type: "select", position: 1 });
    expect(s.selected).toBeNull();
  });
});

describe("Jogo 8 — Monte a frase", () => {
  const activity = variadas("monte-frase");

  it.each([["facil", [3]], ["medio", [4, 5]], ["dificil", [6, 7, 8]]] as [Difficulty, number[]][])(
    "nível %s usa frases de %j peças",
    (d, sizes) => {
      for (const seed of SEEDS) for (const q of createSentenceRound(activity, d, createRng(seed))) expect(sizes).toContain(q.pieces.length);
    },
  );

  it("coloca, tira, troca de lugar e confere (ordem certa e errada)", () => {
    const [q] = createSentenceRound(activity, "facil", createRng(2));
    const textOf = Object.fromEntries(q.pieces.map((p) => [p.key, p.text]));
    let s = initialSentenceState([q]);
    // ordem errada: invertida
    for (const p of [...q.pieces].reverse()) s = sentenceReducer(s, { type: "place", key: p.key });
    expect(s.slots.every(Boolean)).toBe(true);
    s = sentenceReducer(s, { type: "check", textOf, accepted: q.accepted });
    expect(s.solved).toBe(false);
    expect(s.wrongSlots.length).toBeGreaterThan(0);
    // tira a primeira peça e coloca de volta em outro espaço (troca)
    s = sentenceReducer(s, { type: "remove", slot: 0 });
    expect(s.slots[0]).toBeNull();
    s = sentenceReducer(s, { type: "place", key: q.pieces[2].key, slot: 0 });
    // monta a ordem certa por trocas
    for (let i = 0; i < q.pieces.length; i++) s = sentenceReducer(s, { type: "place", key: q.pieces[i].key, slot: i });
    s = sentenceReducer(s, { type: "check", textOf, accepted: q.accepted });
    expect(s.solved).toBe(true);
    expect(formatSentence(s.slots.map((k) => textOf[k!]))).toMatch(/^[A-ZÀ-Ú].*\.$/);
  });

  it("aceita ordens alternativas válidas cadastradas", () => {
    const item = activity.items.find((i) => i.id === "pato-sapo-lago")!;
    const accepted = acceptedSentences(item);
    expect(accepted).toContain(normalizeSentence("O sapo e o pato nadam no lago."));
    expect(accepted).toContain(normalizeSentence("o pato e o sapo nadam no lago"));
    expect(accepted).not.toContain(normalizeSentence("o lago nadam no pato e o sapo"));
  });

  it("não confere com espaços vazios", () => {
    const [q] = createSentenceRound(activity, "medio", createRng(5));
    const textOf = Object.fromEntries(q.pieces.map((p) => [p.key, p.text]));
    let s = initialSentenceState([q]);
    s = sentenceReducer(s, { type: "place", key: q.pieces[0].key });
    expect(sentenceReducer(s, { type: "check", textOf, accepted: q.accepted })).toBe(s);
  });
});

describe("Jogo 9 — Quantas sílabas?", () => {
  const activity = variadas("silabas");
  it.each(DIFFICULTIES)("nível %s: a resposta está entre as alternativas e bate com a separação cadastrada", (d) => {
    for (const seed of SEEDS) {
      for (const q of createSyllableRound(activity, d, createRng(seed))) {
        expect(q.choices).toContain(q.count);
        expect(q.syllables).toHaveLength(q.count);
        expect(q.syllables.join("")).toBe(q.concept.word.toLocaleLowerCase("pt-BR"));
      }
    }
  });

  it("fácil só tem palavras de 1 ou 2 sílabas; difícil, de 3 ou mais", () => {
    for (const seed of SEEDS) {
      for (const q of createSyllableRound(activity, "facil", createRng(seed))) expect(q.count).toBeLessThanOrEqual(2);
      for (const q of createSyllableRound(activity, "dificil", createRng(seed))) expect(q.count).toBeGreaterThanOrEqual(3);
    }
  });

  it("separações conferidas", () => {
    const get = (id: string) => activity.items.find((i) => i.conceptId === id)!.syllables.join("-");
    expect(get("banana")).toBe("ba-na-na");
    expect(get("helicoptero")).toBe("he-li-cóp-te-ro");
    expect(get("coelho")).toBe("co-e-lho");
  });
});

describe("Jogo 10 — Qual palavra rima?", () => {
  const activity = variadas("rima");
  it.each(DIFFICULTIES)("nível %s: exatamente uma alternativa rima com o alvo", (d) => {
    for (const seed of SEEDS) {
      for (const q of createRhymeRound(activity, d, createRng(seed))) {
        const key = RHYME_KEYS[q.target.id];
        expect(q.options).toHaveLength(DIFFICULTY_SIZE[d]);
        expect(q.options.filter((o) => RHYME_KEYS[o.id] === key).map((o) => o.id)).toEqual([q.answer.id]);
        expect(q.options.some((o) => o.id === q.target.id)).toBe(false);
      }
    }
  });

  it("rima é fonológica, não só de letras", () => {
    expect(RHYME_KEYS.pipoca).not.toBe(RHYME_KEYS.boca ?? "oka");
    expect(RHYME_KEYS.sorvete).not.toBe(RHYME_KEYS.leite);
  });
});

describe("Jogo 11 — Caça ao som inicial", () => {
  const activity = variadas("som-inicial");
  it.each(DIFFICULTIES)("nível %s: alvos começam com o fonema; distratores não", (d) => {
    for (const seed of SEEDS) {
      for (const q of createSoundRound(activity, d, createRng(seed))) {
        const layout = SOUND_LAYOUT[d];
        expect(q.options).toHaveLength(layout.targets + layout.distractors);
        expect(q.targetIds).toHaveLength(layout.targets);
        for (const o of q.options) expect(ONSETS[o.id] === q.phoneme).toBe(q.targetIds.includes(o.id));
        expect(q.options.some((o) => o.id === q.example.id)).toBe(false);
      }
    }
  });

  it("som ≠ letra: cenoura começa com /s/ e queijo com /k/", () => {
    expect(ONSETS.cenoura).toBe("/s/");
    expect(ONSETS.casa).toBe("/k/");
    expect(ONSETS.queijo).toBe("/k/");
    expect(ONSETS.chave).toBe("/ʃ/");
  });

  it("seleção múltipla, conferência com marcas e finalização", () => {
    const round = createSoundRound(activity, "medio", createRng(7));
    let s = initialSoundState(round.length);
    for (let i = 0; i < round.length; i++) {
      const q = round[i];
      const wrong = q.options.find((o) => !q.targetIds.includes(o.id))!.id;
      s = soundReducer(s, { type: "toggle", id: q.targetIds[0] });
      s = soundReducer(s, { type: "toggle", id: wrong });
      s = soundReducer(s, { type: "check", targetIds: q.targetIds });
      expect(s.solved).toBe(false);
      expect(s.checked).toEqual(evaluateSelection([q.targetIds[0], wrong], q.targetIds));
      expect(s.checked!.missed.length).toBe(q.targetIds.length - 1);
      s = soundReducer(s, { type: "toggle", id: wrong });
      expect(s.checked).toBeNull();
      for (const t of q.targetIds.slice(1)) s = soundReducer(s, { type: "toggle", id: t });
      s = soundReducer(s, { type: "check", targetIds: q.targetIds });
      expect(s.solved).toBe(true);
      s = soundReducer(s, { type: "next" });
    }
    expect(s.done).toBe(true);
  });
});

describe("Jogo 12 — Escute e escolha", () => {
  const activity = variadas("escute");
  it.each(DIFFICULTIES)("nível %s: alvo entre as alternativas, com parceiros do par mínimo", (d) => {
    for (const seed of SEEDS) {
      for (const q of createListenRound(activity, d, "profissional", createRng(seed))) {
        expect(q.options).toHaveLength(LISTEN_OPTIONS[d]);
        expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length);
        expect(q.options.some((o) => o.id === q.target.id)).toBe(true);
        const group = activity.items.find((g) => g.id === q.id)!;
        expect(group.wordIds).toContain(q.target.id);
        // pelo menos um parceiro do mesmo par mínimo está presente
        expect(q.options.some((o) => o.id !== q.target.id && group.wordIds.includes(o.id))).toBe(true);
      }
    }
  });

  it("sem gravações, o modo áudio não tem conteúdo (o jogo usa o modo profissional)", () => {
    expect(groupsWithAudio(activity.items, (id) => Boolean(activity.lexicon[id]?.audio))).toHaveLength(0);
    expect(createListenRound(activity, "facil", "audio", createRng(1))).toHaveLength(0);
  });

  it("com gravações cadastradas, o modo áudio usa só grupos completos", () => {
    const withAudio = {
      ...activity,
      lexicon: { ...activity.lexicon, faca: { ...activity.lexicon.faca, audio: "/a/faca.mp3" }, vaca: { ...activity.lexicon.vaca, audio: "/a/vaca.mp3" } },
    };
    const round = createListenRound(withAudio, "facil", "audio", createRng(1));
    expect(round.map((q) => q.id)).toEqual(["faca-vaca"]);
    expect(round[0].target.audio).toBeTruthy();
  });
});

describe("Jogo 13 — O que desapareceu?", () => {
  const activity = variadas("desapareceu");
  it.each(DIFFICULTIES)("nível %s: o objeto que some estava na tela e as alternativas são distintas", (d) => {
    for (const seed of SEEDS) {
      const round = createDisappearRound(activity, d, createRng(seed));
      expect(new Set(round.map((q) => q.target.id)).size).toBe(round.length);
      for (const q of round) {
        const layout = DISAPPEAR_LAYOUT[d];
        expect(q.shown).toHaveLength(layout.shown);
        expect(new Set(q.shown.map((c) => c.id)).size).toBe(layout.shown);
        expect(q.shown.some((c) => c.id === q.target.id)).toBe(true);
        expect(q.remaining.some((c) => c?.id === q.target.id)).toBe(false);
        expect(q.remaining.filter(Boolean)).toHaveLength(layout.shown - 1);
        expect(q.options).toHaveLength(layout.options);
        expect(new Set(q.options.map((o) => o.id)).size).toBe(layout.options);
        expect(q.options.some((o) => o.id === q.target.id)).toBe(true);
        if (layout.keepPositions) expect(q.remaining.indexOf(null)).toBe(q.shown.findIndex((c) => c.id === q.target.id));
      }
    }
  });

  it("fases: observar → esconder → perguntar; respostas só na pergunta", () => {
    let s = initialDisappearState(1);
    expect(disappearReducer(s, { type: "answer", id: "x", correctId: "x" })).toBe(s);
    s = disappearReducer(s, { type: "ready" });
    expect(s.phase).toBe("hiding");
    s = disappearReducer(s, { type: "ready" });
    expect(s.phase).toBe("hiding");
    s = disappearReducer(s, { type: "revealed" });
    expect(s.phase).toBe("question");
    s = disappearReducer(s, { type: "answer", id: "y", correctId: "x" });
    expect(s.wrong).toEqual(["y"]);
    s = disappearReducer(s, { type: "answer", id: "x", correctId: "x" });
    s = disappearReducer(s, { type: "next" });
    expect(s.done).toBe(true);
  });
});
