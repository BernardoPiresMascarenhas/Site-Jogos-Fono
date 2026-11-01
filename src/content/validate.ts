import { CONCEPTS, PICTURES, getConcept, getPicture } from "./concepts";
import { bankRefs } from "./banks";
import { LANDMARK_ZONES } from "./games/siga-comando";
import { RHYME_KEYS } from "./games/rima";
import { ONSETS } from "./games/som-inicial";
import { SYLLABLE_CHOICES } from "./games/silabas";
import { DIFFICULTIES, DIFFICULTY_SIZE, isPoolActivity, type Activity, type BankActivity } from "./types";
import { checkCommand, startPositions } from "@/games/siga-comando/engine";
import { normalizeSentence } from "@/games/monte-frase/engine";

const MIN_POOL = DIFFICULTY_SIZE.dificil;

/** minúsculas e sem acentos (para comparar palavras). */
export function fold(text: string): string {
  return text.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/\p{M}/gu, "");
}

/**
 * Verifica a consistência do conteúdo. Executado pelos testes automatizados
 * (npm test), para que erros de digitação e falhas de revisão sejam detectados
 * antes do deploy.
 */
export function validateContent(activities: Activity[]): string[] {
  const errors: string[] = [];
  const conceptIds = new Set<string>();
  const words = new Set<string>();

  for (const c of CONCEPTS) {
    if (conceptIds.has(c.id)) errors.push(`Conceito duplicado: ${c.id}`);
    conceptIds.add(c.id);
    const w = c.word.toLocaleLowerCase("pt-BR");
    if (words.has(w)) errors.push(`Palavra duplicada: ${c.word}`);
    words.add(w);
    if (!c.media.alt.trim()) errors.push(`Conceito sem descrição acessível: ${c.id}`);
  }
  const pictureIds = new Set<string>();
  for (const p of PICTURES) {
    if (pictureIds.has(p.id)) errors.push(`Figura duplicada: ${p.id}`);
    if (conceptIds.has(p.id)) errors.push(`Figura com o mesmo id de um conceito: ${p.id}`);
    pictureIds.add(p.id);
  }

  const slugs = new Set<string>();
  const ids = new Set<string>();
  for (const a of activities) {
    if (slugs.has(a.slug)) errors.push(`Slug duplicado: ${a.slug}`);
    if (ids.has(a.id)) errors.push(`Id de atividade duplicado: ${a.id}`);
    slugs.add(a.slug);
    ids.add(a.id);
    if (!/^[a-z0-9-]+$/.test(a.slug)) errors.push(`Slug inválido: ${a.slug}`);

    if (isPoolActivity(a)) {
      const pool = new Set(a.conceptIds);
      if (pool.size !== a.conceptIds.length) errors.push(`${a.slug}: conceitos repetidos`);
      if (pool.size < MIN_POOL) errors.push(`${a.slug}: precisa de pelo menos ${MIN_POOL} conceitos (tem ${pool.size})`);
      for (const id of [...a.conceptIds, ...(a.coverConceptIds ?? [])]) {
        if (!conceptIds.has(id)) errors.push(`${a.slug}: conceito inexistente "${id}"`);
      }
      if (a.type === "onde-esta") {
        for (const q of a.questions ?? []) {
          if (!pool.has(q.targetId)) errors.push(`${a.slug}: alvo "${q.targetId}" fora do conjunto`);
          for (const d of q.distractorIds ?? []) {
            if (!conceptIds.has(d)) errors.push(`${a.slug}: alternativa inexistente "${d}"`);
            if (d === q.targetId) errors.push(`${a.slug}: alternativa igual à resposta "${d}"`);
          }
        }
        if (a.questionsPerRound !== undefined && a.questionsPerRound < 1) errors.push(`${a.slug}: questionsPerRound inválido`);
      }
      continue;
    }

    if (a.items.length === 0) errors.push(`${a.slug}: pacote vazio`);
    const itemIds = new Set<string>();
    for (const item of a.items) {
      if (itemIds.has(item.id)) errors.push(`${a.slug}: item repetido "${item.id}"`);
      itemIds.add(item.id);
      const refs = bankRefs(a.type, item);
      for (const id of refs.concepts) if (!getConcept(id)) errors.push(`${a.slug}/${item.id}: conceito inexistente "${id}"`);
      for (const id of refs.pictures) if (!getPicture(id)) errors.push(`${a.slug}/${item.id}: figura inexistente "${id}"`);
      for (const level of item.levels ?? []) if (!DIFFICULTIES.includes(level)) errors.push(`${a.slug}/${item.id}: nível inválido`);
    }
    errors.push(...validateBank(a));
  }
  return errors;
}

