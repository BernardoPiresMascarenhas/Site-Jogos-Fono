"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Feedback {
  kind: "success" | "miss";
  message: string;
  id: number;
}

/** Mensagem curta de feedback que some sozinha. */
export function useFeedback(duration = 1800) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counter = useRef(0);

  const show = useCallback(
    (kind: Feedback["kind"], message: string) => {
      if (timer.current) clearTimeout(timer.current);
      counter.current += 1;
      setFeedback({ kind, message, id: counter.current });
      timer.current = setTimeout(() => setFeedback(null), duration);
    },
    [duration],
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return { feedback, show };
}

const SUCCESS = ["Muito bem!", "Isso mesmo!", "Acertou!", "Que legal!", "Mandou bem!"];
const MISS = ["Quase! Tente de novo.", "Vamos tentar outra vez?", "Ops! Tente outra."];

export function successMessage(n: number) {
  return SUCCESS[n % SUCCESS.length];
}
export function missMessage(n: number) {
  return MISS[n % MISS.length];
}
