import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { activityAvailability, getActivityBySlug, resolveActivity } from "@/content";
import { DIFFICULTIES, isDifficulty } from "@/content/types";
import { GameHost } from "@/games/game-host";
import { GAME_TYPE_META, parseGameOptions } from "@/games/meta";
import { requireUser } from "@/lib/auth/dal";
import { randomSeed } from "@/lib/random";
import { getGameSummary } from "@/content";

export async function generateMetadata({ params }: PageProps<"/jogar/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const activity = getActivityBySlug(slug);
  if (!activity) return { title: "Atividade", robots: { index: false } };
  const label = GAME_TYPE_META[activity.type].label;
  const title = activity.title === label ? label : `${label} · ${activity.title}`;
  return { title, robots: { index: false } };
}

export default async function PlayPage({ params, searchParams }: PageProps<"/jogar/[slug]">) {
  const { slug } = await params;
  await requireUser(`/jogar/${slug}`);

  const activity = getActivityBySlug(slug);
  if (!activity) notFound();

  const query = await searchParams;
  const availability = activityAvailability(activity);
  const requested = isDifficulty(query.nivel) ? query.nivel : activity.difficulty;
  // Nível sem conteúdo suficiente neste pacote: usa o primeiro disponível.
  const difficulty = availability[requested] === null ? requested : (DIFFICULTIES.find((d) => availability[d] === null) ?? requested);

  const pack = getGameSummary(activity.type).packs.find((p) => p.slug === activity.slug);
  const options = parseGameOptions(activity.type, query, pack?.defaultOptions);
  // Opção indisponível neste pacote (ex.: áudio sem gravações): volta ao padrão do jogo.
  for (const field of GAME_TYPE_META[activity.type].options) {
    if (pack?.disabledOptions?.[field.key]?.[options[field.key]]) options[field.key] = field.default;
  }

  return (
    <GameHost
      activity={resolveActivity(activity)}
      initialSeed={randomSeed()}
      initialDifficulty={difficulty}
      options={options}
      availability={availability}
    />
  );
}
