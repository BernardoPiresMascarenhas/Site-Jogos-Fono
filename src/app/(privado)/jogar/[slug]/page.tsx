import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActivityBySlug, resolveActivity } from "@/content";
import { isDifficulty } from "@/content/types";
import { GameHost } from "@/games/game-host";
import { requireUser } from "@/lib/auth/dal";
import { randomSeed } from "@/lib/random";

export async function generateMetadata({ params }: PageProps<"/jogar/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const activity = getActivityBySlug(slug);
  return { title: activity?.title ?? "Atividade", robots: { index: false } };
}

export default async function PlayPage({ params, searchParams }: PageProps<"/jogar/[slug]">) {
  const { slug } = await params;
  await requireUser(`/jogar/${slug}`);

  const activity = getActivityBySlug(slug);
  if (!activity) notFound();

  const { nivel } = await searchParams;
  const difficulty = isDifficulty(nivel) ? nivel : activity.difficulty;

  return <GameHost activity={resolveActivity(activity)} initialSeed={randomSeed()} initialDifficulty={difficulty} />;
}
