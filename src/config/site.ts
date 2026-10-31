/**
 * Configuração central da plataforma.
 * Altere aqui o nome, textos institucionais e links sem mexer nos componentes.
 */
export const siteConfig = {
  name: "Jogos da Ana",
  shortName: "Jogos da Ana",
  tagline: "Atividades lúdicas para sessões de fonoaudiologia infantil",
  description:
    "Plataforma de jogos educativos e interativos para apoiar sessões de fonoaudiologia infantil, criada por Ana Luiza Mascarenhas.",
  owner: {
    name: "Ana Luiza Mascarenhas",
    role: "Fonoaudióloga",
    website: "https://www.fonoanamascarenhas.com.br/",
  },
  /** Exibição das palavras dentro dos jogos ("upper" = letra bastão). */
  gameTextCase: "upper" as "upper" | "none",
  /** Número padrão de perguntas por partida do jogo "Onde está?". */
  defaultQuestionsPerRound: 5,
  session: {
    /**
     * Duração da sessão a partir do login. Depois disso é preciso entrar de novo.
     * A sessão não é renovada automaticamente: isso evita que uma requisição em
     * andamento recrie o cookie logo após o logout.
     */
    maxAgeSeconds: 12 * 60 * 60,
  },
  loginRateLimit: {
    windowMs: 15 * 60 * 1000,
    maxAttemptsPerEmailAndIp: 5,
    maxAttemptsPerIp: 25,
  },
} as const;

export type SiteConfig = typeof siteConfig;
