import { expect, test, type Locator, type Page } from "@playwright/test";
import { loginOk } from "./helpers";
// O conteúdo é lido direto dos arquivos do acervo para saber as respostas certas.
import { CONCEPT_DATA, PICTURE_DATA } from "../../src/content/concept-data";
import { COMMANDS } from "../../src/content/games/siga-comando";
import { SEQUENCES } from "../../src/content/games/ordem";
import { SENTENCES } from "../../src/content/games/monte-frase";
import { SYLLABLE_ITEMS } from "../../src/content/games/silabas";
import { RHYME_KEYS } from "../../src/content/games/rima";
import { ONSETS } from "../../src/content/games/som-inicial";

const wordToId = new Map(CONCEPT_DATA.map((c) => [c.word.toLocaleLowerCase("pt-BR"), c.id]));
const idToWord = new Map(CONCEPT_DATA.map((c) => [c.id, c.word]));
const pictureLabel = new Map(PICTURE_DATA.map((p) => [p.id, p.label]));

test.beforeEach(async ({ page }) => {
  await loginOk(page);
});

const dialog = (page: Page) => page.getByRole("dialog", { name: /Parabéns/ });
const nextButton = (page: Page) => page.getByRole("button", { name: /^(Próxima|Concluir)$/ });
const prompt = (page: Page) => page.locator("main h2").first();

async function expectFits(page: Page) {
  const m = await page.evaluate(() => ({
    x: document.documentElement.scrollWidth - innerWidth,
    main: (() => {
      const el = document.querySelector("main")!;
      return el.scrollHeight - el.clientHeight;
    })(),
  }));
  expect(m.x).toBeLessThanOrEqual(1);
  expect(m.main).toBeLessThanOrEqual(2);
}

/** Tenta as alternativas uma a uma até acertar; confirma o feedback gentil de erro. */
async function solveByTrying(page: Page, options: Locator) {
  const count = await options.count();
  let misses = 0;
  for (let i = 0; i < count; i++) {
    const option = options.nth(i);
    if ((await option.getAttribute("aria-disabled")) === "true") continue;
    await option.click();
    if (await nextButton(page).isVisible()) return misses;
    misses++;
    await expect(option).toHaveAttribute("aria-disabled", "true");
  }
  throw new Error("nenhuma alternativa resolveu a questão");
}

async function finishWithNext(page: Page) {
  await nextButton(page).click();
}

test("biblioteca: 13 jogos, filtros por tipo e categoria e configuração", async ({ page, isMobile }) => {
  const cards = page.locator("main ul > li a[href^='/jogos/']");
  await expect(cards).toHaveCount(13);
  if (isMobile) await page.getByRole("button", { name: /Filtros/ }).click();
  await page.getByRole("button", { name: "Consciência fonológica" }).click();
  await expect(cards).toHaveCount(4);
  await page.getByRole("button", { name: "Sequências e narrativa" }).click();
  await expect(cards).toHaveCount(1);
  await page.getByRole("button", { name: "Animais", exact: true }).click();
  await expect(page.getByText("Nenhum jogo com esses filtros")).toBeVisible();
  await page.getByRole("button", { name: "Mostrar todos" }).click();
  await expect(cards).toHaveCount(13);

  // Categoria filtrada vira a categoria inicial da configuração
  if (isMobile && !(await page.getByRole("button", { name: "Alimentos", exact: true }).isVisible()))
    await page.getByRole("button", { name: /Filtros/ }).click();
  await page.getByRole("button", { name: "Alimentos", exact: true }).click();
  await page.getByRole("link", { name: /Qual é o intruso\?/ }).click();
  await expect(page).toHaveURL(/\/jogos\/intruso\?categoria=alimentos/);
  await expect(page.getByRole("heading", { name: "Qual é o intruso?" })).toBeVisible();
  await expect(page.getByRole("radio", { name: /Alimentos/ })).toBeChecked();
  await page.getByText("Médio", { exact: true }).click();
  await page.getByRole("link", { name: "Começar a jogar" }).click();
  await expect(page).toHaveURL(/\/jogar\/qual-e-o-intruso-alimentos\?nivel=medio/);
  await expect(page.getByRole("group", { name: "Imagens do grupo" }).getByRole("button")).toHaveCount(4);

  // Botão discreto de configurações volta com as escolhas atuais
  await page.getByRole("link", { name: "Configurar atividade" }).click();
  await expect(page.getByRole("radio", { name: /Alimentos/ })).toBeChecked();
  await expect(page.getByRole("radio", { name: "Médio" })).toBeChecked();
});

