import "server-only";
import { CATEGORIES, categoryLabel } from "./categories";
import { getConcept, getPicture } from "./concepts";
import { LIGAR_ACTIVITIES } from "./activities/ligar";
import { MEMORIA_ACTIVITIES } from "./activities/memoria";
import { ONDE_ESTA_ACTIVITIES } from "./activities/onde-esta";
import { BANKS, bankCategoryOf, bankRefs } from "./banks";
import {
  DIFFICULTIES,
  isPoolActivity,
  type Activity,
  type Availability,
  type BankActivity,
  type BankActivityMap,
  type BankGameType,
  type CategoryId,
  type Concept,
  type Difficulty,
  type GameSummary,
  type GameType,
  type PackSummary,
  type Picture,
  type PoolActivity,
  type ResolvedActivity,
} from "./types";
import { bankAvailability } from "@/games/availability";
import { groupsWithAudio, LISTEN_MIN } from "@/games/escute/engine";
import { GAME_TYPE_META, GAME_TYPES } from "@/games/meta";

/**
 * Catálogo de atividades da plataforma.
 *  - Jogos 1–3: atividades escritas à mão em ./activities (+ um pacote "Variadas" gerado).
 *  - Jogos 4–13: bancos de questões em ./games; os pacotes por categoria são gerados aqui.
 * Este módulo é usado apenas no servidor — o conteúdo só chega ao navegador
 * de usuários autenticados.
 */

const POOL_ACTIVITIES: PoolActivity[] = [...LIGAR_ACTIVITIES, ...MEMORIA_ACTIVITIES, ...ONDE_ESTA_ACTIVITIES];

/** Um pacote de categoria só é criado com pelo menos esta quantidade de itens. */
const MIN_PACK_ITEMS = 3;

/** Ilustração de cada card na biblioteca. */
const COVERS: Record<GameType, string[]> = {
  ligar: ["cachorro", "vaca", "galinha"],
  memoria: ["leao", "sapo", "borboleta"],
  "onde-esta": ["gato", "elefante", "pato"],
  intruso: ["gato", "carro", "cachorro"],
  "quem-sou-eu": ["coruja", "banana", "bombeiro"],
  "siga-comando": ["gato", "cadeira", "bola"],
  ordem: ["ninho", "pintinho-nasce", "vira-galinha"],
  "monte-frase": ["menino", "acao-comer", "maca"],
  silabas: ["banana", "borboleta", "sol"],
  rima: ["pao", "gato", "mao"],
  "som-inicial": ["pato", "pipoca", "pera"],
  escute: ["vaca", "faca", "pato"],
  desapareceu: ["balao", "ursinho", "bola"],
};

function poolVariety(type: PoolActivity["type"]): PoolActivity {
  const ofType = POOL_ACTIVITIES.filter((a) => a.type === type);
  const conceptIds = Array.from(new Set(ofType.flatMap((a) => a.conceptIds)));
  const meta = GAME_TYPE_META[type];
  const base = {
    id: `${type}-variadas`,
    slug: `${meta.slugBase}-variadas`,
    title: "Palavras variadas",
    description: "Mistura de todas as categorias.",
    category: "variadas" as const,
    difficulty: "medio" as const,
    instruction: ofType[0]?.instruction ?? meta.instruction,
    accent: meta.accent,
    conceptIds,
    coverConceptIds: COVERS[type],
  };
  if (type === "memoria") return { ...base, type, mode: "imagem-imagem", instruction: meta.instruction };
  return { ...base, type } as PoolActivity;
}

function bankPacks<T extends BankGameType>(type: T): BankActivity<T>[] {
  const items = BANKS[type] as unknown as BankActivityMap[T][];
  const meta = GAME_TYPE_META[type];
  const groups = new Map<CategoryId, BankActivityMap[T][]>();
  for (const item of items) {
    const cat = bankCategoryOf(type, item);
    if (cat === "variadas") continue;
    groups.set(cat, [...(groups.get(cat) ?? []), item]);
  }
  const make = (category: CategoryId, packItems: BankActivityMap[T][]): BankActivity<T> => {
    const availability = DIFFICULTIES.map((d) => bankAvailability(type, packItems, d));
    const firstOk = DIFFICULTIES.find((_, i) => availability[i] === null) ?? "facil";
    return {
      id: `${type}-${category}`,
      slug: `${meta.slugBase}-${category}`,
      type,
      title: category === "variadas" ? "Variadas" : categoryLabel(category),
      description: category === "variadas" ? "Mistura de todas as categorias." : `Desafios de ${categoryLabel(category).toLowerCase()}.`,
      category,
      difficulty: firstOk,
      instruction: meta.instruction,
      accent: meta.accent,
      items: packItems,
    } as unknown as BankActivity<T>;
  };
  // Pacote de categoria só quando tem itens suficientes e pelo menos um nível jogável
  // (os itens continuam disponíveis no pacote "Variadas").
  const packs = CATEGORIES.filter((c) => (groups.get(c.id)?.length ?? 0) >= MIN_PACK_ITEMS)
    .filter((c) => DIFFICULTIES.some((d) => bankAvailability(type, groups.get(c.id)!, d) === null))
    .map((c) => make(c.id, groups.get(c.id)!));
  return [...packs, make("variadas", items)];
}

