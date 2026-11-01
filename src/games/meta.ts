import type { AccentKey, GameType, SkillArea } from "@/content/types";

/** Uma opção específica de um jogo, exibida na tela "Configurar atividade". */
export interface GameOptionField {
  /** Nome do parâmetro na URL (ex.: ?modo=palavras). */
  key: string;
  label: string;
  help?: string;
  choices: { value: string; label: string; description?: string }[];
  default: string;
}

export interface GameTypeMeta {
  label: string;
  shortLabel: string;
  /** Substantivo usado na contagem de conteúdo ("12 desafios"). */
  itemNoun: string;
  /** Descrição curta do card. */
  summary: string;
  /** Habilidade ou objetivo trabalhado. */
  skill: string;
  area: SkillArea;
  accent: AccentKey;
  /** Base do slug dos pacotes gerados automaticamente (jogos com banco de questões). */
  slugBase: string;
  /** Instrução padrão exibida para a criança. */
  instruction: string;
  /** Opções além de conteúdo, dificuldade e sons. */
  options: GameOptionField[];
}

/** Metadados de exibição de cada tipo de jogo (sem dependências de React). */
export const GAME_TYPE_META: Record<GameType, GameTypeMeta> = {
  ligar: {
    label: "Ligue as imagens",
    shortLabel: "Ligar",
    itemNoun: "palavras",
    summary: "Toque na palavra e depois na imagem que combina com ela.",
    skill: "Associação entre palavra e imagem",
    area: "linguagem",
    accent: "sage",
    slugBase: "ligue",
    instruction: "Toque na palavra e depois na imagem certa.",
    options: [],
  },
  memoria: {
    label: "Jogo da memória",
    shortLabel: "Memória",
    itemNoun: "figuras",
    summary: "Cartas que giram de verdade para encontrar os pares.",
    skill: "Memória visual e atenção",
    area: "memoria",
    accent: "rose",
    slugBase: "memoria",
    instruction: "Vire duas cartas e encontre os pares.",
    options: [
      {
        key: "modo",
        label: "Modo",
        choices: [
          { value: "imagem-imagem", label: "Imagem e imagem", description: "Pares de figuras iguais" },
          { value: "palavra-imagem", label: "Palavra e imagem", description: "Uma carta com a palavra, outra com a figura" },
        ],
        default: "imagem-imagem",
      },
    ],
  },
  "onde-esta": {
    label: "Onde está?",
    shortLabel: "Onde está?",
    itemNoun: "imagens",
    summary: "Ouça a pergunta e encontre a imagem certa.",
    skill: "Compreensão de palavras e vocabulário receptivo",
    area: "compreensao",
    accent: "butter",
    slugBase: "onde-esta",
    instruction: "Encontre a imagem certa.",
    options: [],
  },
  intruso: {
    label: "Qual é o intruso?",
    shortLabel: "Intruso",
    itemNoun: "desafios",
    summary: "Descubra a imagem que não pertence ao grupo.",
    skill: "Categorização e vocabulário",
    area: "linguagem",
    accent: "lilac",
    slugBase: "qual-e-o-intruso",
    instruction: "Qual destas imagens não pertence ao grupo?",
    options: [],
  },
  "quem-sou-eu": {
    label: "Quem sou eu?",
    shortLabel: "Quem sou eu?",
    itemNoun: "adivinhas",
    summary: "Ouça as pistas, uma de cada vez, e adivinhe quem é.",
    skill: "Compreensão e inferência a partir de pistas",
    area: "compreensao",
    accent: "sky",
    slugBase: "quem-sou-eu",
    instruction: "Leia a pista e escolha a resposta.",
    options: [],
  },
  "siga-comando": {
    label: "Siga o comando",
    shortLabel: "Comando",
    itemNoun: "comandos",
    summary: "Mova os objetos da cena para cumprir a instrução.",
    skill: "Compreensão de comandos e conceitos espaciais",
    area: "compreensao",
    accent: "peach",
    slugBase: "siga-o-comando",
    instruction: "Faça o que o comando pede e toque em Conferir.",
    options: [
      {
        key: "interacao",
        label: "Como mover os objetos",
        choices: [
          { value: "toque", label: "Tocar e tocar", description: "Toque no objeto e depois no lugar" },
          { value: "arrastar", label: "Arrastar ou tocar", description: "Também permite arrastar com o dedo" },
        ],
        default: "toque",
      },
    ],
  },
  ordem: {
    label: "Coloque na ordem certa",
    shortLabel: "Ordem",
    itemNoun: "sequências",
    summary: "Organize as cenas na sequência do que acontece.",
    skill: "Sequência temporal e narrativa",
    area: "sequencias",
    accent: "butter",
    slugBase: "coloque-na-ordem",
    instruction: "Toque em duas figuras para trocá-las de lugar.",
    options: [],
  },
  "monte-frase": {
    label: "Monte a frase",
    shortLabel: "Frase",
    itemNoun: "frases",
    summary: "Junte as peças na ordem certa para formar a frase.",
    skill: "Organização da frase (sintaxe)",
    area: "linguagem",
    accent: "sage",
    slugBase: "monte-a-frase",
    instruction: "Toque nas peças na ordem certa.",
    options: [
      {
        key: "modo",
        label: "Peças",
        choices: [
          { value: "imagens", label: "Com imagens", description: "Palavras acompanhadas de figuras" },
          { value: "palavras", label: "Somente palavras", description: "Para quem já lê" },
        ],
        default: "imagens",
      },
    ],
  },
  silabas: {
    label: "Quantas sílabas?",
    shortLabel: "Sílabas",
    itemNoun: "palavras",
    summary: "Conte os pedacinhos de cada palavra.",
    skill: "Segmentação silábica",
    area: "fonologica",
    accent: "rose",
    slugBase: "quantas-silabas",
    instruction: "Quantas sílabas tem esta palavra?",
    options: [],
  },
  rima: {
    label: "Qual palavra rima?",
    shortLabel: "Rima",
    itemNoun: "rimas",
    summary: "Encontre a palavra que termina com o mesmo som.",
    skill: "Identificação de rimas",
    area: "fonologica",
    accent: "peach",
    slugBase: "qual-palavra-rima",
    instruction: "Qual palavra rima com a palavra do topo?",
    options: [],
  },
  "som-inicial": {
    label: "Caça ao som inicial",
    shortLabel: "Som inicial",
    itemNoun: "sons",
    summary: "Encontre as figuras que começam com o mesmo som.",
    skill: "Consciência fonêmica (som inicial)",
    area: "fonologica",
    accent: "sky",
    slugBase: "caca-ao-som",
    instruction: "Marque todas as figuras que começam com o som e toque em Conferir.",
    options: [
      {
        key: "nomes",
        label: "Nomes das figuras",
        help: "Ocultar os nomes evita que a criança use a letra em vez do som.",
        choices: [
          { value: "mostrar", label: "Mostrar" },
          { value: "ocultar", label: "Ocultar" },
        ],
        default: "mostrar",
      },
    ],
  },
  escute: {
    label: "Escute e escolha",
    shortLabel: "Escute",
    itemNoun: "pares mínimos",
    summary: "A profissional fala uma palavra e a criança escolhe a figura.",
    skill: "Discriminação auditiva (pares mínimos)",
    area: "fonologica",
    accent: "lilac",
    slugBase: "escute-e-escolha",
    instruction: "Escute a palavra e toque na figura certa.",
    options: [
      {
        key: "modo",
        label: "Quem diz a palavra",
        choices: [
          { value: "profissional", label: "A profissional", description: "A palavra-alvo aparece só quando você pedir" },
          { value: "audio", label: "Áudio gravado", description: "Toca a gravação cadastrada de cada palavra" },
        ],
        default: "profissional",
      },
    ],
  },
  desapareceu: {
    label: "O que desapareceu?",
    shortLabel: "Desapareceu",
    itemNoun: "figuras",
    summary: "Observe as figuras e descubra qual sumiu.",
    skill: "Memória visual e atenção",
    area: "memoria",
    accent: "sage",
    slugBase: "o-que-desapareceu",
    instruction: "Observe bem as figuras.",
    options: [
      {
        key: "observacao",
        label: "Tempo de observação",
        help: "O botão \"Estou pronto\" sempre aparece. Sem contagem regressiva na tela.",
        choices: [
          { value: "manual", label: "Avanço manual", description: "Espera o botão \"Estou pronto\"" },
          { value: "5", label: "5 segundos" },
          { value: "10", label: "10 segundos" },
        ],
        default: "manual",
      },
    ],
  },
};

export const GAME_TYPES = Object.keys(GAME_TYPE_META) as GameType[];

export const SKILL_AREAS: { id: SkillArea; label: string }[] = [
  { id: "linguagem", label: "Linguagem e vocabulário" },
  { id: "fonologica", label: "Consciência fonológica" },
  { id: "compreensao", label: "Compreensão" },
  { id: "memoria", label: "Memória e atenção" },
  { id: "sequencias", label: "Sequências e narrativa" },
];

export function skillAreaLabel(id: SkillArea): string {
  return SKILL_AREAS.find((a) => a.id === id)?.label ?? id;
}

/**
 * Lê as opções do jogo a partir dos parâmetros da URL. Valores desconhecidos
 * voltam ao padrão (do pacote, se houver, ou do jogo).
 */
export function parseGameOptions(
  type: GameType,
  params: Record<string, string | string[] | undefined>,
  packDefaults: Record<string, string> = {},
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const field of GAME_TYPE_META[type].options) {
    const raw = params[field.key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    out[field.key] = field.choices.some((c) => c.value === value)
      ? (value as string)
      : (packDefaults[field.key] ?? field.default);
  }
  return out;
}