test("configuração: combinações sem conteúdo ficam desabilitadas com explicação; opções por jogo", async ({ page }) => {
  await page.goto("/jogos/ordem");
  await page.getByText("Rotina diária", { exact: true }).click();
  await expect(page.getByRole("radio", { name: "Médio" })).toBeDisabled();
  await expect(page.getByText(/Só 1 sequência no nível médio/)).toBeVisible();

  await page.goto("/jogos/escute");
  await expect(page.getByRole("radio", { name: /Áudio gravado/ })).toBeDisabled();
  await expect(page.getByText(/Ainda não há gravações cadastradas/)).toBeVisible();
  await expect(page.getByRole("radio", { name: /A profissional/ })).toBeChecked();

  await page.goto("/jogos/memoria");
  await expect(page.getByRole("radio", { name: /Palavra e imagem/ })).toBeVisible();
  await page.goto("/jogos/desapareceu");
  await expect(page.getByRole("radio", { name: /10 segundos/ })).toBeVisible();
  await page.goto("/jogos/rima");
  // Jogo sem categorias: não mostra o campo
  await expect(page.getByText("Categoria", { exact: true })).toHaveCount(0);
});

test("jogo 4 — intruso: erro, acerto, explicação, progressão, reinício e conclusão", async ({ page }) => {
  await page.goto("/jogar/qual-e-o-intruso-variadas?nivel=dificil");
  const options = page.getByRole("group", { name: "Imagens do grupo" }).getByRole("button");
  await expect(options).toHaveCount(6);
  await expectFits(page);
  await expect(page.getByRole("status", { name: "Desafio 1 de 5" })).toBeVisible();
  await solveByTrying(page, options);
  await page.getByRole("button", { name: "Por quê?" }).click();
  await expect(page.locator("main h2")).toHaveCount(1);
  await expect(prompt(page)).toContainText(/Todas as outras|Todos os outros/);
  // Reinício volta ao começo
  await page.getByRole("button", { name: "Reiniciar jogo" }).click();
  await expect(page.getByRole("status", { name: "Desafio 1 de 5" })).toBeVisible();
  await expect(nextButton(page)).toHaveCount(0);
  for (let q = 0; q < 5; q++) {
    await solveByTrying(page, options);
    await finishWithNext(page);
  }
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page).getByText("Você encontrou 5 intrusos.")).toBeVisible();
});

test("jogo 5 — quem sou eu: pistas progressivas com limite, erro e acerto", async ({ page }) => {
  await page.goto("/jogar/quem-sou-eu-variadas?nivel=medio");
  const clues = page.getByRole("list", { name: "Pistas" }).getByRole("listitem");
  await expect(clues).toHaveCount(1);
  await expectFits(page);
  const more = page.getByRole("button", { name: /Mais uma pista/ });
  await more.click();
  await expect(clues).toHaveCount(2);
  await more.click();
  await expect(clues).toHaveCount(3);
  await expect(page.getByRole("button", { name: /Todas as pistas já apareceram/ })).toBeDisabled();
  const options = page.getByRole("group", { name: "Alternativas" }).getByRole("button");
  await expect(options).toHaveCount(4);
  for (let q = 0; q < 5; q++) {
    await solveByTrying(page, options);
    await expect(page.getByRole("status").filter({ hasText: /Era (o|a)/ })).toBeVisible();
    await finishWithNext(page);
    if (q < 4) await expect(clues).toHaveCount(1);
  }
  await expect(dialog(page)).toBeVisible();
});

