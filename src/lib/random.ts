/** Gerador pseudoaleatório determinístico (mulberry32), usado para que o
 * embaralhamento feito no servidor seja idêntico no navegador (sem "pulos" na tela). */
export type Rng = () => number;

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Semente aleatória nova (servidor ou navegador). */
export function randomSeed(): number {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0];
}

/** Embaralhamento Fisher–Yates. Não altera o array original. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Sorteia `count` itens distintos. */
export function sample<T>(items: readonly T[], count: number, rng: Rng): T[] {
  return shuffle(items, rng).slice(0, Math.min(count, items.length));
}

/** Embaralha garantindo que a ordem final seja diferente da referência (quando possível). */
export function shuffleDifferent<T>(items: readonly T[], reference: readonly T[], rng: Rng): T[] {
  if (items.length < 2) return items.slice();
  let out = shuffle(items, rng);
  for (let tries = 0; tries < 8 && out.every((v, i) => v === reference[i]); tries++) {
    out = shuffle(items, rng);
  }
  if (out.every((v, i) => v === reference[i])) out = [...out.slice(1), out[0]];
  return out;
}
