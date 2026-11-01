import { CONCEPT_DATA, PICTURE_DATA, type ConceptData, type PictureData } from "./concept-data";
import type { Concept, Media, Picture } from "./types";

function toMedia(data: ConceptData): Media {
  const alt = data.word;
  if (data.image) {
    const isSvg = data.image.toLowerCase().endsWith(".svg");
    return { kind: isSvg ? "svg" : "image", src: data.image, alt, fallbackEmoji: data.emoji };
  }
  if (data.illustration) {
    return { kind: "image", src: `/ilustracoes/${data.id}.webp`, alt, fallbackEmoji: data.emoji };
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

function pictureMedia(data: PictureData): Media {
  const alt = data.label;
  if (data.image) {
    const isSvg = data.image.toLowerCase().endsWith(".svg");
    return { kind: isSvg ? "svg" : "image", src: data.image, alt, fallbackEmoji: data.emoji };
  }
  if (data.illustration) {
    return { kind: "image", src: `/ilustracoes/cena-${data.id}.webp`, alt, fallbackEmoji: data.emoji };
  }
  return { kind: "emoji", emoji: data.emoji, alt };
}

export const PICTURES: Picture[] = PICTURE_DATA.map((d) => ({ id: d.id, label: d.label, media: pictureMedia(d) }));

const pictureById = new Map(PICTURES.map((p) => [p.id, p]));

export function getPicture(id: string): Picture | undefined {
  return pictureById.get(id);
}
