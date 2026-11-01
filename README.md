# Jogos da Ana

Plataforma web de jogos educativos e interativos para sessões de fonoaudiologia infantil, criada para **Ana Luiza Mascarenhas — Fonoaudióloga**. Acesso privado: cada profissional que compra a plataforma recebe e-mail e senha individuais.

- **3 tipos de jogo**: Ligue as imagens · Jogo da memória · Onde está?
- **16 atividades** prontas, **79 conceitos** (palavras + imagens) em 7 categorias
- Níveis **fácil (3) · médio (4) · difícil (6)** em todos os jogos
- Feito para **tablet** primeiro, depois notebook e celular (retrato e paisagem)
- Login real com Auth.js (Credentials + JWT), senhas com bcrypt, sem banco de dados

> Os jogos são um recurso de apoio para uso mediado por profissionais. Não são ferramentas de diagnóstico nem de tratamento autônomo. O conteúdo inicial é um exemplo funcional e deve ser revisado pela fonoaudióloga antes da venda.

---

## Sumário

1. [Instalação](#1-instalação)
2. [Executar localmente](#2-executar-localmente)
3. [Variáveis de ambiente](#3-variáveis-de-ambiente)
4. [Gerar uma senha segura](#4-gerar-uma-senha-segura)
5. [Adicionar um comprador](#5-adicionar-um-comprador)
6. [Alterar a senha de um comprador](#6-alterar-a-senha-de-um-comprador)
7. [Desativar um acesso](#7-desativar-um-acesso)
8. [Configurar a validade de um acesso](#8-configurar-a-validade-de-um-acesso)
9. [Publicar na Vercel](#9-publicar-na-vercel)
10. [Adicionar palavras e imagens](#10-adicionar-palavras-e-imagens)
11. [Criar uma atividade nova](#11-criar-uma-atividade-nova)
12. [Adicionar um novo tipo de jogo](#12-adicionar-um-novo-tipo-de-jogo)
13. [Segurança e limitações da primeira versão](#13-segurança-e-limitações-da-primeira-versão)
14. [Testes e verificações](#14-testes-e-verificações)
15. [Estrutura do projeto](#15-estrutura-do-projeto)
16. [Identidade visual](#16-identidade-visual)

---

## 1. Instalação

Requisitos: **Node.js 22.18 ou mais recente** (a ferramenta de administração executa TypeScript diretamente) e npm.

```bash
npm install
```

## 2. Executar localmente

```bash
cp .env.example .env.local            # crie o arquivo de ambiente local
npm run admin -- segredo              # copie o valor para AUTH_SECRET no .env.local
npm run admin -- adicionar voce@exemplo.com --nome "Seu Nome" --env-local
npm run dev                           # http://localhost:3000
```

O `--env-local` grava o `AUTH_USERS_JSON` no `.env.local` automaticamente. Reinicie o `npm run dev` sempre que mudar o `.env.local`.

Para testar como em produção: `npm run build && npm start` (fora da Vercel, inclua `AUTH_TRUST_HOST=true` no `.env.local`).

## 3. Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `AUTH_SECRET` | sim | Chave que assina e criptografa o cookie de sessão. Gere com `npm run admin -- segredo`. **Trocá-la encerra todas as sessões abertas.** |
| `AUTH_USERS_JSON` | sim | Lista de usuários autorizados. Gere sempre com a ferramenta (`npm run admin -- exportar`). |
| `AUTH_TRUST_HOST` | só fora da Vercel | `true` ao rodar com `npm start` local ou em outro provedor. Na Vercel não é necessário. |

**Formato do `AUTH_USERS_JSON`** — use sempre o valor `base64:...` que a ferramenta gera. Antes da codificação, ele é assim:

```json
[
  {
    "email": "comprador@exemplo.com",
    "passwordHash": "$2b$12$...hash bcrypt gerado pela ferramenta...",
    "active": true,
    "expiresAt": "2026-12-31",
    "name": "Nome do comprador"
  }
]
```

- `email`: login (sem diferença entre maiúsculas e minúsculas).
- `passwordHash`: hash **bcrypt** (custo 12). Nunca coloque a senha em si.
- `active`: `false` bloqueia o acesso.
- `expiresAt` (opcional): `AAAA-MM-DD` vale **até 23:59 do dia, horário de Brasília**. Também aceita data/hora ISO completa.
- `name` (opcional): aparece na saudação da biblioteca.

> **Por que base64?** Os hashes bcrypt contêm `$`. Quando existe algum arquivo `.env*` no projeto, o carregador do Next.js interpreta `$...` como variável e corrompe o hash, mesmo em variáveis definidas fora do arquivo. O formato `base64:` evita esse problema em qualquer ambiente. JSON puro é aceito, mas não é recomendado.

Se a configuração estiver inválida, **nenhum login é aceito** e o servidor registra no log o motivo (sem mostrar hashes ou e-mails).

O arquivo `.env.example` traz um modelo sem dados reais. Arquivos `.env*` (exceto o exemplo) e `usuarios*.json` estão no `.gitignore` e nunca devem ser versionados.

## Ferramenta de administração

Sem banco de dados, os usuários ficam em um **arquivo local e privado** no seu computador, `usuarios.local.json` (ignorado pelo git). A ferramenta edita esse arquivo e gera o valor para colar na Vercel.

```bash
npm run admin -- ajuda
```

| Comando | O que faz |
|---|---|
| `adicionar <email> [--nome "Nome"] [--expira AAAA-MM-DD] [--gerar-senha]` | Cadastra um comprador |
| `senha <email> [--gerar-senha]` | Altera a senha |
| `desativar <email>` / `ativar <email>` | Bloqueia/reativa o acesso |
| `validade <email> <AAAA-MM-DD\|nunca>` | Define ou remove a data de expiração |
| `remover <email>` | Exclui o usuário |
| `listar` | Mostra todos os usuários e o status (ativo, desativado, expirado) |
| `exportar [--json]` | Mostra o valor de `AUTH_USERS_JSON` |
| `importar [--sobrescrever]` | Recria o arquivo local a partir do valor atual da Vercel (ex.: em outro computador) |
| `hash` | Gera o hash bcrypt de uma senha |
| `gerar-senha` | Sugere uma senha forte |
| `segredo` | Gera um `AUTH_SECRET` |

Opções gerais: `--arquivo <caminho>` (outro arquivo de usuários) e `--env-local` (atualiza também o `.env.local`).

As senhas digitadas não aparecem na tela e nunca são passadas como argumento de linha de comando (para não ficarem no histórico do terminal).

> **Faça backup do `usuarios.local.json`** em um local seguro (ex.: gerenciador de senhas ou pasta criptografada). Se perdê-lo, use `npm run admin -- importar` colando o valor atual da Vercel.

## 4. Gerar uma senha segura

```bash
npm run admin -- gerar-senha        # ex.: kq7M-x9tP-Ra4e-W2nd
```

Ou deixe a ferramenta criar a senha durante o cadastro com `--gerar-senha`. Para obter só o hash de uma senha escolhida por você: `npm run admin -- hash`.

Regras: mínimo de 10 caracteres e máximo de 72 bytes (limite do bcrypt).

## 5. Adicionar um comprador

```bash
npm run admin -- adicionar comprador@exemplo.com --nome "Mariana" --gerar-senha
```

1. A ferramenta mostra a **senha inicial**. Envie ao comprador por um canal privado.
2. Ela também mostra o valor atualizado de `AUTH_USERS_JSON`.
3. Aplique na Vercel e faça um **Redeploy** ([seção 9](#como-aplicar-uma-mudança-de-usuários-na-vercel)).

Sem `--gerar-senha`, a ferramenta pede para você digitar a senha duas vezes.

## 6. Alterar a senha de um comprador

```bash
npm run admin -- senha comprador@exemplo.com --gerar-senha
```

Aplique o novo valor na Vercel e faça o Redeploy. Depois disso, **as sessões abertas com a senha antiga são encerradas automaticamente** (o cookie de sessão guarda uma impressão digital da credencial, que muda junto com a senha).

## 7. Desativar um acesso

```bash
npm run admin -- desativar comprador@exemplo.com
```

Aplique na Vercel e faça o Redeploy. Depois do redeploy, o usuário não consegue entrar e **qualquer sessão aberta dele é encerrada na próxima página que ele abrir**. Para devolver o acesso: `npm run admin -- ativar comprador@exemplo.com`.

## 8. Configurar a validade de um acesso

```bash
npm run admin -- validade comprador@exemplo.com 2026-12-31   # vale até 31/12/2026, 23:59 (Brasília)
npm run admin -- validade comprador@exemplo.com nunca        # remove a expiração
```

Também é possível definir na criação: `adicionar ... --expira 2026-12-31`.

A expiração **não precisa de redeploy para entrar em vigor**: o servidor compara a data a cada acesso. Só é preciso redeploy para *mudar* a data.

## 9. Publicar na Vercel

### Primeira publicação

1. Envie o projeto para um repositório no GitHub (privado, de preferência).
2. Na Vercel: **Add New → Project → Import** o repositório. O framework (Next.js) é detectado automaticamente.
3. Em **Environment Variables**, cadastre para o ambiente **Production**:
   - `AUTH_SECRET` → valor de `npm run admin -- segredo`
   - `AUTH_USERS_JSON` → valor de `npm run admin -- exportar`
   - Marque as duas como **Sensitive**, para que o valor não possa ser lido de volta no painel.
4. Clique em **Deploy**.
5. (Opcional) Em **Settings → Domains**, configure um domínio próprio, ex.: `jogos.fonoanamascarenhas.com.br`.

Se usar *Preview Deployments*, cadastre as variáveis também em **Preview**, com um `AUTH_SECRET` diferente e, de preferência, só com usuários de teste.

### Como aplicar uma mudança de usuários na Vercel

As variáveis de ambiente são lidas **apenas quando uma implantação é criada**. Toda alteração de usuário (novo comprador, senha, desativação, validade) exige:

1. `npm run admin -- <comando>` no seu computador.
2. Vercel → Projeto → **Settings → Environment Variables** → `AUTH_USERS_JSON` → **Edit** → cole o novo valor → **Save**.
3. **Deployments** → na implantação de produção mais recente → **⋯ → Redeploy**.
4. Aguarde o status *Ready* (normalmente 1 a 2 minutos). Só a partir daí a mudança vale.

| Mudança | Precisa de redeploy? |
|---|---|
| Adicionar comprador, trocar senha, desativar, reativar, remover | **Sim** |
| Alterar a data de validade | **Sim** |
| Um acesso chegar à data de validade já configurada | Não, o bloqueio é automático |
| Trocar `AUTH_SECRET` (encerra todas as sessões) | **Sim** |
| Alterar conteúdo, textos ou jogos (código) | Sim. Um `git push` gera a implantação automaticamente |

### Proteção contra tentativas repetidas (recomendado)

A aplicação tem um limitador de tentativas **em memória** (5 erros por e-mail+IP e 25 por IP a cada 15 minutos). Na Vercel, cada instância serverless tem a sua própria memória e as instâncias são recriadas com frequência. **Esse limitador é só uma camada extra de "melhor esforço", não um rate limiter distribuído confiável.**

Para uma proteção real, crie uma regra no **Vercel Firewall** (Projeto → **Firewall → Configure → New Rule**):

- **If**: `Request Path` *equals* `/entrar` **and** `Method` *equals* `POST`. Crie uma segunda regra igual para o caminho `/api/auth/callback/credentials`.
- **Then**: **Rate Limit**, por exemplo 10 requisições por 60 segundos por IP, com ação *Deny* ou *Challenge*.

A disponibilidade e os limites de rate limiting variam conforme o plano da Vercel. Confira na documentação atual da Vercel o que o seu plano inclui. Outra opção, sem custo de infraestrutura, é ativar o **Attack Challenge Mode** se houver um ataque em andamento.

O bcrypt (custo 12) também torna cada tentativa lenta de propósito, o que já dificulta ataques de força bruta.

## 10. Adicionar palavras e imagens

Todo o acervo fica em **`src/content/concept-data.ts`**. Cada linha é um conceito:

```ts
{ id: "girafa", word: "Girafa", article: "a", category: "animais", emoji: "🦒", illustration: "giraffe" },
```

| Campo | Descrição |
|---|---|
| `id` | identificador único, sem acentos, usado nas atividades |
| `word` | palavra exibida para a criança |
| `article` | `o`, `a`, `os` ou `as`, para montar frases como "Onde está **a** girafa?" |
| `category` | `animais`, `alimentos`, `objetos`, `corpo`, `higiene`, `roupas`, `transportes` |
| `emoji` | versão em emoji, também usada como reserva se a imagem falhar |
| `illustration` | nome da ilustração no pacote [Fluent Emoji](https://icon-sets.iconify.design/fluent-emoji/) |
| `image` | *(alternativa)* caminho de uma imagem própria em `public/`, ex.: `"/imagens/girafa.png"` ou `.svg` |
| `audio` | *(opcional)* áudio gravado em `public/`, ex.: `"/audios/girafa.mp3"`. Tem prioridade sobre a voz do navegador |

Depois de adicionar conceitos com `illustration`, gere os arquivos:

```bash
npm run ilustracoes      # cria public/ilustracoes/<id>.svg e <id>.webp (o site usa o .webp)
npm test                 # confere ids, duplicados e imagens existentes
```

**Usar ilustrações próprias:** coloque os arquivos em `public/imagens/` e informe `image` no lugar de `illustration`. O componente de mídia (`src/components/media.tsx`) aceita emoji, imagem (PNG/JPG/WebP) e SVG, sempre com descrição acessível (a própria palavra). Para manter a coerência visual, use um mesmo estilo em todo o acervo.

**Licenças:** as ilustrações atuais são do **Fluent Emoji** (Microsoft, licença **MIT**, uso comercial permitido mantendo o aviso em `public/ilustracoes/LICENCA-FLUENT-EMOJI.txt`). Ao usar imagens de terceiros, confirme se a licença permite uso comercial e se não há marca d'água.

## 11. Criar uma atividade nova

As atividades ficam em `src/content/activities/` (um arquivo por tipo de jogo). Basta adicionar um objeto, sem mexer em componentes:

```ts
// src/content/activities/onde-esta.ts
{
  id: "onde-fazenda",
  slug: "onde-esta-na-fazenda",          // URL: /jogar/onde-esta-na-fazenda
  type: "onde-esta",
  title: "Na fazenda",
  description: "Encontre os animais da fazenda.",
  category: "animais",
  difficulty: "facil",                    // sugerida (pode ser trocada no jogo)
  instruction: "Encontre a imagem certa.",
  conceptIds: ["vaca", "porco", "galinha", "pato", "cavalo", "coelho"],   // mínimo 6
  accent: "sage",                         // rose | sage | butter | sky | peach | lilac
  coverConceptIds: ["vaca", "porco", "pato"],   // ilustração do card (opcional)
  questionsPerRound: 5,                   // opcional
  // Perguntas fixas (opcional). Sem elas, as perguntas são sorteadas do conjunto.
  questions: [
    { targetId: "vaca" },
    { targetId: "pato", prompt: "Quem faz quá-quá?", distractorIds: ["gato", "carro"] },
  ],
},
```

Campos específicos:

- **Ligue as imagens** (`type: "ligar"`): só os campos comuns. Os pares são sorteados do conjunto a cada partida, sem repetição.
- **Jogo da memória** (`type: "memoria"`): `mode: "imagem-imagem"` ou `"palavra-imagem"`.
- **Onde está?** (`type: "onde-esta"`): `questions`, `questionsPerRound` e, por pergunta, `prompt`, `distractorIds` e `audio`, todos opcionais.

Para criar um **pacote** novo (ex.: "Pacote Natal"), crie `src/content/activities/natal.ts` exportando uma lista e inclua-a em `ACTIVITIES` em `src/content/index.ts`.

Rode `npm test`: o validador aponta ids inexistentes, slugs repetidos e conjuntos pequenos demais.

## 12. Adicionar um novo tipo de jogo

Exemplo: "Complete a palavra".

1. **Tipos**: em `src/content/types.ts`, adicione `"complete"` a `GameType` e crie `interface CompleteActivity extends ActivityBase { type: "complete"; ... }`, incluindo-a na união `Activity`.
2. **Regras** em `src/games/complete/engine.ts`: funções puras (criar rodada a partir de `items` + `difficulty` + `rng`, e um *reducer* com as jogadas). Teste em `tests/unit/`.
3. **Tela** em `src/games/complete/complete-game.tsx`: recebe `GameProps` e renderiza dentro de `<GameShell>` (voltar, título, nível, som, reiniciar, progresso, feedback e conclusão já vêm prontos). Reaproveite `useFeedback`, `useFitGrid`, `Burst`, `Media` e `useSound`.
4. **Registro**: adicione o componente em `src/games/registry.tsx`, o rótulo em `src/games/meta.ts` e o ícone em `src/games/icons.tsx`.
5. **Conteúdo**: crie `src/content/activities/complete.ts` e inclua em `src/content/index.ts`.

A biblioteca, os filtros, a rota `/jogar/[slug]` e a proteção de acesso passam a funcionar para o novo tipo sem outras mudanças.

## 13. Segurança e limitações da primeira versão

### O que está implementado

- **Login real** com Auth.js v5 (provedor Credentials) e **sessão JWT** em cookie **HttpOnly**, `SameSite=Lax` e `Secure` em HTTPS (prefixo `__Secure-`). Nada sensível vai para `localStorage`.
- **Senhas com bcrypt** (custo 12). As senhas nunca são guardadas nem registradas em log. Os logs de autenticação não mostram e-mails nem hashes.
- **Usuários só no servidor**: o `AUTH_USERS_JSON` é lido apenas no servidor e nunca chega ao navegador.
- **Proteção em duas camadas**: o `proxy` (antigo middleware) valida o cookie (assinatura, expiração e situação atual do usuário) e bloqueia `/biblioteca` e `/jogar/*` antes de renderizar, sem nunca gravar cookies, e cada página revalida a sessão no servidor (`requireUser`). Não depende de redirecionamento no navegador.
- **Revalidação a cada acesso**: a sessão é conferida contra a configuração atual. Usuário removido, desativado, expirado ou com senha trocada perde a sessão imediatamente (depois do redeploy, quando aplicável).
- **Duração da sessão**: 12 h a partir do login, sem renovação automática (ajustável em `src/config/site.ts`). Depois disso, basta entrar de novo. A renovação automática foi evitada de propósito: ela permitiria que uma requisição em andamento recriasse o cookie logo após o logout.
- **Mensagens genéricas**: e-mail inexistente, senha errada, conta desativada ou expirada recebem a mesma mensagem, e o tempo de resposta é equivalente (comparação com hash fictício). Isso não revela quais e-mails existem.
- **Validação** com Zod no navegador e no servidor. O redirecionamento pós-login só aceita caminhos internos.
- **Cabeçalhos de segurança**: `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy` e `Permissions-Policy`.
- **Logout** remove o cookie de sessão do navegador. Por ser JWT, uma cópia do token feita antes do logout (situação improvável, que exigiria acesso ao dispositivo) continuaria válida até expirar, a menos que o usuário seja desativado ou a senha trocada.
- **Privacidade**: nenhum dado de crianças é coletado ou armazenado. O progresso existe só durante a partida, na memória do navegador. A única preferência salva é o som ligado/desligado (no próprio navegador).

### Limitações conhecidas (sem banco de dados)

- **Administração manual**: cada mudança de usuário exige editar a variável na Vercel e fazer redeploy. Não existe painel administrativo nem "esqueci minha senha": o comprador deve pedir uma nova senha à responsável.
- **Revogação de sessões**: com sessões JWT, a revogação depende da configuração do servidor. Ao desativar um usuário ou trocar a senha, as sessões dele **só deixam de valer quando o redeploy termina**, e não no instante em que você edita o arquivo local. Para encerrar **todas** as sessões de todos os usuários, troque o `AUTH_SECRET` e faça o redeploy.
- **Limite de tamanho**: a Vercel limita o total das variáveis de ambiente a cerca de 64 KB por implantação. Cada usuário ocupa aproximadamente 200 bytes em base64, o que comporta algumas centenas de compradores. Acima disso, será preciso um banco de dados.
- **Rate limiting em memória** não é distribuído (veja a [seção 9](#proteção-contra-tentativas-repetidas-recomendado)).
- **Recursos estáticos são públicos**: as ilustrações em `/ilustracoes/*.webp` (e `*.svg`) e os arquivos JavaScript/CSS do site podem ser abertos diretamente pela URL, sem login (é assim que todo site funciona). O que fica protegido é a **plataforma**: biblioteca, telas de jogo e a lista de atividades com seu conteúdo, que só é enviada ao navegador de usuários autenticados. **O login não é uma proteção anticópia**: quem tem acesso pode, tecnicamente, salvar o que vê na tela.
- **Voz em português**: o botão "Ouvir" usa a síntese de voz do navegador (`SpeechSynthesis`, pt-BR). Alguns dispositivos não têm voz em português. Nesse caso, o botão fica indisponível com uma explicação e a pergunta continua escrita na tela. Para garantir o áudio, grave arquivos e use o campo `audio`.
- **Compartilhamento de senha**: nada impede tecnicamente que um comprador compartilhe a senha. Se for necessário, uma versão futura com banco de dados pode limitar o número de sessões simultâneas.

## 14. Testes e verificações

```bash
npm run typecheck     # TypeScript
npm run lint          # ESLint
npm test              # testes unitários (Vitest): motores, conteúdo, autenticação
npm run build         # build de produção
npm run test:e2e      # testes no navegador (Playwright). Rode depois do build
npm run check         # typecheck + lint + testes unitários + build
```

Para os testes E2E, instale o navegador uma vez com `npx playwright install chromium`. Eles sobem um servidor de produção na porta 3211 com **usuários temporários de teste** (definidos em `playwright.config.ts`, nunca usados em produção) e verificam em **desktop, tablet (820×1180) e celular (Pixel 7)**:

- **Autenticação**: bloqueio de rotas (inclusive sem seguir redirecionamentos), validação de campos, mostrar/ocultar senha, senha incorreta e e-mail inexistente com a mesma mensagem, usuário desativado, acesso expirado, login, cookie HttpOnly, logout, retorno à página pedida, bloqueio de redirecionamento externo, sessão expirada, token forjado, credencial antiga e bloqueio após tentativas repetidas.
- **Jogos**: filtros e estado vazio da biblioteca. No "Ligue as imagens": erro, acertos, conclusão, reinício e troca de nível. Na memória: cliques rápidos, pares e conclusão. No "Onde está?": erro gentil, progressão das perguntas e conclusão. Também o controle de som e a página de atividade inexistente.
- **Responsividade**: nenhuma tela de jogo rola ou corta conteúdo, em todos os níveis e tamanhos, sem erros no console. Também verifica alvos de toque de pelo menos 44 px.

## 15. Estrutura do projeto

```
src/
  app/                      Rotas (App Router)
    page.tsx                Página pública
    entrar/                 Login (página, formulário, server actions)
    (privado)/biblioteca/   Biblioteca de jogos (protegida)
    (privado)/jogar/[slug]/ Tela de jogo (protegida)
    api/auth/[...nextauth]/ Endpoints do Auth.js
  auth.ts                   Configuração do Auth.js
  proxy.ts                  Bloqueio das rotas privadas
  config/                   Nome da plataforma, sessão, cores das atividades
  content/                  CONTEÚDO: conceitos, atividades, tipos e validador
  games/
    ligar/ memoria/ onde-esta/   engine.ts (regras puras) + tela de cada jogo
    shared/                 Moldura do jogo, feedback, conclusão, grade adaptativa
    registry.tsx            Tipo de jogo → componente
  components/               Componentes compartilhados (mídia, botões, logo, biblioteca)
  lib/auth/                 Usuários, senhas, política de sessão, limitador
  lib/audio/                Sons (Web Audio) e leitura em voz alta
scripts/                    Ferramenta de administração e gerador de ilustrações
tests/unit/                 Vitest
tests/e2e/                  Playwright
public/ilustracoes/         Ilustrações (Fluent Emoji, MIT)
```

## 16. Identidade visual

A paleta e as fontes foram extraídas do CSS do site profissional ([fonoanamascarenhas.com.br](https://www.fonoanamascarenhas.com.br/)): rosa `#c39eb0`, rosa-claro `#f5e9ee`, sálvia `#a8c4b5`, areia `#fbf9f6`, tinta `#2d2a32` e a fonte **Fraunces** nos títulos. As cores complementares das atividades (manteiga, céu, pêssego, lilás) e a fonte de texto **Nunito**, mais arredondada e legível para crianças, foram escolhidas para harmonizar com a marca.

- **Tokens de cor e fonte**: `src/app/globals.css` (bloco `@theme`).
- **Nome da plataforma, textos e links**: `src/config/site.ts` (`name`, `owner`, `gameTextCase` para letra bastão nos jogos, duração da sessão).
- **Cores por atividade**: `src/config/accents.ts`.
- **Logotipo** (balão de fala): `src/components/logo.tsx` e `src/app/icon.svg`.
