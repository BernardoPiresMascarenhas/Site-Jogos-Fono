/**
 * Sons curtos gerados no próprio navegador (Web Audio API) — sem arquivos externos.
 * Só tocam em resposta a uma ação da criança/profissional.
 */
let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx ??= new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, duration: number, volume: number, type: OscillatorType = "sine") {
  const ac = getContext();
  if (!ac) return;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export type SoundName = "select" | "success" | "error" | "complete" | "flip";

export function playSound(name: SoundName) {
  switch (name) {
    case "select":
      tone(660, 0, 0.12, 0.05);
      break;
    case "flip":
      tone(520, 0, 0.09, 0.04, "triangle");
      break;
    case "success":
      tone(659.25, 0, 0.18, 0.08);
      tone(987.77, 0.09, 0.28, 0.07);
      break;
    case "error":
      // Som grave e suave — nunca um "buzzer".
      tone(330, 0, 0.18, 0.05, "triangle");
      tone(294, 0.12, 0.22, 0.04, "triangle");
      break;
    case "complete":
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.35, 0.07));
      break;
  }
}