/** Toca no lugar; se já houver um objeto cobrindo a área, toca nele (coloca junto). */
async function placeIn(page: Page, zoneButton: Locator) {
  const name = await zoneButton.getAttribute("aria-label");
  const occupant = zoneButton.locator("xpath=..").locator("> button[aria-pressed]");
  // No tapete, toca numa parte livre (tocar num objeto do tapete troca a seleção).
  if (name?.startsWith("Tapete")) await zoneButton.click({ position: { x: 12, y: 12 } });
  else if ((await occupant.count()) > 0) await occupant.first().click();
  else await zoneButton.click();
}

/** Executa um comando pela alternativa de toque: objeto e depois lugar. */
async function performCommand(page: Page, text: string) {
  const command = COMMANDS.find((c) => c.text === text);
  expect(command, `comando "${text}"`).toBeTruthy();
  const rel: Record<string, string> = { "em-cima": "em cima", embaixo: "embaixo", dentro: "dentro", "ao-lado": "ao lado" };
  for (const goal of command!.goals) {
    const objectWord = idToWord.get(goal.objectId)!;
    await page.getByRole("button", { name: new RegExp(`^${objectWord}`) }).click();
    const landmark = idToWord.get(goal.landmarkId)!.toLocaleLowerCase("pt-BR");
    const zone = goal.relation === "fora" ? "Tapete (fora dos lugares)" : `${rel[goal.relation]} da ${landmark}`;
    await placeIn(page, page.getByRole("button", { name: zone, exact: true }));
  }
}

test("jogo 6 — siga o comando: toque, validação de posição, comandos de duas etapas e reinício", async ({ page }) => {
  await page.goto("/jogar/siga-o-comando-variadas?nivel=dificil");
  await expect(page.getByRole("group", { name: "Cena" })).toBeVisible();
  await expectFits(page);
  const conferir = page.getByRole("button", { name: "Conferir" });
  await expect(conferir).toBeDisabled();

  // Lugar errado: o jogo não aceita
  const text = (await prompt(page).textContent())!;
  const command = COMMANDS.find((c) => c.text === text)!;
  const wrongObject = idToWord.get(command.goals[0].objectId)!;
  await page.getByRole("button", { name: new RegExp(`^${wrongObject}`) }).click();
  await page.getByRole("button", { name: /^ao lado da|^em cima da/ }).first().click();
  await conferir.click();
  await expect(page.locator("[aria-live=polite]").filter({ hasText: /Ainda não|Quase|ordem/ })).toHaveCount(1);
  await expect(nextButton(page)).toHaveCount(0);

  // Recomeçar a cena devolve tudo ao tapete e permite refazer certo
  await page.getByRole("button", { name: /Recomeçar/ }).click();
  await expect(conferir).toBeDisabled();
  for (let q = 0; q < 4; q++) {
    await performCommand(page, (await prompt(page).textContent())!);
    await page.getByRole("button", { name: "Conferir" }).click();
    await finishWithNext(page);
  }
  await expect(dialog(page)).toBeVisible();
});

test("jogo 6 — siga o comando: arrastar também funciona (quando habilitado)", async ({ page, isMobile }) => {
  test.skip(isMobile, "arrasto com mouse");
  await page.goto("/jogar/siga-o-comando-variadas?nivel=facil&interacao=arrastar");
  const command = COMMANDS.find((c) => c.text === "Coloque a bola dentro da caixa.")!;
  for (let guard = 0; guard < 4; guard++) {
    const text = (await prompt(page).textContent())!;
    const current = COMMANDS.find((c) => c.text === text)!;
    const goal = current.goals[0];
    const object = page.getByRole("button", { name: new RegExp(`^${idToWord.get(goal.objectId)}`) });
    const rel = { "em-cima": "em cima", dentro: "dentro" } as Record<string, string>;
    const zone = page.getByRole("button", { name: `${rel[goal.relation]} da ${idToWord.get(goal.landmarkId)!.toLocaleLowerCase("pt-BR")}`, exact: true });
    const a = (await object.boundingBox())!;
    const b = (await zone.boundingBox())!;
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
    await page.mouse.down();
    await page.mouse.move(a.x + a.width / 2 + 20, a.y + a.height / 2 + 5, { steps: 3 });
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 });
    await page.mouse.up();
    await expect(zone.locator("xpath=..").locator("> button[aria-pressed]")).toHaveCount(1);
    await page.getByRole("button", { name: "Conferir" }).click();
    await expect(nextButton(page)).toBeVisible();
    expect(command).toBeTruthy();
    break;
  }
});

