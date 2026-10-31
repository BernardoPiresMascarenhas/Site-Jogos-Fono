/**
 * Tipos do conteúdo das atividades.
 * O conteúdo (palavras, imagens, atividades) é totalmente separado das mecânicas
 * dos jogos: para criar atividades novas, basta adicionar dados.
 */

export type CategoryId =
  | "animais"
  | "alimentos"
  | "objetos"
  | "corpo"
  | "higiene"
  | "roupas"
  | "transportes";

export type Difficulty = "facil" | "medio" | "dificil";

/** Tipos de jogo disponíveis. Para um jogo novo, adicione aqui e no registro em src/games/registry.tsx. */
export type GameType = "ligar" | "memoria" | "onde-esta";

/**
 * Mídia de um conceito. Pode ser um emoji, uma imagem local (PNG/JPG/WebP)
 * ou um SVG local. `alt` é sempre obrigatório (descrição acessível).
 */
export type Media =
  | { kind: "emoji"; emoji: string; alt: string }
  | { kind: "image"; src: string; alt: string; fallbackEmoji?: string }
  | { kind: "svg"; src: string; alt: string; fallbackEmoji?: string };

export type Article = "o" | "a" | "os" | "as";

/** Um conceito é uma palavra + a imagem que a representa. */
export interface Concept {
  id: string;
  word: string;
  /** Artigo usado em frases como "Onde está o cachorro?". */
  article: Article;
  category: CategoryId;
  media: Media;
  /** Áudio opcional gravado (arquivo em /public). Se ausente, usa a voz do navegador. */
  audio?: string;
}

export type AccentKey = "rose" | "sage" | "butter" | "sky" | "peach" | "lilac";

interface ActivityBase {
  id: string;
  /** Usado na URL: /jogar/<slug> */
  slug: string;
  type: GameType;
  title: string;
  description: string;
  category: CategoryId;
  /** Dificuldade sugerida (pode ser alterada durante o jogo). */
  difficulty: Difficulty;
  /** Instrução curta exibida para a criança. */
  instruction: string;
  /** Conjunto de conceitos usados pela atividade (mínimo 6 para permitir o nível difícil). */
  conceptIds: string[];
  /** Cor de destaque do card e da tela do jogo. */
  accent: AccentKey;
  /** Conceitos exibidos na ilustração do card (opcional; padrão: os 3 primeiros). */
  coverConceptIds?: string[];
}

export interface LigarActivity extends ActivityBase {
  type: "ligar";
}

export type MemoryMode = "imagem-imagem" | "palavra-imagem";

export interface MemoriaActivity extends ActivityBase {
  type: "memoria";
  mode: MemoryMode;
}

/** Pergunta fixa opcional para o "Onde está?". */
export interface WhereQuestion {
  targetId: string;
  /** Texto personalizado. Padrão: "Onde está o/a <palavra>?" */
  prompt?: string;
  /** Alternativas erradas fixas. Se faltar alguma, o restante vem do conjunto da atividade. */
  distractorIds?: string[];
  /** Áudio gravado opcional da pergunta. */
  audio?: string;
}

export interface OndeEstaActivity extends ActivityBase {
  type: "onde-esta";
  /** Perguntas fixas. Se ausente, as perguntas são sorteadas do conjunto. */
  questions?: WhereQuestion[];
  /** Quantas perguntas por partida (padrão em siteConfig). */
  questionsPerRound?: number;
}

export type Activity = LigarActivity | MemoriaActivity | OndeEstaActivity;

/** Versão "resolvida" enviada ao navegador: conceitos já carregados. */
export type ResolvedActivity<A extends Activity = Activity> = A extends Activity
  ? Omit<A, "conceptIds"> & ResolvedExtras
  : never;

interface ResolvedExtras {
  /** Conceitos do conjunto da atividade. */
  items: Concept[];
  /** Conceitos usados só em perguntas fixas (ex.: alternativas de outra categoria). */
  extras: Concept[];
}

/** Resumo usado nos cards da biblioteca. */
export interface ActivitySummary {
  slug: string;
  type: GameType;
  title: string;
  description: string;
  category: CategoryId;
  difficulty: Difficulty;
  accent: AccentKey;
  cover: Media[];
  itemCount: number;
  meta: string;
}

export const DIFFICULTY_SIZE: Record<Difficulty, number> = {
  facil: 3,
  medio: 4,
  dificil: 6,
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};

export const DIFFICULTIES: Difficulty[] = ["facil", "medio", "dificil"];

export function isDifficulty(value: unknown): value is Difficulty {
  return value === "facil" || value === "medio" || value === "dificil";
}
