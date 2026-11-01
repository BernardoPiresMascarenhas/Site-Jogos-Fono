import type { Media } from "@/content/types";

/** Ilustrações da interface (geradas em /public/ilustracoes/ui-*.webp). */
export function uiIllustrationMedia(name: "trofeu" | "estrela" | "festa" | "brilho" | "coracao" | "balao", alt = ""): Media {
  return { kind: "image", src: `/ilustracoes/ui-${name}.webp`, alt, fallbackEmoji: "⭐" };
}
