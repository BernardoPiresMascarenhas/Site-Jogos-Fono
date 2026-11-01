import { expect, test, type Page } from "@playwright/test";
import { loginOk } from "./helpers";

test.beforeEach(async ({ page }) => {
  await loginOk(page);
});

async function expectNoPageScroll(page: Page) {
  const overflow = await page.evaluate(() => ({
    x: document.documentElement.scrollWidth - window.innerWidth,
    y: document.documentElement.scrollHeight - window.innerHeight,
  }));
  expect(overflow.x).toBeLessThanOrEqual(1);
  expect(overflow.y).toBeLessThanOrEqual(1);
}

test("jogos originais continuam acessíveis pelos endereços de antes", async ({ page }) => {
  for (const slug of ["ligue-os-bichos", "memoria-dos-bichos", "onde-esta-o-bicho"]) {
    await page.goto(`/jogar/${slug}`);
    await expect(page.getByRole("link", { name: "Voltar para a biblioteca" })).toBeVisible();
  }
});

test("ligue as imagens: erro, acerto, conclusão, reinício e níveis", async ({ page }) => {
  await page.goto("/jogar/ligue-os-bichos?nivel=medio");
  const words = page.getByRole("group", { name: "Palavras" }).getByRole("button");
  await expect(words).toHaveCount(4);
  await expectNoPageScroll(page);

  const list = await words.allTextContents();
  // Tentativa errada
  await words.nth(0).click();
  await page.getByRole("button", { name: `Imagem: ${list[1]}`, exact: true }).click();
  await expect(page.getByRole("status", { name: "0 de 4 ligações feitas" })).toBeVisible();
  await expect(page.locator("[aria-live=polite]").filter({ hasText: /Quase|tentar|Ops/ })).toHaveCount(1);

  for (const word of list) {
    await page.getByRole("button", { name: word, exact: true }).click();
    await page.getByRole("button", { name: `Imagem: ${word}`, exact: true }).click();
    await expect(page.getByRole("button", { name: `${word}, ligada`, exact: true })).toBeVisible();
  }
  const dialog = page.getByRole("dialog", { name: /Parabéns/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Escolher outro jogo" })).toHaveAttribute("href", "/biblioteca");

  await dialog.getByRole("button", { name: "Jogar novamente" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: /, ligada$/ })).toHaveCount(0);

  await setDifficulty(page, "Difícil");
  await expect(words).toHaveCount(6);
  await setDifficulty(page, "Fácil");
  await expect(words).toHaveCount(3);
  await expect(page).toHaveURL(/nivel=facil/);
});

async function setDifficulty(page: Page, label: "Fácil" | "Médio" | "Difícil") {
  const radio = page.getByRole("radio", { name: label });
  if (await radio.isVisible()) await radio.click();
  else await page.locator("select").selectOption({ label });
}

function cardName(label: string) {
  return label.replace(/^Carta \d+: /, "").replace(/^palavra /, "").replace(/, par encontrado$/, "");
}

test("jogo da memória: virar, errar, acertar, cliques rápidos e conclusão", async ({ page }) => {
  await page.goto("/jogar/memoria-palavras-da-cozinha?nivel=medio");
  const cards = page.getByRole("group", { name: "Cartas do jogo da memória" }).getByRole("button");
  await expect(cards).toHaveCount(8);
  await expectNoPageScroll(page);

  // Cliques rápidos: nunca mais de 2 cartas viradas sem par
  for (let i = 0; i < 5; i++) await cards.nth(i).click({ force: true, delay: 0 });
  const faceUp = await cards.evaluateAll((els) => els.filter((e) => !e.getAttribute("aria-label")!.includes("virada para baixo") && !e.getAttribute("aria-label")!.includes("par encontrado")).length);
  expect(faceUp).toBeLessThanOrEqual(2);
  await page.waitForTimeout(1300);

  // Resolve a partida lembrando as cartas vistas
  const seen = new Map<number, string>();
  const isDone = async () => (await page.getByRole("dialog").count()) > 0;
  const labelOf = async (i: number) => (await cards.nth(i).getAttribute("aria-label"))!;
  for (let guard = 0; guard < 40 && !(await isDone()); guard++) {
    const hidden: number[] = [];
    for (let i = 0; i < 8; i++) if ((await labelOf(i)).includes("virada para baixo")) hidden.push(i);
    if (hidden.length === 0) break;
    // procura um par já conhecido entre as escondidas
    const byName = new Map<string, number[]>();
    for (const i of hidden) if (seen.has(i)) byName.set(seen.get(i)!, [...(byName.get(seen.get(i)!) ?? []), i]);
    const known = [...byName.values()].find((v) => v.length === 2);
    let a: number, b: number;
    if (known) [a, b] = known;
    else {
      a = hidden.find((i) => !seen.has(i)) ?? hidden[0];
      await cards.nth(a).click();
      const nameA = cardName(await labelOf(a));
      seen.set(a, nameA);
      const partner = hidden.find((i) => i !== a && seen.get(i) === nameA);
      b = partner ?? hidden.find((i) => i !== a && !seen.has(i)) ?? hidden.find((i) => i !== a)!;
      await cards.nth(b).click();
      seen.set(b, cardName(await labelOf(b)));
      if (seen.get(a) !== seen.get(b)) await page.waitForTimeout(1250);
      continue;
    }
    await cards.nth(a).click();
    await cards.nth(b).click();
  }
  await expect(page.getByRole("dialog", { name: /Parabéns/ })).toBeVisible();
  await expect(page.getByText(/Você encontrou os 4 pares/)).toBeVisible();
});

test("onde está?: pergunta, ouvir, erro gentil, progressão e conclusão", async ({ page }) => {
  await page.goto("/jogar/onde-esta-o-bicho?nivel=dificil");
  await expect(page.getByRole("button", { name: "Ouvir a pergunta" })).toBeVisible();
  const options = page.getByRole("group", { name: "Alternativas" }).getByRole("button");
  await expect(options).toHaveCount(6);
  await expectNoPageScroll(page);

  for (let q = 0; q < 5; q++) {
    const prompt = (await page.locator("h2").first().textContent())!;
    const target = prompt.replace(/^Onde (está|estão) (o|a|os|as) /i, "").replace(/\?$/, "").trim();
    await expect(page.getByRole("status", { name: `Pergunta ${q + 1} de 5` })).toBeVisible();
    if (q === 0) {
      const labels = await options.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")!));
      const wrong = labels.find((l) => l.toLowerCase() !== target.toLowerCase())!;
      await page.getByRole("button", { name: wrong, exact: true }).click();
      await expect(page.getByText("Tente outra")).toBeVisible();
    }
    const labels = await options.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")!));
    const right = labels.find((l) => l.toLowerCase() === target.toLowerCase())!;
    expect(right, `alvo "${target}" entre ${labels.join(", ")}`).toBeTruthy();
    await page.getByRole("button", { name: right, exact: true }).click();
    if (q < 4) await expect(page.locator("h2").first()).not.toHaveText(prompt, { timeout: 4000 });
  }
  await expect(page.getByRole("dialog", { name: /Parabéns/ })).toBeVisible();
  await page.getByRole("link", { name: "Escolher outro jogo" }).click();
  await expect(page).toHaveURL(/\/biblioteca$/);
});

test("controle de som alterna e fica salvo no navegador", async ({ page }) => {
  await page.goto("/jogar/onde-esta-a-roupa");
  await page.getByRole("button", { name: "Desligar sons" }).click();
  await expect(page.getByRole("button", { name: "Ligar sons" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Ligar sons" })).toBeVisible();
});

test("atividade inexistente mostra página de não encontrado", async ({ page }) => {
  await page.goto("/jogar/nao-existe");
  await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
});