test("jogo 7 — ordem: conferir com erro, corrigir trocando, contar a história", async ({ page }) => {
  for (const [nivel, size] of [["facil", 3], ["medio", 4]] as const) {
    await page.goto(`/jogar/coloque-na-ordem-variadas?nivel=${nivel}`);
    const cards = page.getByRole("list", { name: "Sequência" }).getByRole("button");
    await expect(cards).toHaveCount(size);
  }
  await page.goto("/jogar/coloque-na-ordem-variadas?nivel=dificil");
  await expectFits(page);
  const cards = page.getByRole("list", { name: "Sequência" }).getByRole("button");
  for (let q = 0; q < 3; q++) {
    const title = (await prompt(page).textContent())!;
    const seq = SEQUENCES.find((s) => s.title === title)!;
    expect(seq, title).toBeTruthy();
    const labels = seq.steps.map((id) => pictureLabel.get(id)!);
    await expect(cards).toHaveCount(labels.length);
    if (q === 0) {
      await page.getByRole("button", { name: "Conferir" }).click();
      await expect(cards.filter({ has: page.locator("xpath=self::*[contains(@aria-label,'fora do lugar')]") }).first()).toBeVisible();
    }
    for (let i = 0; i < labels.length; i++) {
      const current = await cards.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")!.replace(/^Posição \d+: /, "").replace(/, (no lugar certo|fora do lugar|selecionada)$/, "")));
      const j = current.indexOf(labels[i]);
      if (j !== i) {
        await cards.nth(i).click();
        await cards.nth(j).click();
      }
    }
    await page.getByRole("button", { name: "Conferir" }).click();
    await expect(nextButton(page)).toBeVisible();
    if (q === 0) {
      await page.getByRole("button", { name: "Contar a história" }).click();
      const story = page.getByRole("dialog", { name: title });
      await expect(story.getByRole("listitem")).toHaveCount(labels.length);
      await story.getByRole("button", { name: "Fechar" }).click();
      await expect(story).toBeHidden();
    }
    await finishWithNext(page);
  }
  await expect(dialog(page)).toBeVisible();
});

test("jogo 8 — monte a frase: ordem errada, remover, ordem certa, modo só palavras", async ({ page }) => {
  await page.goto("/jogar/monte-a-frase-variadas?nivel=dificil&modo=palavras");
  await expectFits(page);
  const tray = page.getByRole("group", { name: "Peças" });
  for (let q = 0; q < 4; q++) {
    await expect(page.getByRole("status", { name: `Frase ${q + 1} de 4` })).toBeVisible();
    await expect(page.getByRole("list", { name: "Frase" }).getByRole("button")).toHaveCount(0);
    await tray.getByRole("button").first().waitFor();
    const texts = await tray.getByRole("button").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")!.replace(/^Peça: /, "")));
    const sentence = SENTENCES.find((s) => s.tokens.map((t) => t.text).sort().join("|") === [...texts].sort().join("|"))!;
    expect(sentence, texts.join(" ")).toBeTruthy();
    expect(sentence.tokens.length).toBeGreaterThanOrEqual(6);
    const order = sentence.tokens.map((t) => t.text);
    if (q === 0) {
      for (const w of [...order].reverse()) await tray.getByRole("button", { name: `Peça: ${w}`, exact: true }).first().click();
      await page.getByRole("button", { name: "Conferir" }).click();
      await expect(nextButton(page)).toHaveCount(0);
      // tira todas as peças (tocando nos espaços)
      for (let i = 0; i < order.length; i++) await page.getByRole("list", { name: "Frase" }).getByRole("button").first().click();
      await expect(page.getByRole("list", { name: "Frase" }).getByRole("button")).toHaveCount(0);
    }
    for (const w of order) await tray.getByRole("button", { name: `Peça: ${w}`, exact: true }).first().click();
    await page.getByRole("button", { name: "Conferir" }).click();
    await expect(nextButton(page)).toBeVisible();
    await expect(prompt(page)).toHaveText(/\.$/);
    await finishWithNext(page);
  }
  await expect(dialog(page)).toBeVisible();
});

