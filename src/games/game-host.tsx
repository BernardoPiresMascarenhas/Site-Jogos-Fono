"use client";

import { useCallback, useState } from "react";
import type { Difficulty, ResolvedActivity } from "@/content/types";
import { randomSeed } from "@/lib/random";
import { GAME_COMPONENTS } from "./registry";

/**
 * Controla a partida: semente do embaralhamento e nível.
 * Reiniciar ou trocar o nível gera uma nova semente e recria o jogo do zero.
 */
export function GameHost({
  activity,
  initialSeed,
  initialDifficulty,
}: {
  activity: ResolvedActivity;
  initialSeed: number;
  initialDifficulty: Difficulty;
}) {
  const [seed, setSeed] = useState(initialSeed);
  const [difficulty, setDifficulty] = useState(initialDifficulty);

  const onRestart = useCallback(() => setSeed(randomSeed()), []);
  const onDifficultyChange = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setSeed(randomSeed());
    const url = new URL(window.location.href);
    url.searchParams.set("nivel", d);
    window.history.replaceState(null, "", url);
  }, []);

  const Game = GAME_COMPONENTS[activity.type];
  return (
    <Game
      key={`${seed}-${difficulty}`}
      activity={activity}
      seed={seed}
      controls={{ difficulty, onDifficultyChange, onRestart }}
    />
  );
}
