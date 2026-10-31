import { CONCEPTS } from "./concepts";
import { DIFFICULTY_SIZE, type Activity } from "./types";

const MIN_POOL = DIFFICULTY_SIZE.dificil;

/**
 * Verifica a consistência do conteúdo. Executado pelos testes automatizados
 * (npm test), para que erros de digitação em ids sejam detectados antes do deploy.
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

  const slugs = new Set<string>();
  const ids = new Set<string>();
  for (const a of activities) {
    if (slugs.has(a.slug)) errors.push(`Slug duplicado: ${a.slug}`);
    if (ids.has(a.id)) errors.push(`Id de atividade duplicado: ${a.id}`);
    slugs.add(a.slug);
    ids.add(a.id);
    if (!/^[a-z0-9-]+$/.test(a.slug)) errors.push(`Slug inválido: ${a.slug}`);

    const pool = new Set(a.conceptIds);
    if (pool.size !== a.conceptIds.length) errors.push(`${a.slug}: conceitos repetidos`);
    if (pool.size < MIN_POOL)
      errors.push(`${a.slug}: precisa de pelo menos ${MIN_POOL} conceitos (tem ${pool.size})`);
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
      if (a.questionsPerRound !== undefined && a.questionsPerRound < 1)
        errors.push(`${a.slug}: questionsPerRound inválido`);
    }
  }
  return errors;
}
