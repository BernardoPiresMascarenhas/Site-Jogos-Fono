import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ACCENTS } from "@/config/accents";
import type { ActivitySummary } from "@/content/types";
import { GAME_TYPE_ICON } from "@/games/icons";
import { GAME_TYPE_META } from "@/games/meta";
import { cn } from "@/lib/cn";
import { DifficultyBadge } from "../difficulty-badge";
import { Media } from "../media";

export function ActivityCard({ activity }: { activity: ActivitySummary }) {
  const accent = ACCENTS[activity.accent];
  const Icon = GAME_TYPE_ICON[activity.type];
  const [first, second, third] = activity.cover;

  return (
    <Link
      href={`/jogar/${activity.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-4xl bg-white shadow-soft ring-1 ring-sand-200 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lift focus-visible:-translate-y-1"
    >
      <div className={cn("relative h-40 overflow-hidden sm:h-44", accent.soft)}>
        <CardPattern type={activity.type} color={accent.hex} />
        <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-ink shadow-soft">
          <Icon className={cn("h-3.5 w-3.5", accent.text)} aria-hidden />
          {GAME_TYPE_META[activity.type].shortLabel}
        </span>
        <div className="absolute inset-0 flex items-center justify-center gap-2 pt-6" aria-hidden="true">
          {second && (
            <span className="flex h-16 w-16 -rotate-12 items-center justify-center rounded-3xl bg-white/80 shadow-soft transition duration-500 ease-out group-hover:-translate-x-1 group-hover:-rotate-[16deg] sm:h-[4.5rem] sm:w-[4.5rem]">
              <Media media={second} size={44} decorative className="h-11 w-11" />
            </span>
          )}
          {first && (
            <span className="z-10 flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-white shadow-lift transition duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-105">
              <Media media={first} size={64} decorative className="h-16 w-16" />
            </span>
          )}
          {third && (
            <span className="flex h-16 w-16 rotate-12 items-center justify-center rounded-3xl bg-white/80 shadow-soft transition duration-500 ease-out group-hover:translate-x-1 group-hover:rotate-[16deg] sm:h-[4.5rem] sm:w-[4.5rem]">
              <Media media={third} size={44} decorative className="h-11 w-11" />
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-xl font-extrabold leading-snug text-ink">{activity.title}</h3>
        <p className="mt-1.5 flex-1 leading-relaxed text-ink-soft">{activity.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-sand-200 pt-4">
          <DifficultyBadge difficulty={activity.difficulty} />
          <span className="truncate text-sm text-ink-faint">{activity.meta}</span>
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition duration-300 group-hover:translate-x-0.5",
              accent.solid,
            )}
            aria-hidden="true"
          >
            <ArrowRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Desenho de fundo diferente para cada tipo de jogo. */
function CardPattern({ type, color }: { type: ActivitySummary["type"]; color: string }) {
  if (type === "ligar") {
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 170" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-10 140 C 60 40, 120 180, 190 80 S 290 20, 320 60" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray="2 14" opacity=".9" />
        <circle cx="262" cy="132" r="22" fill={color} opacity=".45" />
      </svg>
    );
  }
  if (type === "memoria") {
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect x="222" y="-14" width="70" height="92" rx="16" fill={color} opacity=".55" transform="rotate(14 257 32)" />
        <rect x="-18" y="104" width="70" height="92" rx="16" fill={color} opacity=".45" transform="rotate(-12 17 150)" />
      </svg>
    );
  }
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <circle cx="262" cy="34" r="30" fill="none" stroke={color} strokeWidth="9" opacity=".7" />
      <path d="M284 58 L302 76" stroke={color} strokeWidth="11" strokeLinecap="round" opacity=".7" />
      <circle cx="26" cy="148" r="34" fill={color} opacity=".4" />
    </svg>
  );
}
