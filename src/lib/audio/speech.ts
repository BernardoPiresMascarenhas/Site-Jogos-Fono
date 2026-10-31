/**
 * Leitura em voz alta com SpeechSynthesis (pt-BR).
 * Nem todo dispositivo possui voz em português; a interface nunca depende só do áudio.
 */
export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function findPortugueseVoice(): SpeechSynthesisVoice | null {
  if (!speechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.toLowerCase() === "pt-br") ??
    voices.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith("pt-br")) ??
    voices.find((v) => v.lang.toLowerCase().startsWith("pt")) ??
    null
  );
}

let currentAudio: HTMLAudioElement | null = null;

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
  currentAudio?.pause();
  currentAudio = null;
}

/** Fala o texto. Se houver um arquivo de áudio gravado, ele tem prioridade. */
export function speak(text: string, audioSrc?: string): boolean {
  stopSpeaking();
  if (audioSrc) {
    try {
      currentAudio = new Audio(audioSrc);
      void currentAudio.play().catch(() => speak(text));
      return true;
    } catch {
      /* cai para a voz do navegador */
    }
  }
  if (!speechSupported()) return false;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 0.85;
  utterance.pitch = 1.05;
  const voice = findPortugueseVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
  return true;
}
