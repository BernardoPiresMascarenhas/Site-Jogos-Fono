"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, SearchX } from "lucide-react";
import { CATEGORIES } from "@/content/categories";
import type { ActivitySummary, CategoryId, GameType } from "@/content/types";
import { GAME_TYPE_ICON } from "@/games/icons";
import { GAME_TYPE_META, GAME_TYPES } from "@/games/meta";
import { cn } from "@/lib/cn";
import { Button } from "../button";
import { ActivityCard } from "./activity-card";

export function LibraryView({ activities }: { activities: ActivitySummary[] }) {
  const [type, setType] = useState<GameType | "todos">("todos");
  const [category, setCategory] = useState<CategoryId | "todas">("todas");

  const availableCategories = useMemo(
    () => CATEGORIES.filter((c) => activities.some((a) => a.category === c.id)),
    [activities],
  );

  const filtered = activities.filter(
    (a) => (type === "todos" || a.type === type) && (category === "todas" || a.category === category),
  );

  const clear = () => {
    setType("todos");
    setCategory("todas");
  };

  return (
    <div>
      <div className="space-y-4 rounded-4xl bg-white/70 p-4 ring-1 ring-sand-200 sm:p-5">
        <FilterGroup label="Tipo de jogo">
          <Chip active={type === "todos"} onClick={() => setType("todos")}>
            <LayoutGrid className="h-4 w-4" aria-hidden />
            Todos
          </Chip>
          {GAME_TYPES.map((t) => {
            const Icon = GAME_TYPE_ICON[t];
            return (
              <Chip key={t} active={type === t} onClick={() => setType(t)}>
                <Icon className="h-4 w-4" aria-hidden />
                {GAME_TYPE_META[t].label}
              </Chip>
            );
          })}
        </FilterGroup>
        <FilterGroup label="Categoria">
          <Chip active={category === "todas"} onClick={() => setCategory("todas")}>
            Todas
          </Chip>
          {availableCategories.map((c) => (
            <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              {c.label}
            </Chip>
          ))}
        </FilterGroup>
      </div>

      <p className="mt-6 text-sm font-semibold text-ink-soft" aria-live="polite">
        {filtered.length === 1 ? "1 atividade" : `${filtered.length} atividades`}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-4xl border-2 border-dashed border-sand-300 px-6 py-16 text-center">
          <SearchX className="h-10 w-10 text-rose-400" aria-hidden />
          <p className="mt-4 text-lg font-extrabold">Nenhuma atividade com esses filtros</p>
          <p className="mt-1 text-ink-soft">Tente outra combinação de tipo e categoria.</p>
          <Button variant="soft" className="mt-6" onClick={clear}>
            Mostrar todas
          </Button>
        </div>
      ) : (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <li key={a.slug}>
              <ActivityCard activity={a} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-28 shrink-0 text-xs font-extrabold uppercase tracking-wider text-ink-faint">{label}</span>
      <div className="flex min-w-0 flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold transition sm:gap-2 sm:px-4",
        active
          ? "bg-ink text-white shadow-soft"
          : "bg-white text-ink-soft ring-1 ring-sand-300 hover:text-ink hover:ring-rose-300",
      )}
    >
      {children}
    </button>
  );
}
