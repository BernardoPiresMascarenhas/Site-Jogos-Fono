import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Blob } from "@/components/decor";
import { ConfigForm } from "@/components/config/config-form";
import { getGameSummary } from "@/content";
import { isCategoryId } from "@/content/categories";
import { isDifficulty, type GameType } from "@/content/types";
import { GAME_TYPE_META, GAME_TYPES } from "@/games/meta";
import { requireUser } from "@/lib/auth/dal";

function isGameType(value: string): value is GameType {
  return (GAME_TYPES as string[]).includes(value);
}

export async function generateMetadata({ params }: PageProps<"/jogos/[tipo]">): Promise<Metadata> {
  const { tipo } = await params;
  return { title: isGameType(tipo) ? `Configurar · ${GAME_TYPE_META[tipo].label}` : "Jogo", robots: { index: false } };
}

/** Tela "Configurar atividade": conteúdo, nível, opções do jogo e sons. */
export default async function ConfigPage({ params, searchParams }: PageProps<"/jogos/[tipo]">) {
  const { tipo } = await params;
  const user = await requireUser(`/jogos/${tipo}`);
  if (!isGameType(tipo)) notFound();

  const game = getGameSummary(tipo);
  const query = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  // Pacote inicial: o da URL (voltando do jogo), senão o da categoria filtrada, senão o primeiro.
  const bySlug = game.packs.find((p) => p.slug === first(query.pacote));
  const categoria = first(query.categoria);
  const byCategory = isCategoryId(categoria) ? game.packs.find((p) => p.category === categoria) : undefined;
  const pack = bySlug ?? byCategory ?? game.packs[0];
  const nivel = first(query.nivel);

  const initialOptions: Record<string, string> = {};
  for (const field of GAME_TYPE_META[tipo].options) {
    const v = first(query[field.key]);
    if (v && field.choices.some((c) => c.value === v)) initialOptions[field.key] = v;
  }

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <Blob className="-right-48 -top-24 h-[30rem] w-[30rem] opacity-70" color="#f5e9ee" />
      <AppHeader user={user} />
      <main className="relative mx-auto max-w-4xl px-5 pb-20 pt-6 sm:pt-10">
        <ConfigForm
          game={game}
          initialPack={pack.slug}
          initialDifficulty={isDifficulty(nivel) ? nivel : undefined}
          initialOptions={initialOptions}
        />
      </main>
    </div>
  );
}
