import { CONCEPT_DATA, type ConceptData } from "./concept-data";
import type { Concept, Media } from "./types";

function toMedia(data: ConceptData): Media {
  const alt = data.word;
  if (data.image) {
    const isSvg = data.image.toLowerCase().endsWith(".svg");
    return { kind: isSvg ? "svg" : "image", src: data.image, alt, fallbackEmoji: data.emoji };
  }
  if (data.illustration) {
    return { kind: "svg", src: `/ilustracoes/${data.id}.svg`, alt, fallbackEmoji: data.emoji };
  }
  return { kind: "emoji", emoji: data.emoji, alt };
}

export const CONCEPTS: Concept[] = CONCEPT_DATA.map((d) => ({
  id: d.id,
  word: d.word,
  article: d.article,
  category: d.category,
  media: toMedia(d),
  ...(d.audio ? { audio: d.audio } : {}),
}));

const byId = new Map(CONCEPTS.map((c) => [c.id, c]));

export function getConcept(id: string): Concept | undefined {
  return byId.get(id);
}

