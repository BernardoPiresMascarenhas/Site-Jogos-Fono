/**
 * Configuração central da plataforma.
 * Altere aqui o nome, textos institucionais e links sem mexer nos componentes.
 */
export const siteConfig = {
  /** Nome oficial da marca (com "&"; o domínio planejado usa "e"). */
  name: "Brinque & Descomplique",
  shortName: "Brinque & Descomplique",
  /** Subtítulo da marca. */
  subtitle: "Recursos Terapêuticos",
  /** Título padrão da aba e do compartilhamento. */
  title: "Brinque & Descomplique | Jogos Fonoaudiológicos",
  tagline: "Atividades lúdicas para sessões de fonoaudiologia infantil",
  description:
    "Jogos e recursos terapêuticos interativos para tornar as atividades de fonoaudiologia infantil mais lúdicas e envolventes.",
  /**
   * Domínio planejado (ainda não registrado). NÃO é usado como URL canônica.
   * Quando estiver configurado, defina a variável SITE_URL na Vercel
   * (ex.: https://brinqueedescomplique.com.br) para os links de compartilhamento.
   */
  plannedDomain: "brinqueedescomplique.com.br",
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
