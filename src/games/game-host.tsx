"use client";

import { useCallback, useMemo, useState } from "react";
import type { Availability, Difficulty, ResolvedActivity } from "@/content/types";
import { randomSeed } from "@/lib/random";
import { GAME_COMPONENTS } from "./registry";

/**
 * Controla a partida: semente do embaralhamento, nível e opções.
 * Reiniciar ou trocar o nível gera uma nova semente e recria o jogo do zero
 * (o `key` muda), então nenhum estado da partida anterior sobra.
 */
export function GameHost({
  activity,
  initialSeed,
  initialDifficulty,
  options,
  availability,
}: {
  activity: ResolvedActivity;
  initialSeed: number;
  initialDifficulty: Difficulty;
  options: Record<string, string>;
  availability?: Availability;
}) {
  const [seed, setSeed] = useState(initialSeed);
  const [difficulty, setDifficulty] = useState(initialDifficulty);

  const onRestart = useCallback(() => setSeed(randomSeed()), []);
  const onDifficultyChange = useCallback(
    (d: Difficulty) => {
      if (availability?.[d]) return;
      setDifficulty(d);
      setSeed(randomSeed());
      const url = new URL(window.location.href);
      url.searchParams.set("nivel", d);
      window.history.replaceState(null, "", url);
    },
    [availability],
  );

  const settingsHref = useMemo(() => {
    const params = new URLSearchParams({ pacote: activity.slug, nivel: difficulty, ...options });
    return `/jogos/${activity.type}?${params.toString()}`;
  }, [activity.slug, activity.type, difficulty, options]);

  const Game = GAME_COMPONENTS[activity.type];
  return (
    <Game
      key={`${seed}-${difficulty}`}
      activity={activity}
      seed={seed}
      options={options}
      controls={{ difficulty, onDifficultyChange, onRestart, availability, settingsHref }}
    />
  );
}