function unique<T>(list: readonly T[]): boolean {
  return new Set(list).size === list.length;
}

/** Regras específicas de cada jogo. */
function validateBank(a: BankActivity): string[] {
  const errors: string[] = [];
  const where = (id: string) => `${a.slug}/${id}`;
  switch (a.type) {
    case "intruso":
      for (const q of a.items) {
        if (q.groupIds.length < DIFFICULTY_SIZE.dificil - 1) errors.push(`${where(q.id)}: grupo precisa de 5 membros`);
        if (!unique(q.groupIds)) errors.push(`${where(q.id)}: membros repetidos`);
        if (q.groupIds.includes(q.intruderId)) errors.push(`${where(q.id)}: o intruso está no grupo`);
        if (!q.explanation.trim()) errors.push(`${where(q.id)}: sem explicação`);
      }
      break;
    case "quem-sou-eu":
      for (const q of a.items) {
        if (q.clues.length < 2 || q.clues.length > 4) errors.push(`${where(q.id)}: use de 2 a 4 pistas`);
        if (q.distractorIds.length < DIFFICULTY_SIZE.dificil - 1) errors.push(`${where(q.id)}: precisa de 5 distratores`);
        if (q.distractorIds.includes(q.answerId) || !unique(q.distractorIds)) errors.push(`${where(q.id)}: distratores inválidos`);
        const answer = getConcept(q.answerId);
        if (answer) {
          const word = fold(answer.word);
          const parts = word.split(/[\s-]+/).filter((p) => p.length > 2);
          for (const clue of q.clues) {
            const text = fold(clue);
            if (parts.some((p) => new RegExp(`\\b${p}`).test(text)))
              errors.push(`${where(q.id)}: a pista "${clue}" revela a palavra`);
          }
        }
      }
      break;
    case "siga-comando":
      for (const q of a.items) {
        for (const l of q.landmarkIds) if (!LANDMARK_ZONES[l]) errors.push(`${where(q.id)}: marco sem áreas definidas "${l}"`);
        const objectIds = q.objects.map((o) => o.id);
        if (!unique(objectIds)) errors.push(`${where(q.id)}: objeto repetido`);
        for (const g of q.goals) {
          if (!objectIds.includes(g.objectId)) errors.push(`${where(q.id)}: meta com objeto fora da cena`);
          if (!q.landmarkIds.includes(g.landmarkId)) errors.push(`${where(q.id)}: meta com marco fora da cena`);
          if (g.relation !== "fora" && !LANDMARK_ZONES[g.landmarkId]?.includes(g.relation))
            errors.push(`${where(q.id)}: "${g.landmarkId}" não tem a área "${g.relation}"`);
        }
        for (const o of q.objects) {
          if (o.start.at !== "chao" && !q.landmarkIds.includes(o.start.at)) errors.push(`${where(q.id)}: posição inicial inválida`);
        }
        if (checkCommand(q, startPositions(q), []) === "ok") errors.push(`${where(q.id)}: a cena já começa resolvida`);
      }
      break;
    case "ordem":
      for (const q of a.items) {
        if (q.steps.length < 3 || q.steps.length > 6) errors.push(`${where(q.id)}: use de 3 a 6 figuras`);
        if (!unique(q.steps)) errors.push(`${where(q.id)}: figuras repetidas`);
        if (!q.description.trim()) errors.push(`${where(q.id)}: sem descrição`);
      }
      break;
    case "monte-frase":
      for (const q of a.items) {
        const main = normalizeSentence(q.tokens.map((t) => t.text).join(" "));
        const bag = main.split(" ").sort().join(" ");
        for (const alt of q.alternatives ?? []) {
          if (normalizeSentence(alt).split(" ").sort().join(" ") !== bag)
            errors.push(`${where(q.id)}: a alternativa "${alt}" usa peças diferentes`);
          if (normalizeSentence(alt) === main) errors.push(`${where(q.id)}: alternativa igual à principal`);
        }
        if (q.tokens.length < 3) errors.push(`${where(q.id)}: frase com menos de 3 peças`);
      }
      break;
    case "silabas":
      for (const q of a.items) {
        const concept = getConcept(q.conceptId);
        if (q.syllableCount !== q.syllables.length) errors.push(`${where(q.id)}: syllableCount diferente do número de sílabas`);
        if (concept && q.syllables.join("") !== concept.word.toLocaleLowerCase("pt-BR"))
          errors.push(`${where(q.id)}: as sílabas não formam a palavra "${concept.word}"`);
        if (!DIFFICULTIES.some((d) => (!q.levels || q.levels.includes(d)) && SYLLABLE_CHOICES[d].includes(q.syllableCount)))
          errors.push(`${where(q.id)}: a resposta não aparece nas alternativas de nenhum nível`);
      }
      break;
    case "rima":
      for (const q of a.items) {
        const key = RHYME_KEYS[q.targetId];
        if (!key) errors.push(`${where(q.id)}: alvo sem chave de rima`);
        for (const id of q.correctIds) {
          if (RHYME_KEYS[id] === undefined) errors.push(`${where(q.id)}: "${id}" sem chave de rima`);
          else if (RHYME_KEYS[id] !== key) errors.push(`${where(q.id)}: "${id}" não rima com o alvo`);
        }
        for (const id of q.distractorIds) {
          if (RHYME_KEYS[id] === undefined) errors.push(`${where(q.id)}: distrator "${id}" sem chave de rima`);
          else if (RHYME_KEYS[id] === key) errors.push(`${where(q.id)}: o distrator "${id}" rima com o alvo`);
        }
        if (q.distractorIds.length < DIFFICULTY_SIZE.dificil - 1) errors.push(`${where(q.id)}: precisa de 5 distratores`);
        if (q.correctIds.includes(q.targetId)) errors.push(`${where(q.id)}: o alvo está entre as respostas`);
      }
      break;
    case "som-inicial":
      for (const q of a.items) {
        const options = [...q.targetIds, ...q.distractorIds, ...(q.nearIds ?? [])];
        if (!unique(options)) errors.push(`${where(q.id)}: figura repetida no conjunto`);
        if (options.includes(q.exampleId)) errors.push(`${where(q.id)}: o exemplo aparece entre as figuras`);
        if (ONSETS[q.exampleId] !== q.phoneme) errors.push(`${where(q.id)}: o exemplo não começa com ${q.phoneme}`);
        for (const id of q.targetIds) if (ONSETS[id] !== q.phoneme) errors.push(`${where(q.id)}: "${id}" não começa com ${q.phoneme}`);
        for (const id of [...q.distractorIds, ...(q.nearIds ?? [])]) {
          if (!ONSETS[id]) errors.push(`${where(q.id)}: "${id}" sem fonema inicial cadastrado`);
          else if (ONSETS[id] === q.phoneme) errors.push(`${where(q.id)}: o distrator "${id}" começa com ${q.phoneme}`);
        }
        if (q.targetIds.length < 4) errors.push(`${where(q.id)}: precisa de pelo menos 4 alvos`);
        if (q.distractorIds.length < 5) errors.push(`${where(q.id)}: precisa de pelo menos 5 distratores`);
      }
      break;
    case "escute":
      for (const q of a.items) {
        if (q.wordIds.length < 2 || q.wordIds.length > 3 || !unique(q.wordIds)) errors.push(`${where(q.id)}: use 2 ou 3 palavras distintas`);
        if (!q.contrast.trim()) errors.push(`${where(q.id)}: contraste não informado`);
      }
      break;
    case "desapareceu":
      break;
  }
  return errors;
}
