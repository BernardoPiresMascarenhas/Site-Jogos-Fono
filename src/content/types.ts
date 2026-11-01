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
  | "transportes"
  | "natureza"
  | "profissoes"
  | "rotina"
  | "historias"
  /** Mistura de categorias (pacotes "Variadas" gerados automaticamente ou conteúdos sem categoria única). */
  | "variadas";

export type Difficulty = "facil" | "medio" | "dificil";

/**
 * Tipos de jogo disponíveis. Para um jogo novo, adicione aqui, em src/games/meta.ts,
 * src/games/icons.tsx, src/games/registry.tsx e src/content/index.ts (ver README).
 */
export type GameType =
  | "ligar"
  | "memoria"
  | "onde-esta"
  | "intruso"
  | "quem-sou-eu"
  | "siga-comando"
  | "ordem"
  | "monte-frase"
  | "silabas"
  | "rima"
  | "som-inicial"
  | "escute"
  | "desapareceu";

/** Áreas usadas no filtro "Tipos" da biblioteca. */
export type SkillArea = "linguagem" | "fonologica" | "compreensao" | "memoria" | "sequencias";

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
  /**
   * Áudio gravado opcional (arquivo em /public, ex.: "/audios/palavras/faca.mp3").
   * Sem ele, a leitura usa a voz do navegador — exceto no "Escute e escolha",
   * que só toca gravações (ver README).
   */
  audio?: string;
}

/** Figura de cena (ex.: "Acordar"), usada em sequências e frases. Não é uma palavra do acervo. */
export interface Picture {
  id: string;
  label: string;
  media: Media;
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
  /** Dificuldade sugerida (pode ser alterada antes e durante o jogo). */
  difficulty: Difficulty;
  /** Instrução curta exibida para a criança. */
  instruction: string;
  /** Cor de destaque da tela do jogo. */
  accent: AccentKey;
  /** Conceitos exibidos na ilustração (opcional). */
  coverConceptIds?: string[];
}

/* ------------------------------------------------------------------ */
/* Jogos com conjunto de palavras (os três primeiros)                  */
/* ------------------------------------------------------------------ */

interface PoolActivityBase extends ActivityBase {
  /** Conjunto de conceitos usados pela atividade (mínimo 6 para permitir o nível difícil). */
  conceptIds: string[];
}

export interface LigarActivity extends PoolActivityBase {
  type: "ligar";
}

export type MemoryMode = "imagem-imagem" | "palavra-imagem";

