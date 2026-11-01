"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Info, Play, Volume2, VolumeX } from "lucide-react";
import { ACCENTS } from "@/config/accents";
import { categoryLabel } from "@/content/categories";
import { DIFFICULTIES, DIFFICULTY_LABEL, type Difficulty, type GameSummary } from "@/content/types";
import { GAME_TYPE_ICON } from "@/games/icons";
import { GAME_TYPE_META, skillAreaLabel } from "@/games/meta";
import { useSound } from "@/lib/audio/sound-context";
import { cn } from "@/lib/cn";
import { buttonClasses } from "../button";
import { Media } from "../media";

/**
 * Configuração antes de jogar. Os campos mudam conforme o jogo:
 * conteúdo (se houver mais de um pacote), dificuldade, opções próprias e sons.
 * Combinações sem conteúdo suficiente ficam desabilitadas com a explicação.
 */
export function ConfigForm({
  game,
  initialPack,
  initialDifficulty,
  initialOptions,
}: {
  game: GameSummary;
  initialPack: string;
  initialDifficulty?: Difficulty;
  initialOptions: Record<string, string>;
}) {
  const meta = GAME_TYPE_META[game.type];
  const accent = ACCENTS[meta.accent];
  const Icon = GAME_TYPE_ICON[game.type];
  const [packSlug, setPackSlug] = useState(initialPack);
  const pack = game.packs.find((p) => p.slug === packSlug) ?? game.packs[0];
  const firstAvailable = (p = pack) => DIFFICULTIES.find((d) => p.availability[d] === null) ?? "facil";
  const [difficultyChoice, setDifficulty] = useState<Difficulty>(
    initialDifficulty && pack.availability[initialDifficulty] === null ? initialDifficulty : pack.availability[pack.difficulty] === null ? pack.difficulty : firstAvailable(),
  );
  const [optionChoices, setOptions] = useState<Record<string, string>>(initialOptions);
  const { enabled: soundOn, toggle: toggleSound } = useSound();

  // Valores efetivos: o que foi escolhido, se ainda for válido neste pacote.
  const difficulty = pack.availability[difficultyChoice] === null ? difficultyChoice : firstAvailable();
  const options = useMemo(() => {
    const out: Record<string, string> = {};
    for (const field of meta.options) {
      const chosen = optionChoices[field.key] ?? pack.defaultOptions?.[field.key] ?? field.default;
      out[field.key] = pack.disabledOptions?.[field.key]?.[chosen] ? field.default : chosen;
    }
    return out;
  }, [meta.options, optionChoices, pack]);

  const href = `/jogar/${pack.slug}?${new URLSearchParams({ nivel: difficulty, ...options }).toString()}`;
  const unavailable = DIFFICULTIES.filter((d) => pack.availability[d]);

  return (
    <div>
      <Link href="/biblioteca" className="inline-flex items-center gap-2 rounded-xl text-sm font-bold text-ink-soft transition hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Biblioteca de jogos
      </Link>

      <section className="mt-4 overflow-hidden rounded-[2.25rem] bg-white shadow-soft ring-1 ring-sand-200">
        <div className={cn("relative flex items-center gap-4 px-5 py-6 sm:gap-6 sm:px-8 sm:py-8", accent.soft)}>
          <span className="absolute -right-10 -top-12 h-40 w-40 rounded-full opacity-40" style={{ background: accent.hex }} aria-hidden="true" />
          <div className="relative flex shrink-0 -space-x-4" aria-hidden="true">
            {game.cover.slice(0, 2).map((m, i) => (
              <span key={i} className={cn("flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-soft ring-4 ring-white sm:h-20 sm:w-20", i === 0 ? "-rotate-6" : "rotate-6")}>
                <Media media={m} size={64} decorative className="h-[72%] w-[72%]" />
              </span>
            ))}
          </div>
          <div className="relative min-w-0">
            <p className={cn("flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider", accent.text)}>
              <Icon className="h-4 w-4" aria-hidden />
              Configurar atividade · {skillAreaLabel(meta.area)}
            </p>
            <h1 className="mt-1 font-display-soft text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{meta.label}</h1>
            <p className="mt-1 text-ink-soft">{meta.summary}</p>
          </div>
        </div>

        <div className="space-y-7 px-5 py-6 sm:px-8 sm:py-8">
          {game.packs.length > 1 && (
            <Field legend={game.type === "ligar" || game.type === "memoria" || game.type === "onde-esta" ? "Conteúdo" : "Categoria"}>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {game.packs.map((p) => (
                  <ChoiceCard
                    key={p.slug}
                    name="pacote"
                    checked={p.slug === pack.slug}
                    onChange={() => setPackSlug(p.slug)}
                    title={p.title}
                    detail={p.title === categoryLabel(p.category) ? `${p.itemCount} ${meta.itemNoun}` : `${categoryLabel(p.category)} · ${p.itemCount} ${meta.itemNoun}`}
                  />
                ))}
              </div>
            </Field>
          )}

          <Field legend="Dificuldade">
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-sand-100 p-1.5">
              {DIFFICULTIES.map((d) => {
                const reason = pack.availability[d];
                return (
                  <label
                    key={d}
                    title={reason ?? undefined}
                    className={cn(
                      "relative flex h-12 cursor-pointer items-center justify-center rounded-xl text-base font-bold transition has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-teal-600",
                      difficulty === d ? "bg-navy-600 text-white shadow-soft" : "text-ink-soft hover:bg-white",
                      reason && "cursor-not-allowed text-ink-faint line-through hover:bg-transparent",
                    )}
                  >
                    <input
                      type="radio"
                      name="nivel"
                      value={d}
                      checked={difficulty === d}
                      disabled={Boolean(reason)}
                      onChange={() => setDifficulty(d)}
                      className="sr-only"
                    />
                    {DIFFICULTY_LABEL[d]}
                  </label>
                );
              })}
            </div>
            {unavailable.length > 0 && (
              <ul className="mt-2 space-y-1">
                {unavailable.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-sm text-ink-soft">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-peach-600" aria-hidden />
                    <span>
                      <strong>{DIFFICULTY_LABEL[d]}:</strong> {pack.availability[d]}
                      {pack.category !== "variadas" && game.packs.some((p) => p.category === "variadas") ? " Experimente \"Variadas\"." : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Field>

          {meta.options.map((field) => (
            <Field key={field.key} legend={field.label} help={field.help}>
              <div className={cn("grid gap-2.5", field.choices.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
                {field.choices.map((c) => {
                  const reason = pack.disabledOptions?.[field.key]?.[c.value];
                  return (
                    <ChoiceCard
                      key={c.value}
                      name={field.key}
                      checked={options[field.key] === c.value}
                      onChange={() => setOptions((o) => ({ ...o, [field.key]: c.value }))}
                      title={c.label}
                      detail={reason ?? c.description}
                      disabled={Boolean(reason)}
                    />
                  );
                })}
              </div>
            </Field>
          ))}

          <Field legend="Sons do jogo">
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={soundOn}
              className={cn(
                "flex h-12 items-center gap-3 rounded-2xl px-4 font-bold ring-1 transition",
                soundOn ? "bg-sage-50 text-sage-800 ring-sage-300" : "bg-white text-ink-soft ring-sand-300",
              )}
            >
              {soundOn ? <Volume2 className="h-5 w-5" aria-hidden /> : <VolumeX className="h-5 w-5" aria-hidden />}
              {soundOn ? "Ativados" : "Desativados"}
              <span className="text-sm font-semibold text-ink-faint">· sons de acerto e de conclusão</span>
            </button>
          </Field>
        </div>

        <div className="flex flex-col items-stretch gap-3 border-t border-sand-200 bg-sand-50/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-sm text-ink-soft">
            {pack.title === "Variadas" || pack.title === categoryLabel(pack.category) ? categoryLabel(pack.category) : pack.title} · {DIFFICULTY_LABEL[difficulty]}
            {meta.options.map((f) => ` · ${f.choices.find((c) => c.value === options[f.key])?.label ?? ""}`).join("")}
          </p>
          <Link href={href} className={buttonClasses("primary", "xl")}>
            <Play className="h-6 w-6 fill-current" aria-hidden />
            Começar a jogar
          </Link>
        </div>
      </section>
    </div>
  );
}

function Field({ legend, help, children }: { legend: string; help?: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="text-sm font-extrabold uppercase tracking-wider text-ink-faint">{legend}</legend>
      {help && <p className="mt-1 text-sm text-ink-soft">{help}</p>}
      <div className="mt-2.5">{children}</div>
    </fieldset>
  );
}

function ChoiceCard({
  name,
  checked,
  onChange,
  title,
  detail,
  disabled,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  detail?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl px-4 py-3 ring-1 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal-600",
        checked ? "bg-teal-50 ring-2 ring-teal-600" : "bg-white ring-sand-300 hover:ring-teal-300",
        disabled && "cursor-not-allowed bg-sand-100 opacity-70 hover:ring-sand-300",
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} disabled={disabled} className="sr-only" />
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-2",
          checked ? "bg-teal-600 ring-teal-600" : "bg-white ring-sand-300",
        )}
        aria-hidden="true"
      >
        {checked && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
      <span className="min-w-0">
        <span className="block font-bold text-ink">{title}</span>
        {detail && <span className="block text-sm text-ink-soft">{detail}</span>}
      </span>
    </label>
  );
}
