"use client";

import { useEffect, useRef } from "react";
import { useSound } from "@/lib/audio/sound-context";
import { missMessage, successMessage, useFeedback } from "./use-feedback";

/**
 * Sons e mensagens comuns aos jogos novos:
 *  - acerto: som de sucesso (a mensagem fica na barra de ações);
 *  - erro: som suave + mensagem gentil;
 *  - fim: som de conclusão.
 * Cada evento é disparado uma única vez (sem repetir em novas renderizações).
 */
export function useRoundFeedback({
  solvedKey,
  missNonce,
  done,
  missText,
}: {
  /** Muda a cada acerto (ex.: `${index}:${solvedId}`), null quando não resolvido. */
  solvedKey: string | null;
  missNonce: number;
  done: boolean;
  /** Mensagem de erro personalizada (padrão: frases gentis variadas). */
  missText?: string;
}) {
  const { feedback, show } = useFeedback(1700);
  const { play } = useSound();
  const lastMiss = useRef(missNonce);

  useEffect(() => {
    if (solvedKey) play("success");
  }, [solvedKey, play]);

  useEffect(() => {
    if (missNonce === lastMiss.current) return;
    lastMiss.current = missNonce;
    play("error");
    show("miss", missText ?? missMessage(missNonce));
  }, [missNonce, missText, play, show]);

  useEffect(() => {
    if (done) play("complete");
  }, [done, play]);

  return { feedback, show, successText: (n: number) => successMessage(n) };
}
