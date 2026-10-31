import { siteConfig } from "@/config/site";

/** Classe aplicada às palavras dentro dos jogos (letra bastão por padrão). */
export const gameTextClass = siteConfig.gameTextCase === "upper" ? "uppercase tracking-wide" : "";