export const ACTIVITIES: Activity[] = [
  ...POOL_ACTIVITIES,
  poolVariety("ligar"),
  poolVariety("memoria"),
  poolVariety("onde-esta"),
  ...(Object.keys(BANKS) as BankGameType[]).flatMap((t) => bankPacks(t) as Activity[]),
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

export function getActivitiesByType(type: GameType): Activity[] {
  return ACTIVITIES.filter((a) => a.type === type);
}

export function resolveActivity(activity: Activity): ResolvedActivity {
  if (isPoolActivity(activity)) {
    const { conceptIds, ...rest } = activity;
    const extraIds =
      activity.type === "onde-esta"
        ? (activity.questions ?? []).flatMap((q) => [q.targetId, ...(q.distractorIds ?? [])])
        : [];
    const pool = new Set(conceptIds);
    const extras = Array.from(new Set(extraIds.filter((id) => !pool.has(id))));
    return { ...rest, items: resolveConcepts(conceptIds), extras: resolveConcepts(extras) } as ResolvedActivity;
  }
  const lexicon: Record<string, Concept> = {};
  const pictures: Record<string, Picture> = {};
  for (const item of activity.items) {
    const refs = bankRefs(activity.type, item);
    for (const id of refs.concepts) lexicon[id] = resolveConcepts([id])[0];
    for (const id of refs.pictures) {
      const picture = getPicture(id);
      if (!picture) throw new Error(`Figura inexistente: "${id}"`);
      pictures[id] = picture;
    }
  }
  return { ...activity, lexicon, pictures } as ResolvedActivity;
}

/** Disponibilidade de cada nível (null = disponível). */
export function activityAvailability(activity: Activity): Availability {
  const entries = DIFFICULTIES.map((d): [Difficulty, string | null] => [
    d,
    isPoolActivity(activity) ? null : bankAvailability(activity.type, activity.items, d),
  ]);
  return Object.fromEntries(entries) as Availability;
}

function packSummary(activity: Activity): PackSummary {
  const summary: PackSummary = {
    slug: activity.slug,
    title: activity.title,
    category: activity.category,
    difficulty: activity.difficulty,
    itemCount: isPoolActivity(activity) ? activity.conceptIds.length : activity.items.length,
    availability: activityAvailability(activity),
  };
  if (activity.type === "memoria") summary.defaultOptions = { modo: activity.mode };
  if (activity.type === "escute") {
    const withAudio = groupsWithAudio(activity.items, (id) => Boolean(getConcept(id)?.audio)).length;
    if (withAudio < LISTEN_MIN) {
      summary.disabledOptions = {
        modo: {
          audio:
            withAudio === 0
              ? "Ainda não há gravações cadastradas. Use o modo conduzido pela profissional."
              : `Só ${withAudio} pares têm gravação completa (mínimo ${LISTEN_MIN}).`,
        },
      };
    }
  }
  return summary;
}

function coverMedia(type: GameType) {
  return COVERS[type].map((id) => (getConcept(id) ?? getPicture(id))!.media);
}

export function getGameSummary(type: GameType): GameSummary {
  const activities = getActivitiesByType(type);
  const packs = activities.map(packSummary);
  const categories = Array.from(new Set(packs.map((p) => p.category).filter((c) => c !== "variadas")));
  const difficulties = DIFFICULTIES.filter((d) => packs.some((p) => p.availability[d] === null));
  const itemCount = isPoolActivity(activities[0])
    ? new Set(activities.flatMap((a) => (isPoolActivity(a) ? a.conceptIds : []))).size
    : (BANKS[type as BankGameType] as unknown[]).length;
  return { type, cover: coverMedia(type), packs, categories, difficulties, itemCount };
}

export function getGameSummaries(): GameSummary[] {
  return GAME_TYPES.map(getGameSummary);
}