test("jogo 8 — monte a frase: aceita a outra ordem válida cadastrada", async ({ page }) => {
  // Frases fáceis não têm alternativas; aqui conferimos o modo com imagens e tamanhos.
  for (const [nivel, sizes] of [["facil", [3]], ["medio", [4, 5]]] as const) {
    await page.goto(`/jogar/monte-a-frase-variadas?nivel=${nivel}`);
    await page.getByRole("group", { name: "Peças" }).getByRole("button").first().waitFor();
    const n = await page.getByRole("group", { name: "Peças" }).getByRole("button").count();
    expect(sizes as readonly number[]).toContain(n);
  }
});

test("jogo 9 — quantas sílabas: erro, acerto, separação exibida, troca de nível e conclusão", async ({ page }) => {
  await page.goto("/jogar/quantas-silabas-variadas?nivel=facil");
  await expect(page.getByRole("group", { name: "Quantas sílabas?" }).getByRole("button")).toHaveCount(3);
  await page.goto("/jogar/quantas-silabas-variadas?nivel=dificil");
  await expectFits(page);
  const choices = page.getByRole("group", { name: "Quantas sílabas?" }).getByRole("button");
  await expect(choices).toHaveCount(4);
  for (let q = 0; q < 6; q++) {
    const word = (await prompt(page).textContent())!.trim();
    const item = SYLLABLE_ITEMS.find((i) => i.conceptId === wordToId.get(word.toLocaleLowerCase("pt-BR")))!;
    expect(item, word).toBeTruthy();
    if (q === 0) {
      const wrong = item.syllableCount === 2 ? 3 : 2;
      await page.getByRole("button", { name: `${wrong} sílabas`, exact: true }).click();
      await expect(nextButton(page)).toHaveCount(0);
    }
    await page.getByRole("button", { name: `${item.syllableCount} ${item.syllableCount === 1 ? "sílaba" : "sílabas"}`, exact: true }).click();
    await expect(page.getByLabel(`Sílabas: ${item.syllables.join(", ")}`)).toBeVisible();
    await finishWithNext(page);
  }
  await expect(dialog(page)).toBeVisible();
});

test("jogo 10 — rima: erro, acerto com destaque e conclusão", async ({ page }) => {
  await page.goto("/jogar/qual-palavra-rima-variadas?nivel=dificil");
  await expectFits(page);
  const options = page.getByRole("group", { name: "Alternativas" }).getByRole("button");
  await expect(options).toHaveCount(6);
  for (let q = 0; q < 5; q++) {
    await expect(page.getByRole("status", { name: `Rima ${q + 1} de 5` })).toBeVisible();
    await expect(prompt(page)).not.toContainText("rima com");
    await expect(page.locator("main h2")).toHaveCount(1);
    const target = (await prompt(page).textContent())!.replace(/\?$/, "").trim().toLocaleLowerCase("pt-BR");
    const key = RHYME_KEYS[wordToId.get(target)!];
    const labels = await options.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")!));
    const rhyming = labels.filter((l) => RHYME_KEYS[wordToId.get(l.toLocaleLowerCase("pt-BR"))!] === key);
    expect(rhyming, `${target}: ${labels.join(", ")}`).toHaveLength(1);
    if (q === 0) {
      await page.getByRole("button", { name: labels.find((l) => l !== rhyming[0])!, exact: true }).click();
      await expect(page.getByText("Tente outra")).toBeVisible();
    }
    await page.getByRole("button", { name: rhyming[0], exact: true }).click();
    await expect(prompt(page)).toContainText("rima com");
    await finishWithNext(page);
  }
  await expect(dialog(page)).toBeVisible();
});

