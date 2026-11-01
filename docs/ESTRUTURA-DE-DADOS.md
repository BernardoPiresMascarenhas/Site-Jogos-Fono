# Estrutura de dados

Resumo de como o conteúdo é organizado. Os tipos completos estão em `src/content/types.ts`.

## Camadas

```
concept-data.ts   palavras + imagens (acervo)       → CONCEPT_DATA
                  figuras de cena (ações, momentos)  → PICTURE_DATA
activities/*.ts   atividades dos jogos 1–3 (conjunto de palavras)
games/*.ts        bancos de questões dos jogos 4–13
banks.ts          liga cada jogo ao seu banco e diz a categoria de cada item
index.ts          gera os pacotes (por categoria + "Variadas") e os cards da biblioteca  [só servidor]
validate.ts       regras de revisão conferidas pelos testes (npm test)
```

## Conceito (palavra do acervo)

```ts
{ id: "banana", word: "Banana", article: "a", category: "alimentos",
  emoji: "🍌", illustration: "banana", audio?: "/audios/palavras/banana.mp3" }
```

## Figura de cena

```ts
{ id: "acordar", label: "Acordar", emoji: "⏰", illustration: "alarm-clock" }
```

Usadas nas sequências (Ordem) e nas frases. Geradas em `public/ilustracoes/cena-<id>.webp`.

## Item de banco (campos comuns)

| Campo | Uso |
|---|---|
| `id` | único dentro do jogo |
| `levels` | níveis em que o item aparece (padrão: todos) |
| `reviewNote` | observação para a revisão profissional (não aparece na tela) |

## Bancos por jogo

| Jogo | Arquivo | Campos principais |
|---|---|---|
| 4 Intruso | `games/intruso.ts` | `category`, `groupIds` (≥5), `intruderId`, `explanation` |
| 5 Quem sou eu? | `games/quem-sou-eu.ts` | `category`, `answerId`, `clues` (geral → específica), `distractorIds` (≥5) |
| 6 Siga o comando | `games/siga-comando.ts` | `text`, `landmarkIds`, `objects[{id,start}]`, `goals[{objectId,landmarkId,relation}]`, `ordered` |
| 7 Ordem | `games/ordem.ts` | `category`, `title`, `steps` (ids de figuras, na ordem certa), `description` |
| 8 Monte a frase | `games/monte-frase.ts` | `tokens[{text,imageId?}]`, `alternatives` (outras ordens válidas), `sceneIds` |
| 9 Sílabas | `games/silabas.ts` | `conceptId`, `syllables`, `syllableCount` |
| 10 Rima | `games/rima.ts` | `targetId`, `correctIds`, `distractorIds` + tabela `RHYME_KEYS` |
| 11 Som inicial | `games/som-inicial.ts` | `phoneme`, `exampleId`, `targetIds`, `distractorIds`, `nearIds` + tabela `ONSETS` |
| 12 Escute e escolha | `games/escute.ts` | `wordIds` (par/trio mínimo), `contrast` |
| 13 Desapareceu | `games/desapareceu.ts` | `conceptId` (conjuntos por categoria) |

## Como o nível funciona em cada jogo

| Jogo | Fácil | Médio | Difícil |
|---|---|---|---|
| Ligar, Memória, Onde está? | 3 | 4 | 6 (pares / alternativas) |
| Intruso, Quem sou eu?, Rima | 3 imagens | 4 | 6 (Quem sou eu? e Rima também filtram por `levels`) |
| Siga o comando | 1 etapa | conceitos espaciais | 2 etapas / antes e depois (por `levels`) |
| Ordem | 3 figuras | 4 | 5 ou 6 |
| Monte a frase | 3 peças | 4–5 | 6+ |
| Sílabas | 1–2 sílabas (opções 1–3) | 2–3 (1–4) | 3+ (2–5) |
| Som inicial | 2 alvos + 2 distratores | 3 + 3 | 3 + 5 (com sons próximos) |
| Escute e escolha | 2 figuras | 3 | 4 |
| Desapareceu | 3 objetos (posições mantidas) | 5 | 6 (posições embaralhadas) |

Os mínimos de cada partida estão nos `engine.ts` (ex.: `INTRUSO_MIN`). Quando uma categoria não
alcança o mínimo num nível, a configuração desabilita esse nível e explica o motivo.

## Opções de jogo (URL)

Definidas em `src/games/meta.ts` (`options`) e lidas por `parseGameOptions`:

| Jogo | Parâmetro | Valores |
|---|---|---|
| Memória | `modo` | `imagem-imagem`, `palavra-imagem` |
| Siga o comando | `interacao` | `toque`, `arrastar` |
| Monte a frase | `modo` | `imagens`, `palavras` |
| Som inicial | `nomes` | `mostrar`, `ocultar` |
| Escute e escolha | `modo` | `profissional`, `audio` (só com gravações) |
| Desapareceu | `observacao` | `manual`, `5`, `10` |

Exemplo: `/jogar/monte-a-frase-variadas?nivel=dificil&modo=palavras`.
