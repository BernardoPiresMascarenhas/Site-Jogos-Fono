import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { Blob } from "@/components/decor";
import { LibraryView } from "@/components/library/library-view";
import { getActivitySummaries } from "@/content";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Biblioteca de jogos", robots: { index: false } };

function greeting(name: string | null) {
  const first = name?.trim().split(/\s+/)[0];
  return first ? `Olá, ${first}!` : "Olá!";
}

export default async function LibraryPage() {
  const user = await requireUser("/biblioteca");
  const activities = getActivitySummaries();

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <Blob className="-right-48 -top-24 h-[30rem] w-[30rem] opacity-70" color="#f5e9ee" />
      <AppHeader user={user} />
      <main className="relative mx-auto max-w-6xl px-5 pb-20 pt-8 sm:pt-12">
        <p className="text-lg font-bold text-rose-700">{greeting(user.name)}</p>
        <h1 className="mt-1 font-display-soft text-4xl font-semibold tracking-tight sm:text-5xl">
          Vamos brincar e aprender?
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          Escolha uma atividade. Você pode ajustar o nível de dificuldade dentro de cada jogo.
        </p>
        <div className="mt-8">
          {activities.length > 0 ? (
            <LibraryView activities={activities} />
          ) : (
            <p className="rounded-3xl bg-white p-8 text-center text-ink-soft ring-1 ring-sand-200">
              Nenhuma atividade disponível no momento.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
