import type { Concept } from "@/content/types";

export function concepts(n: number): Concept[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `c${i}`,
    word: `Palavra ${i}`,
    article: "o",
    category: "animais",
    media: { kind: "emoji", emoji: "⭐", alt: `Palavra ${i}` },
  }));
}
