"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, LayoutGrid, SearchX, SlidersHorizontal } from "lucide-react";
import { CATEGORIES } from "@/content/categories";
import type { CategoryId, GameSummary, SkillArea } from "@/content/types";
import { GAME_TYPE_META, SKILL_AREAS } from "@/games/meta";
import { cn } from "@/lib/cn";
import { Button } from "../button";
import { GameCard } from "./game-card";

export function LibraryView({ games }: { games: GameSummary[] }) {
  const [area, setArea] = useState<SkillArea | "todos">("todos");
  const [category, setCategory] = useState<CategoryId | "todas">("todas");
  const [open, setOpen] = useState(false);

  const availableCategories = useMemo(
    () =>
      CATEGORIES.filter((c) =>
        c.id === "variadas" ? games.some((g) => g.packs.some((p) => p.category === "variadas")) : games.some((g) => g.categories.includes(c.id)),
      ),
    [games],
  );

  const matchesCategory = (g: GameSummary) =>
    category === "todas" || (category === "variadas" ? g.packs.some((p) => p.category === "variadas") : g.categories.includes(category));
  const filtered = games.filter((g) => (area === "todos" || GAME_TYPE_META[g.type].area === area) && matchesCategory(g));
  const activeCount = (area !== "todos" ? 1 : 0) + (category !== "todas" ? 1 : 0);

  const clear = () => {
    setArea("todos");
    setCategory("todas");
  };

  const filters = (
    <div className="space-y-4">
      <FilterGroup label="Tipos">
        <Chip active={area === "todos"} onClick={() => setArea("todos")}>
          <LayoutGrid className="h-4 w-4" aria-hidden />
          Todos
        </Chip>
        {SKILL_AREAS.map((a) => (
          <Chip key={a.id} active={area === a.id} onClick={() => setArea(a.id)}>
            {a.label}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="Categorias">
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
  );

  return (
    <div>
      {/* Celular: filtros recolhíveis */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="filtros-biblioteca"
          className="flex h-12 w-full items-center justify-between rounded-2xl bg-white/80 px-4 font-bold text-ink ring-1 ring-sand-200"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-teal-600" aria-hidden />
            Filtros
            {activeCount > 0 && <span className="rounded-full bg-navy-600 px-2 py-0.5 text-xs text-white">{activeCount}</span>}
          </span>
          <ChevronDown className={cn("h-5 w-5 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id="filtros-biblioteca"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-3xl bg-white/70 p-4 ring-1 ring-sand-200">{filters}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tablet e computador: sempre visíveis */}
      <div className="hidden rounded-4xl bg-white/70 p-5 ring-1 ring-sand-200 md:block">{filters}</div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-soft" aria-live="polite">
          {filtered.length === 1 ? "1 jogo" : `${filtered.length} jogos`}
        </p>
        {activeCount > 0 && (
          <button type="button" onClick={clear} className="text-sm font-bold text-teal-700 underline-offset-4 hover:underline">
            Limpar filtros
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-4xl border-2 border-dashed border-sand-300 px-6 py-16 text-center">
          <SearchX className="h-10 w-10 text-coral-500" aria-hidden />
          <p className="mt-4 text-lg font-extrabold">Nenhum jogo com esses filtros</p>
          <p className="mt-1 text-ink-soft">Tente outra combinação de tipo e categoria.</p>
          <Button variant="soft" className="mt-6" onClick={clear}>
            Mostrar todos
          </Button>
        </div>
      ) : (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((g) => (
            <li key={g.type}>
              <GameCard game={g} category={category === "todas" ? null : category} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2 md:flex-row md:items-start md:gap-4">
      <span className="w-24 shrink-0 text-xs font-extrabold uppercase tracking-wider text-ink-faint md:pt-3.5">{label}</span>
      <div className="flex min-w-0 flex-wrap gap-2">{children}</div>
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
        active ? "bg-navy-600 text-white shadow-soft" : "bg-white text-ink-soft ring-1 ring-sand-300 hover:text-ink hover:ring-teal-300",
      )}
    >
      {children}
    </button>
  );
}
