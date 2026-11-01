# Brinque & Descomplique — Recursos Terapêuticos

Plataforma web de jogos educativos e interativos para sessões de fonoaudiologia infantil, de **Ana Luiza Mascarenhas — Fonoaudióloga**. Domínio planejado: `brinqueedescomplique.com.br` (o nome da marca usa "&"; o domínio usa "e"). Acesso privado: cada profissional que compra a plataforma recebe e-mail e senha individuais.

- **13 tipos de jogo** em 5 áreas: linguagem e vocabulário, consciência fonológica, compreensão, memória e atenção, sequências e narrativa
- **150 palavras com imagem**, **67 figuras de cena** e **277 itens** nos bancos dos jogos novos, em pacotes por categoria + "Variadas"
- Tela **Configurar atividade** antes de jogar: conteúdo, nível (fácil · médio · difícil), opções do jogo e sons
- Combinações sem conteúdo suficiente ficam desabilitadas, com a explicação
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
- [Os 13 jogos](#os-13-jogos)
- [Áudios](#áudios)
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

## Os 13 jogos

A biblioteca (`/biblioteca`) mostra um card por jogo. Ao tocar em **Jogar**, abre a tela
**Configurar atividade** (`/jogos/<tipo>`): escolha o conteúdo, o nível, as opções do jogo e os
sons, e toque em **Começar a jogar**. Durante a partida, o botão discreto ⚙ (Configurar atividade)
volta para essa tela com as escolhas atuais. **Reiniciar** sorteia uma partida nova do zero.

| # | Jogo | Como funciona | Opções próprias |
|---|---|---|---|
| 1 | **Ligue as imagens** | Toque na palavra e depois na imagem; a ligação fica desenhada. | — |
| 2 | **Jogo da memória** | Cartas que giram; encontre os pares. | imagem/imagem ou palavra/imagem |
| 3 | **Onde está?** | Ouça a pergunta e toque na imagem certa. | — |
| 4 | **Qual é o intruso?** | Toque na imagem que não pertence ao grupo. Após o acerto, **Por quê?** mostra a explicação cadastrada. | — |
| 5 | **Quem sou eu?** | Pistas reveladas uma a uma (**Mais uma pista**, com limite). Cada pista pode ser ouvida. | — |
| 6 | **Siga o comando** | Mova objetos da cena (cadeira, caixa, cama) e toque em **Conferir**. Valida a posição final, se algo foi mexido sem necessidade e, nos comandos com antes/depois, a ordem das ações. | tocar e tocar / arrastar ou tocar |
| 7 | **Coloque na ordem certa** | Toque em duas figuras para trocá-las (ou arraste), **Conferir** marca cada posição. Ao final: descrição e **Contar a história** (só as figuras, para a criança narrar). | — |
| 8 | **Monte a frase** | Toque nas peças na ordem; toque numa peça colocada para tirá-la; arraste para trocar. Aceita as ordens alternativas cadastradas. | com imagens / só palavras |
| 9 | **Quantas sílabas?** | Ouça a palavra, escolha a quantidade; depois do acerto, a palavra aparece separada (BA - NA - NA). | — |
| 10 | **Qual palavra rima?** | Escolha a figura que rima com a palavra do topo; as duas palavras são destacadas. | — |
| 11 | **Caça ao som inicial** | Marque todas as figuras que começam com o som e toque em **Conferir** (mostra acertos, sobras e faltas). | mostrar/ocultar nomes |
| 12 | **Escute e escolha** | A profissional toca em **Ver palavra** (discretamente), fala a palavra e a criança escolhe. Com gravações, pode tocar o áudio. | profissional / áudio gravado |
| 13 | **O que desapareceu?** | Observe, toque em **Estou pronto**, as figuras se escondem e uma some. | avanço manual / 5 s / 10 s |

**Para a profissional:** não há cronômetro competitivo nem pontuação. Erros recebem mensagens
gentis e permitem tentar de novo. Respostas para condução oral (ex.: palavra-alvo do "Escute e
escolha") ficam escondidas até a profissional pedir — não existe uma "tela separada": criança e
profissional olham o mesmo aparelho.

Estrutura dos dados: [`docs/ESTRUTURA-DE-DADOS.md`](docs/ESTRUTURA-DE-DADOS.md).
Conteúdo que precisa de revisão antes da venda: [`docs/REVISAO-DE-CONTEUDO.md`](docs/REVISAO-DE-CONTEUDO.md).

## Áudios

- **Instruções, pistas e palavras** (Onde está?, Intruso, Quem sou eu?, Sílabas, Rima, Siga o
  comando): botão **Ouvir** com a voz do navegador em português. Se o aparelho não tiver voz em
  português, o botão não aparece (o texto está sempre na tela).
- **Gravações** têm prioridade sobre a voz do navegador. Para cadastrar, coloque o arquivo em
  `public/audios/palavras/` e informe `audio` na palavra em `src/content/concept-data.ts`:

  ```ts
  { id: "faca", word: "Faca", ..., audio: "/audios/palavras/faca.mp3" },
  ```

- **Escute e escolha** só usa gravações (nunca a voz sintética, que varia entre aparelhos). O modo
  **Áudio gravado** é liberado automaticamente quando pelo menos 3 pares têm gravação de todas as
  palavras. **Pendência:** ainda não há gravações — o jogo funciona no modo conduzido pela profissional.
- **Caça ao som inicial** não sintetiza fonemas. Se uma gravação do exemplo for cadastrada, aparece
  o botão para ouvi-la.
- **Sons de acerto e conclusão** são gerados no navegador e podem ser desligados (no jogo ou na
  configuração). Nenhum som toca sem uma ação da pessoa.

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
| `category` | `animais`, `alimentos`, `objetos`, `corpo`, `higiene`, `roupas`, `transportes`, `natureza`, `profissoes`, `variadas` |
| `emoji` | versão em emoji, também usada como reserva se a imagem falhar |
| `illustration` | nome da ilustração no pacote [Fluent Emoji](https://icon-sets.iconify.design/fluent-emoji/) |
| `image` | *(alternativa)* caminho de uma imagem própria em `public/`, ex.: `"/imagens/girafa.png"` ou `.svg` |
| `audio` | *(opcional)* áudio gravado em `public/`, ex.: `"/audios/girafa.mp3"`. Tem prioridade sobre a voz do navegador |

Depois de adicionar conceitos com `illustration`, gere os arquivos:

```bash
npm run ilustracoes      # cria public/ilustracoes/<id>.svg e <id>.webp (o site usa o .webp; as figuras de cena viram cena-<id>.webp)
npm test                 # confere ids, duplicados e imagens existentes
```

**Figuras de cena** (ações e momentos, como "Acordar" ou "Escovar os dentes") ficam em `PICTURE_DATA`, no mesmo arquivo, com `id`, `label`, `emoji` e `illustration` (ou `image`).

**Criar uma categoria nova:** adicione o id em `CategoryId` (`src/content/types.ts`) e o nome em `src/content/categories.ts`. Os pacotes por categoria dos jogos novos são gerados sozinhos quando houver pelo menos 3 itens e um nível jogável.

**Usar ilustrações próprias:** coloque os arquivos em `public/imagens/` e informe `image` no lugar de `illustration`. O componente de mídia (`src/components/media.tsx`) aceita emoji, imagem (PNG/JPG/WebP) e SVG, sempre com descrição acessível (a própria palavra). Para manter a coerência visual, use um mesmo estilo em todo o acervo.

**Licenças:** as ilustrações atuais são do **Fluent Emoji** (Microsoft, licença **MIT**, uso comercial permitido mantendo o aviso em `public/ilustracoes/LICENCA-FLUENT-EMOJI.txt`). Ao usar imagens de terceiros, confirme se a licença permite uso comercial e se não há marca d'água.

## 11. Criar uma atividade nova

### Jogos 4 a 13 (bancos de questões)

Cada jogo tem um arquivo em `src/content/games/`. Basta adicionar um item; a categoria decide em
qual pacote ele aparece, e `levels` (opcional) limita os níveis. Exemplos:

```ts
// Qual é o intruso? — src/content/games/intruso.ts
{ id: "frutas-bola", category: "alimentos", groupIds: ["maca", "banana", "uva", "pera", "morango"],
  intruderId: "bola", explanation: "A bola é um brinquedo. Todas as outras imagens são frutas." },

// Quem sou eu? — pistas da mais geral para a mais específica, sem citar a palavra
{ id: "sapo", category: "animais", answerId: "sapo", levels: ["medio", "dificil"],
  clues: ["Sou um animal.", "Vivo perto da água.", "Pulo e faço croac!"],
  distractorIds: ["pato", "peixe", "coelho", "tartaruga", "jacare"] },

// Quantas sílabas? — a separação é sempre escrita à mão
s("girassol", "gi-ras-sol"),   // precisa existir a palavra "girassol" no acervo

// Qual palavra rima? — cadastre a rima de cada palavra em RHYME_KEYS
{ id: "pato", targetId: "pato", correctIds: ["gato", "rato"], distractorIds: ["bola", "uva", "sol", "casa", "mao"] },

// Monte a frase — "palavra:imagem"; outras ordens válidas em alternatives
{ id: "vaca-come", category: "animais", tokens: t("a vaca:vaca come:acao-comer capim") },
```

Respostas: o jogo sabe a resposta pelo próprio cadastro (`intruderId`, `answerId`, `correctIds`,
`targetIds`, `goals`, a ordem de `steps`/`tokens`, `syllables`). Não há geração automática durante a partida.

Dificuldade: veja a tabela em [`docs/ESTRUTURA-DE-DADOS.md`](docs/ESTRUTURA-DE-DADOS.md#como-o-nível-funciona-em-cada-jogo).
Rode `npm test`: o validador confere ids, regras de cada jogo (pista que revela a palavra, distrator que rima, som inicial errado, sílabas que não formam a palavra, comando que já começa resolvido…).

### Jogos 1 a 3 (conjunto de palavras)

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

1. **Tipos** (`src/content/types.ts`): adicione `"complete"` a `GameType`, crie a interface do item (`interface CompleteItem extends BankItemBase { ... }`) e inclua em `BankActivityMap`.
2. **Conteúdo**: crie `src/content/games/complete.ts` e registre em `BANKS` (`src/content/banks.ts`), dizendo a categoria e as palavras/figuras citadas (`bankCategoryOf`, `bankRefs`). Regras de revisão em `src/content/validate.ts`.
3. **Regras** em `src/games/complete/engine.ts`: funções puras — `createCompleteRound(activity, difficulty, rng)`, a disponibilidade por nível (`completeAvailability`) e o *reducer* das jogadas (ou reaproveite `choiceReducer` de `shared/bank.ts`). Registre a disponibilidade em `src/games/availability.ts`. Teste em `tests/unit/`.
4. **Tela** em `src/games/complete/complete-game.tsx`: recebe `GameProps` e usa `<GameShell>` (voltar, título, nível, som, configurar, reiniciar, progresso, feedback e conclusão prontos). Componentes prontos em `shared/ui.tsx`: `PromptCard`, `ListenButton`, `OptionTile`, `ActionBar`, `SuccessBar`, `ProfessionalReveal`; hooks `useRoundFeedback`, `useFitGrid`, `useDragDrop`.
5. **Registro**: componente em `src/games/registry.tsx`, metadados (nome, área, habilidade, cor, opções) em `src/games/meta.ts`, ícone em `src/games/icons.tsx` e ilustração do card em `COVERS` (`src/content/index.ts`).

A biblioteca, os filtros, a tela de configuração, a rota `/jogar/[slug]` e a proteção de acesso passam a funcionar para o novo tipo sem outras mudanças.

## 13. Segurança e limitações da primeira versão

### O que está implementado

- **Login real** com Auth.js v5 (provedor Credentials) e **sessão JWT** em cookie **HttpOnly**, `SameSite=Lax` e `Secure` em HTTPS (prefixo `__Secure-`). Nada sensível vai para `localStorage`.
- **Senhas com bcrypt** (custo 12). As senhas nunca são guardadas nem registradas em log. Os logs de autenticação não mostram e-mails nem hashes.
- **Usuários só no servidor**: o `AUTH_USERS_JSON` é lido apenas no servidor e nunca chega ao navegador.
- **Proteção em duas camadas**: o `proxy` (antigo middleware) valida o cookie (assinatura, expiração e situação atual do usuário) e bloqueia `/biblioteca`, `/jogos/*` e `/jogar/*` antes de renderizar, sem nunca gravar cookies, e cada página revalida a sessão no servidor (`requireUser`). Não depende de redirecionamento no navegador.
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
- **Biblioteca e configuração**: 13 cards, filtros por tipo e categoria (recolhíveis no celular), estado vazio, categoria filtrada pré-selecionada, níveis e opções indisponíveis desabilitados com explicação, botão de configurações durante o jogo.
- **Jogos 1–3**: erro, acertos, conclusão, reinício, troca de nível, cliques rápidos (memória), controle de som.
- **Jogos 4–13**: cada jogo é jogado do início à conclusão pelo navegador, incluindo erro gentil e acerto. Intruso (explicação, reinício), Quem sou eu? (limite de pistas), Siga o comando (toque, lugar errado, duas etapas, recomeçar a cena e arrastar), Ordem (conferir, corrigir, contar a história), Monte a frase (ordem errada, remover, ordem certa), Sílabas (separação exibida), Rima, Som inicial (seleção múltipla e marcas), Escute e escolha (revelação discreta, sem botão de áudio quebrado), Desapareceu (fases, tempo automático, reinício) e cliques rápidos em "Próxima".
- **Responsividade**: nenhuma tela de jogo rola ou corta conteúdo, em todos os níveis e tamanhos, sem erros no console. Também verifica alvos de toque de pelo menos 44 px.

Testes unitários (`tests/unit/novos-jogos.test.ts` e `content.test.ts`) cobrem as regras de cada motor (sorteio, alternativas, validação, ordem, sílabas, rimas, fonemas, pares mínimos) e todo o acervo em todos os níveis.

## 15. Estrutura do projeto

```
src/
  app/                      Rotas (App Router)
    page.tsx                Página pública
    entrar/                 Login (página, formulário, server actions)
    (privado)/biblioteca/   Biblioteca de jogos (protegida)
    (privado)/jogos/[tipo]/ Configurar atividade (protegida)
    (privado)/jogar/[slug]/ Tela de jogo (protegida)
    api/auth/[...nextauth]/ Endpoints do Auth.js
  auth.ts                   Configuração do Auth.js
  proxy.ts                  Bloqueio das rotas privadas
  config/                   Nome da plataforma, sessão, cores das atividades
  content/                  CONTEÚDO: conceitos, figuras, atividades, bancos (games/), tipos e validador
  games/
    <tipo>/                 engine.ts (regras puras) + <tipo>-game.tsx (tela), um por jogo
    shared/                 Moldura, feedback, conclusão, grade adaptativa, ui.tsx, arrastar-e-soltar
    meta.ts                 Nome, área, habilidade, cor e opções de cada jogo
    availability.ts         Mínimo de conteúdo por nível
    registry.tsx            Tipo de jogo → componente
  components/               Componentes compartilhados (mídia, botões, logo, biblioteca, configuração)
  lib/auth/                 Usuários, senhas, política de sessão, limitador
  lib/audio/                Sons (Web Audio) e leitura em voz alta
scripts/                    Ferramenta de administração e gerador de ilustrações
tests/unit/                 Vitest
tests/e2e/                  Playwright
docs/                       Estrutura de dados e lista de revisão do conteúdo
public/ilustracoes/         Ilustrações (Fluent Emoji, MIT)
```

## 16. Identidade visual

A base suave da paleta e as fontes vieram do CSS do site profissional ([fonoanamascarenhas.com.br](https://www.fonoanamascarenhas.com.br/)): rosa `#c39eb0`, rosa-claro `#f5e9ee`, sálvia `#a8c4b5`, areia `#fbf9f6`, tinta `#2d2a32` e a fonte **Fraunces** nos títulos. As cores complementares das atividades (manteiga, céu, pêssego, lilás) e a fonte de texto **Nunito**, mais arredondada e legível para crianças, foram escolhidas para harmonizar com a marca.

- **Tokens de cor e fonte**: `src/app/globals.css` (bloco `@theme`).
- **Nome da plataforma, textos e links**: `src/config/site.ts` (`name`, `owner`, `gameTextCase` para letra bastão nos jogos, duração da sessão).
- **Cores por atividade**: `src/config/accents.ts`.
- **Logotipo**: a logo oficial fica em `public/logo/brinque-descomplique-original.jpeg`. As versões derivadas (fundo transparente, compacta, só o nome, só as peças, favicon e imagem de compartilhamento) são geradas por `python3 scripts/preparar-logo.py` (Pillow, numpy e scipy) em `public/marca/` e `src/app/` (`icon.png`, `apple-icon.png`, `favicon.ico`, `opengraph-image.png`). O script só remove o fundo, recorta e redimensiona: a arte nunca é redesenhada. Uso nos componentes: `src/components/logo.tsx` (`Logo` no cabeçalho, `LogoFull` no login, `LogoMark` com as peças).
- **Cores da marca** (medidas na logo): turquesa `#13a1b7`, coral `#e75353`, amarelo `#f6cb4b`, azul-marinho `#264493`. Ficam em `globals.css` como `teal-*`, `coral-*`, `sun-*` e `navy-*`, usadas em botões principais, foco, seleção, ícones e comemorações. Os fundos e cards continuam nos tons suaves.
- **Domínio e compartilhamento**: quando o domínio estiver registrado, defina `SITE_URL` (ex.: `https://brinqueedescomplique.com.br`) na Vercel para que os links de compartilhamento usem o endereço oficial. Até lá, nenhuma URL canônica é fixada.