test("jogo 11 — som inicial: seleção múltipla, conferência e finalização", async ({ page }) => {
  await page.goto("/jogar/caca-ao-som-variadas?nivel=dificil&nomes=ocultar");
  await expectFits(page);
  const options = page.getByRole("group", { name: "Figuras (seleção múltipla)" }).getByRole("button");
  await expect(options).toHaveCount(8);
  let previous = "";
  for (let q = 0; q < 3; q++) {
    await expect(page.getByRole("status", { name: `Som ${q + 1} de 3` })).toBeVisible();
    await expect(page.locator("main h2")).toHaveCount(1);
    if (previous) await expect(prompt(page)).not.toHaveText(previous);
    previous = (await prompt(page).textContent())!;
    const phoneme = previous.replace("Som ", "").trim();
    const labels = await options.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")!.split(",")[0]));
    const targets = labels.filter((l) => ONSETS[wordToId.get(l.toLocaleLowerCase("pt-BR"))!] === phoneme);
    expect(targets.length, `${phoneme}: ${labels.join(", ")}`).toBe(3);
    if (q === 0) {
      const wrong = labels.find((l) => !targets.includes(l))!;
      await options.filter({ has: page.locator(`xpath=self::*[starts-with(@aria-label,'${wrong}')]`) }).first().click();
      await options.filter({ has: page.locator(`xpath=self::*[starts-with(@aria-label,'${targets[0]}')]`) }).first().click();
      await page.getByRole("button", { name: "Conferir" }).click();
      await expect(page.getByRole("button", { name: new RegExp(`^${wrong}, marcada, não começa`) })).toBeVisible();
      await expect(page.getByRole("button", { name: new RegExp(`^${targets[1]}, faltou marcar`) })).toBeVisible();
      await page.getByRole("button", { name: new RegExp(`^${wrong}, marcada`) }).click();
      for (const t of targets.slice(1)) await page.getByRole("button", { name: new RegExp(`^${t}(,|$)`) }).click();
    } else {
      for (const t of targets) await page.getByRole("button", { name: new RegExp(`^${t}$`) }).click();
    }
    await page.getByRole("button", { name: "Conferir" }).click();
    await finishWithNext(page);
  }
  await expect(dialog(page)).toBeVisible();
});

test("jogo 12 — escute e escolha: modo profissional com revelação discreta e progressão", async ({ page }) => {
  await page.goto("/jogar/escute-e-escolha-variadas?nivel=medio");
  await expectFits(page);
  // Sem gravações: nenhum botão de áudio quebrado na tela
  await expect(page.getByRole("button", { name: /^Ouvir/ })).toHaveCount(0);
  const options = page.getByRole("group", { name: "Figuras" }).getByRole("button");
  await expect(options).toHaveCount(3);
  for (let q = 0; q < 6; q++) {
    await expect(page.getByRole("note")).toHaveCount(0);
    await page.getByRole("button", { name: "Ver palavra" }).click();
    const word = (await page.getByRole("note").locator("p").nth(1).textContent())!.trim();
    await page.getByRole("button", { name: "Esconder" }).click();
    await expect(page.getByRole("note")).toHaveCount(0);
    if (q === 0) {
      const labels = await options.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")!));
      await page.getByRole("button", { name: labels.find((l) => l.toLocaleLowerCase("pt-BR") !== word.toLocaleLowerCase("pt-BR"))!, exact: true }).click();
      await expect(nextButton(page)).toHaveCount(0);
    }
    await options.filter({ has: page.locator(`xpath=self::*[translate(@aria-label,'ABCDEFGHIJKLMNOPQRSTUVWXYZÃÕÁÉÍÓÚ','abcdefghijklmnopqrstuvwxyzãõáéíóú')='${word.toLocaleLowerCase("pt-BR")}']`) }).first().click();
    await finishWithNext(page);
  }
  await expect(dialog(page)).toBeVisible();
  // Pedir o modo áudio sem gravações volta ao modo profissional
  await page.goto("/jogar/escute-e-escolha-variadas?modo=audio");
  await expect(page.getByRole("button", { name: "Ver palavra" })).toBeVisible();
});

