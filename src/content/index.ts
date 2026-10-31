import "server-only";
import { categoryLabel } from "./categories";
import { getConcept } from "./concepts";
import { LIGAR_ACTIVITIES } from "./activities/ligar";
import { MEMORIA_ACTIVITIES } from "./activities/memoria";
import { ONDE_ESTA_ACTIVITIES } from "./activities/onde-esta";
import type { Activity, ActivitySummary, Concept, ResolvedActivity } from "./types";
import { GAME_TYPE_META } from "@/games/meta";

/**
 * Todas as atividades da plataforma.
 * Para adicionar um pacote novo: crie um arquivo em ./activities e inclua aqui.
 * Este módulo é usado apenas no servidor — o conteúdo só chega ao navegador
 * de usuários autenticados.
 */
export const ACTIVITIES: Activity[] = [
  ...LIGAR_ACTIVITIES,
  ...MEMORIA_ACTIVITIES,
  ...ONDE_ESTA_ACTIVITIES,
];

function resolveConcepts(ids: string[]): Concept[] {
  return ids.map((id) => {
    const concept = getConcept(id);
    if (!concept) throw new Error(`Conceito inexistente: "${id}"`);
    return concept;
  });
}

export function getActivityBySlug(slug: string): Activity | undefined {
  return ACTIVITIES.find((a) => a.slug === slug);
}

export function resolveActivity(activity: Activity): ResolvedActivity {
  const { conceptIds, ...rest } = activity;
  const extraIds =
    activity.type === "onde-esta"
      ? (activity.questions ?? []).flatMap((q) => [q.targetId, ...(q.distractorIds ?? [])])
      : [];
  const pool = new Set(conceptIds);
  const extras = Array.from(new Set(extraIds.filter((id) => !pool.has(id))));
  return { ...rest, items: resolveConcepts(conceptIds), extras: resolveConcepts(extras) } as ResolvedActivity;
}

export function summarizeActivity(activity: Activity): ActivitySummary {
  const coverIds = activity.coverConceptIds ?? activity.conceptIds.slice(0, 3);
  const meta = GAME_TYPE_META[activity.type];
  return {
    slug: activity.slug,
    type: activity.type,
    title: activity.title,
    description: activity.description,
    category: activity.category,
    difficulty: activity.difficulty,
    accent: activity.accent,
    cover: resolveConcepts(coverIds).map((c) => c.media),
    itemCount: activity.conceptIds.length,
    meta: `${categoryLabel(activity.category)} · ${activity.conceptIds.length} ${meta.itemNoun}`,
  };
}

export function getActivitySummaries(): ActivitySummary[] {
  return ACTIVITIES.map(summarizeActivity);
}
