import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ACCENTS } from "@/config/accents";
import { DIFFICULTIES, DIFFICULTY_LABEL, type CategoryId, type GameSummary } from "@/content/types";
import { GAME_TYPE_ICON } from "@/games/icons";
import { GAME_TYPE_META, skillAreaLabel } from "@/games/meta";
import { cn } from "@/lib/cn";
import { Media } from "../media";

/** Card de um tipo de jogo na biblioteca. */
export function GameCard({ game, category }: { game: GameSummary; category: CategoryId | null }) {
  const meta = GAME_TYPE_META[game.type];
  const accent = ACCENTS[meta.accent];
  const Icon = GAME_TYPE_ICON[game.type];
  const [first, second, third] = game.cover;
  const href = category ? `/jogos/${game.type}?categoria=${category}` : `/jogos/${game.type}`;
  const contentLine =
    game.categories.length > 1
      ? `${game.itemCount} ${meta.itemNoun} · ${game.categories.length} categorias`
      : `${game.itemCount} ${meta.itemNoun}`;

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-4xl bg-white shadow-soft ring-1 ring-sand-200 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lift focus-visible:-translate-y-1"
    >
      <div className={cn("relative h-36 overflow-hidden sm:h-40", accent.soft)}>
        <span className="absolute -right-6 -top-8 h-28 w-28 rounded-full opacity-50" style={{ background: accent.hex }} aria-hidden="true" />
        <span className="absolute -bottom-10 -left-4 h-24 w-24 rounded-full opacity-35" style={{ background: accent.hex }} aria-hidden="true" />
        <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-ink shadow-soft">
          <Icon className={cn("h-3.5 w-3.5", accent.text)} aria-hidden />
          {skillAreaLabel(meta.area)}
        </span>
        <div className="absolute inset-0 flex items-center justify-center gap-2 pt-6" aria-hidden="true">
          {second && (
            <span className="flex h-14 w-14 -rotate-12 items-center justify-center rounded-3xl bg-white/80 shadow-soft transition duration-500 ease-out group-hover:-translate-x-1 group-hover:-rotate-[16deg] sm:h-16 sm:w-16">
              <Media media={second} size={44} decorative className="h-10 w-10" />
            </span>
          )}
          {first && (
            <span className="z-10 flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-white shadow-lift transition duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-105 sm:h-[5.5rem] sm:w-[5.5rem]">
              <Media media={first} size={64} decorative className="h-14 w-14" />
            </span>
          )}
          {third && (
            <span className="flex h-14 w-14 rotate-12 items-center justify-center rounded-3xl bg-white/80 shadow-soft transition duration-500 ease-out group-hover:translate-x-1 group-hover:rotate-[16deg] sm:h-16 sm:w-16">
              <Media media={third} size={44} decorative className="h-10 w-10" />
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-xl font-extrabold leading-snug text-ink">{meta.label}</h3>
        <p className="mt-1.5 leading-relaxed text-ink-soft">{meta.summary}</p>
        <p className="mt-3 text-sm text-ink-soft">
          <span className="font-bold text-ink">Habilidade:</span> {meta.skill}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="min-w-0">
            <ul className="flex flex-wrap gap-1" aria-label="Níveis disponíveis">
              {DIFFICULTIES.map((d) => {
                const ok = game.difficulties.includes(d);
                return (
                  <li
                    key={d}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-bold",
                      ok ? "bg-sand-100 text-ink-soft ring-1 ring-sand-300" : "text-ink-faint line-through",
                    )}
                  >
                    {DIFFICULTY_LABEL[d]}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 truncate text-sm text-ink-faint">{contentLine}</p>
          </div>
          <span
            className={cn(
              "flex h-11 shrink-0 items-center gap-1.5 rounded-full pl-4 pr-3 font-bold text-white transition duration-300 group-hover:gap-2.5",
              accent.solid,
            )}
            aria-hidden="true"
          >
            Jogar
            <ArrowRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