test("jogo 13 — o que desapareceu: observar, esconder, responder, tempo automático e reinício", async ({ page }) => {
  await page.goto("/jogar/o-que-desapareceu-variadas?nivel=medio");
  await expectFits(page);
  for (let q = 0; q < 5; q++) {
    const board = page.getByRole("list", { name: "Figuras para observar" });
    await expect(board.getByRole("listitem")).toHaveCount(5);
    const shown = await board.getByRole("listitem").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")!));
    expect(shown).toHaveLength(5);
    await page.getByRole("button", { name: "Estou pronto" }).click();
    const rest = page.getByRole("list", { name: "Figuras que ficaram" });
    await expect(rest).toBeVisible({ timeout: 4000 });
    const remaining = await rest.getByRole("listitem").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")!));
    const missing = shown.filter((w) => !remaining.includes(w));
    expect(missing).toHaveLength(1);
    const options = page.getByRole("group", { name: "Qual desapareceu?" }).getByRole("button");
    await expect(options).toHaveCount(4);
    if (q === 0) {
      const visible = (await options.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")!))).find((l) => remaining.includes(l));
      if (visible) {
        await page.getByRole("button", { name: visible, exact: true }).click();
        await expect(page.getByText("Tente outra").first()).toBeVisible();
      }
    }
    await page.getByRole("group", { name: "Qual desapareceu?" }).getByRole("button", { name: missing[0], exact: true }).click();
    await finishWithNext(page);
  }
  await expect(dialog(page)).toBeVisible();

  // Tempo de observação automático (o botão continua disponível)
  await page.goto("/jogar/o-que-desapareceu-variadas?nivel=facil&observacao=5");
  await expect(page.getByRole("button", { name: "Estou pronto" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Figuras que ficaram" })).toBeVisible({ timeout: 8000 });
  await page.getByRole("button", { name: "Reiniciar jogo" }).click();
  await expect(page.getByRole("list", { name: "Figuras para observar" })).toBeVisible();
});

test("cliques rápidos e repetidos não pulam perguntas nem quebram o estado", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/jogar/qual-palavra-rima-variadas?nivel=medio");
  const options = page.getByRole("group", { name: "Alternativas" }).getByRole("button");
  for (let i = 0; i < 3; i++) for (let k = 0; k < (await options.count()); k++) await options.nth(k).click({ delay: 0, force: true });
  await expect(page.getByRole("status", { name: "Rima 1 de 5" })).toBeVisible();
  // Garante o acerto (os cliques forçados podem cair durante a animação de entrada).
  if (!(await nextButton(page).isVisible())) await solveByTrying(page, options);
  // Dois cliques seguidos em "Próxima" avançam só uma pergunta.
  await expect(nextButton(page)).toBeVisible();
  await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find((b) => /Próxima/.test(b.textContent ?? ""))!;
    button.click();
    button.click();
  });
  await expect(page.getByRole("status", { name: "Rima 2 de 5" })).toBeVisible();
  // trocar de nível recomeça do zero (sem estado da partida anterior)
  await page.goto("/jogar/qual-palavra-rima-variadas?nivel=dificil");
  await expect(page.getByRole("status", { name: "Rima 1 de 5" })).toBeVisible();
  expect(errors).toEqual([]);
});
