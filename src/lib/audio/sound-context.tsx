"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { playSound, type SoundName } from "./sounds";
import { findPortugueseVoice, speak, speechSupported, stopSpeaking } from "./speech";

const STORAGE_KEY = "jogos-da-ana:som";

interface SoundContextValue {
  enabled: boolean;
  toggle: () => void;
  play: (name: SoundName) => void;
  /** "unknown" até o navegador carregar a lista de vozes. */
  voice: "available" | "no-portuguese" | "unsupported" | "unknown";
  say: (text: string, audioSrc?: string) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

function readPreference(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [voice, setVoice] = useState<SoundContextValue["voice"]>("unknown");

  useEffect(() => {
    // Preferência salva só neste navegador (nenhum dado pessoal).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com o armazenamento local após a hidratação
    setEnabled(readPreference());
    if (!speechSupported()) {
      setVoice("unsupported");
      return;
    }
    const update = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;
      setVoice(findPortugueseVoice() ? "available" : "no-portuguese");
    };
    update();
    window.speechSynthesis.addEventListener?.("voiceschanged", update);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", update);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      } catch {
        /* armazenamento indisponível: preferência vale só nesta visita */
      }
      if (!next) stopSpeaking();
      return next;
    });
  }, []);

  const play = useCallback(
    (name: SoundName) => {
      if (enabled) playSound(name);
    },
    [enabled],
  );

  const say = useCallback((text: string, audioSrc?: string) => {
    // A leitura é sempre um pedido explícito (botão "Ouvir"), por isso funciona
    // mesmo com os efeitos sonoros desligados.
    speak(text, audioSrc);
  }, []);

  const value = useMemo(() => ({ enabled, toggle, play, voice, say }), [enabled, toggle, play, voice, say]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound precisa estar dentro de SoundProvider");
  return ctx;
}
