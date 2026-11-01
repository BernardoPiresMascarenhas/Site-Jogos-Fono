# Conteúdo que precisa de revisão profissional

Todo o acervo inicial é um **exemplo educativo** escrito pela equipe técnica, com cuidado, mas
**sem validação fonoaudiológica**. Antes da comercialização, a Ana Luiza deve revisar os itens
abaixo. Itens com observação no código têm o campo `reviewNote`.

Os testes automáticos (`npm test`) já garantem a **consistência** (ex.: pistas que não revelam a
palavra, sílabas que formam a palavra, distratores que não rimam segundo a tabela cadastrada),
mas não substituem o julgamento clínico sobre a **adequação** dos estímulos.

## Prioridade alta (jogos fonológicos)

| Jogo | O que revisar | Onde |
|---|---|---|
| Escute e escolha | Os 8 pares/trios mínimos e os contrastes indicados. Atenção: `rato` (/ʁ/ varia por região), `bola/bolo` e `foca/boca` (o tônico aberto × fechado), `pena/pera` (vogal nasalizada). | `src/content/games/escute.ts` |
| Escute e escolha | **Gravações de áudio**: ainda não existem. O jogo funciona no modo conduzido pela profissional. | ver README › Áudios |
| Caça ao som inicial | A tabela `ONSETS` (fonema inicial de cada palavra), a notação dos fonemas (`/p/`, `/ʃ/`…) e os distratores "próximos" (`nearIds`). O conjunto /v/ tem só 4 alvos. | `src/content/games/som-inicial.ts` |
| Qual palavra rima? | A tabela `RHYME_KEYS` (transcrição simplificada da rima) e os distratores próximos (`galo`, `bolo`, `leite`, `pipa`). | `src/content/games/rima.ts` |
| Quantas sílabas? | As 72 separações silábicas. Ficaram de fora, de propósito: avião, leão, policial, relógio (contagem oral instável). Hiatos incluídos: lua, coelho, melancia, meia. | `src/content/games/silabas.ts` |

## Prioridade média

| Jogo | O que revisar | Onde |
|---|---|---|
| Monte a frase | As 19 frases e as **ordens alternativas aceitas** (deslocamento de "em cima da cama", "depois do almoço" etc.). Trocas sem sentido (ex.: "a maçã come o menino") não são aceitas. | `src/content/games/monte-frase.ts` |
| Coloque na ordem certa | Se a ordem de cada uma das 15 sequências é inequívoca para crianças; a figura do enxágue (copo) em "Escovar os dentes". | `src/content/games/ordem.ts` |
| Siga o comando | Redação dos 17 comandos, inclusive os de "antes/depois" (ordem falada ≠ ordem das ações em um deles). | `src/content/games/siga-comando.ts` |
| Quem sou eu? | As pistas das 40 adivinhas (ordem geral → específica; vocabulário como "estetoscópio" foi evitado). | `src/content/games/quem-sou-eu.ts` |

## Prioridade baixa

| Jogo | O que revisar | Onde |
|---|---|---|
| Qual é o intruso? | Critérios mais abstratos: "fazenda × selvagem" (médio/difícil), "voa × não voa" (difícil), "fruta × legume". | `src/content/games/intruso.ts` |
| O que desapareceu? | Composição dos conjuntos por categoria. | `src/content/games/desapareceu.ts` |
| Todos | Imagens (Fluent Emoji): conferir se cada figura é reconhecível para o público (ex.: `pente` usa um pente-garfo; `caixa` usa um pacote). | `src/content/concept-data.ts` |

## O que a plataforma NÃO faz (por decisão de projeto)

- Não sintetiza fonemas isolados nem usa voz do navegador no "Escute e escolha".
- Não grava voz, não reconhece fala e não classifica o desempenho da criança.
- Não armazena dados das crianças: o progresso existe só durante a partida.