export interface MemoriaActivity extends PoolActivityBase {
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

export interface OndeEstaActivity extends PoolActivityBase {
  type: "onde-esta";
  /** Perguntas fixas. Se ausente, as perguntas são sorteadas do conjunto. */
  questions?: WhereQuestion[];
  /** Quantas perguntas por partida (padrão em siteConfig). */
  questionsPerRound?: number;
}

export type PoolActivity = LigarActivity | MemoriaActivity | OndeEstaActivity;

/* ------------------------------------------------------------------ */
/* Jogos com banco de questões (jogos 4 a 13)                         */
/* ------------------------------------------------------------------ */

/** Campos comuns a todo item de banco. */
export interface BankItemBase {
  /** Identificador único dentro do jogo. */
  id: string;
  /** Níveis em que o item pode aparecer (padrão: todos). */
  levels?: Difficulty[];
  /** Observação para a revisão profissional (não aparece para a criança). */
  reviewNote?: string;
}

/** Jogo 4 — Qual é o intruso? */
export interface IntrusoQuestion extends BankItemBase {
  category: CategoryId;
  /** Membros do grupo (pelo menos 5, para permitir 6 imagens no nível difícil). */
  groupIds: string[];
  /** A imagem que não pertence ao grupo. */
  intruderId: string;
  /** Explicação exibida após o acerto. Escrita previamente. */
  explanation: string;
  prompt?: string;
}

/** Jogo 5 — Quem sou eu? */
export interface RiddleQuestion extends BankItemBase {
  category: CategoryId;
  answerId: string;
  /** Pistas da mais geral para a mais específica. Nunca contêm a palavra-resposta. */
  clues: string[];
  /**
   * Alternativas erradas (pelo menos 5). Nenhuma delas pode combinar com TODAS as pistas.
   */
  distractorIds: string[];
}

/** Jogo 6 — Siga o comando */
export type Relation = "em-cima" | "embaixo" | "dentro" | "ao-lado";
export type ScenePosition = { at: "chao" } | { at: string; relation: Relation };

export interface CommandGoal {
  objectId: string;
  /** Marco de referência (ex.: "cadeira"). */
  landmarkId: string;
  /** "fora" = qualquer lugar, desde que não esteja dentro do marco. */
  relation: Relation | "fora";
}

export interface CommandQuestion extends BankItemBase {
  category: CategoryId;
  /** Texto do comando, exatamente como lido para a criança. */
  text: string;
  /** Marcos fixos da cena (ex.: cadeira, caixa, cama). */
  landmarkIds: string[];
  /** Objetos que podem ser movidos e onde começam. */
  objects: { id: string; start: ScenePosition }[];
  goals: CommandGoal[];
  /** Quando true, as metas precisam ser cumpridas na ordem em que aparecem (antes/depois). */
  ordered?: boolean;
}

/** Jogo 7 — Coloque na ordem certa */
export interface SequenceQuestion extends BankItemBase {
  category: CategoryId;
  title: string;
  /** Ids de figuras (PICTURE_DATA) na ordem correta. */
  steps: string[];
  /** Pequena descrição exibida ao final. */
  description: string;
}

/** Jogo 8 — Monte a frase */
export interface SentenceToken {
  text: string;
  /** Imagem opcional (id de conceito ou de figura) usada no modo "com imagens". */
  imageId?: string;
}

export interface SentenceQuestion extends BankItemBase {
  category: CategoryId;
  /** Peças na ordem principal. */
  tokens: SentenceToken[];
  /**
   * Outras ordens aceitas (cada uma é a frase completa, separada por espaços).
   * A ordem principal é sempre aceita.
   */
  alternatives?: string[];
  /** Imagens que contextualizam a cena (deixam a ordem esperada inequívoca). */
  sceneIds?: string[];
}

/** Jogo 9 — Quantas sílabas? */
export interface SyllableItem extends BankItemBase {
  conceptId: string;
  /** Separação silábica revisada (português brasileiro). */
  syllables: string[];
  /** Deve ser igual a syllables.length (conferido pelos testes). */
  syllableCount: number;
}

/** Jogo 10 — Qual palavra rima? */
export interface RhymeQuestion extends BankItemBase {
  targetId: string;
  /** Palavras que rimam com o alvo (qualquer uma é aceita se aparecer). */
  correctIds: string[];
  /** Palavras que NÃO rimam com o alvo (pelo menos 5). */
  distractorIds: string[];
}

/** Jogo 11 — Caça ao som inicial */
export interface InitialSoundSet extends BankItemBase {
  /** Fonema-alvo em notação simples, ex.: "/p/". */
  phoneme: string;
  /** Exemplo exibido junto do som (não aparece entre as figuras). */
  exampleId: string;
  /** Palavras que começam com o fonema (pelo menos 4). */
  targetIds: string[];
  /** Palavras que não começam com o fonema (pelo menos 5). */
  distractorIds: string[];
  /** Distratores com som próximo (usados preferencialmente no nível difícil). */
  nearIds?: string[];
}

/** Jogo 12 — Escute e escolha */
export interface ListenGroup extends BankItemBase {
  /** Palavras que formam pares mínimos entre si (2 ou 3). */
  wordIds: string[];
  /** Contraste trabalhado, ex.: "/f/ × /v/". */
  contrast: string;
}

/** Jogo 13 — O que desapareceu? */
export interface DisappearItem extends BankItemBase {
  conceptId: string;
}

export interface BankActivityMap {
  intruso: IntrusoQuestion;
  "quem-sou-eu": RiddleQuestion;
  "siga-comando": CommandQuestion;
  ordem: SequenceQuestion;
  "monte-frase": SentenceQuestion;
  silabas: SyllableItem;
  rima: RhymeQuestion;
  "som-inicial": InitialSoundSet;
  escute: ListenGroup;
  desapareceu: DisappearItem;
}

export type BankGameType = keyof BankActivityMap;

export type BankActivity<T extends BankGameType = BankGameType> = T extends BankGameType
  ? ActivityBase & { type: T; items: BankActivityMap[T][] }
  : never;

export type IntrusoActivity = BankActivity<"intruso">;
export type QuemSouEuActivity = BankActivity<"quem-sou-eu">;
export type SigaComandoActivity = BankActivity<"siga-comando">;
export type OrdemActivity = BankActivity<"ordem">;
export type MonteFraseActivity = BankActivity<"monte-frase">;
export type SilabasActivity = BankActivity<"silabas">;
export type RimaActivity = BankActivity<"rima">;
export type SomInicialActivity = BankActivity<"som-inicial">;
export type EscuteActivity = BankActivity<"escute">;
export type DesapareceuActivity = BankActivity<"desapareceu">;

export type Activity = PoolActivity | BankActivity;

/** Versão "resolvida" enviada ao navegador: conceitos e figuras já carregados. */
export type ResolvedActivity<A extends Activity = Activity> = A extends PoolActivity
  ? Omit<A, "conceptIds"> & PoolResolvedExtras
  : A extends BankActivity
    ? A & BankResolvedExtras
    : never;

interface PoolResolvedExtras {
  /** Conceitos do conjunto da atividade. */
  items: Concept[];
  /** Conceitos usados só em perguntas fixas (ex.: alternativas de outra categoria). */
  extras: Concept[];
}

interface BankResolvedExtras {
  /** Todos os conceitos citados pelos itens, por id. */
  lexicon: Record<string, Concept>;
  /** Todas as figuras de cena citadas pelos itens, por id. */
  pictures: Record<string, Picture>;
}

/* ------------------------------------------------------------------ */
/* Biblioteca e configuração                                           */
/* ------------------------------------------------------------------ */

/** Motivo pelo qual um nível está indisponível (null = disponível). */
export type Availability = Record<Difficulty, string | null>;

/** Um pacote de conteúdo de um jogo (ex.: "Animais"), como aparece na configuração. */
export interface PackSummary {
  slug: string;
  title: string;
  category: CategoryId;
  difficulty: Difficulty;
  itemCount: number;
  availability: Availability;
  /** Opções de jogo indisponíveis neste pacote: campo → valor → motivo. */
  disabledOptions?: Record<string, Record<string, string>>;
  /** Valores padrão de opções definidos pelo pacote (ex.: modo do jogo da memória). */
  defaultOptions?: Record<string, string>;
}

/** Card de um tipo de jogo na biblioteca. */
export interface GameSummary {
  type: GameType;
  cover: Media[];
  packs: PackSummary[];
  /** Categorias (exceto "variadas") com pacote próprio. */
  categories: CategoryId[];
  /** Níveis disponíveis em pelo menos um pacote. */
  difficulties: Difficulty[];
  /** Total de desafios/palavras distintos do jogo. */
  itemCount: number;
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

export function isPoolActivity(a: Activity): a is PoolActivity {
  return a.type === "ligar" || a.type === "memoria" || a.type === "onde-esta";
}
