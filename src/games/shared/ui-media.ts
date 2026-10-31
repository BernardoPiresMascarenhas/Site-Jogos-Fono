import type { Media } from "@/content/types";

/** Ilustrações da interface (geradas em /public/ilustracoes/ui-*.svg). */
export function uiIllustrationMedia(name: "trofeu" | "estrela" | "festa" | "brilho" | "coracao" | "balao", alt = ""): Media {
  return { kind: "svg", src: `/ilustracoes/ui-${name}.svg`, alt, fallbackEmoji: "⭐" };
}
