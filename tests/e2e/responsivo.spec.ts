import { expect, test } from "@playwright/test";
import { loginOk } from "./helpers";

const GAMES = [
  "ligue-hora-do-banho",
  "memoria-objetos-da-casa",
  "onde-esta-no-corpo",
  "qual-e-o-intruso-variadas",
  "quem-sou-eu-variadas",
  "siga-o-comando-variadas",
  "coloque-na-ordem-variadas",
  "monte-a-frase-variadas",
  "quantas-silabas-variadas",
  "qual-palavra-rima-variadas",
  "caca-ao-som-variadas",
  "escute-e-escolha-variadas",
  "o-que-desapareceu-variadas",
];

test("telas de jogo cabem na tela sem rolagem em todos os níveis", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await loginOk(page);
  for (const slug of GAMES) {
    for (const nivel of ["facil", "medio", "dificil"]) {
      await page.goto(`/jogar/${slug}?nivel=${nivel}`);
      await page.waitForTimeout(250);
      const m = await page.evaluate(() => ({
        x: document.documentElement.scrollWidth - window.innerWidth,
        y: document.documentElement.scrollHeight - window.innerHeight,
        main: (() => {
          const el = document.querySelector("main")!;
          return el.scrollHeight - el.clientHeight;
        })(),
      }));
      expect(m.x, `${slug} ${nivel} horizontal`).toBeLessThanOrEqual(1);
      expect(m.y, `${slug} ${nivel} vertical`).toBeLessThanOrEqual(1);
      expect(m.main, `${slug} ${nivel} área do jogo cortada`).toBeLessThanOrEqual(2);
    }
  }
  for (const path of ["/", "/biblioteca", "/jogos/intruso", "/jogos/siga-comando"]) {
    await page.goto(path);
    const x = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(x, path).toBeLessThanOrEqual(1);
  }
  expect(errors).toEqual([]);
});

test("controles têm alvos de toque confortáveis", async ({ page }) => {
  await loginOk(page);
  await page.goto("/jogar/ligue-os-bichos?nivel=dificil");
  for (const name of ["Voltar para a biblioteca", "Reiniciar jogo", "Desligar sons"]) {
    const box = await page.getByRole(name.startsWith("Voltar") ? "link" : "button", { name }).boundingBox();
    expect(box!.height, name).toBeGreaterThanOrEqual(44);
    expect(box!.width, name).toBeGreaterThanOrEqual(44);
  }
  const word = await page.getByRole("group", { name: "Palavras" }).getByRole("button").first().boundingBox();
  expect(word!.height).toBeGreaterThanOrEqual(48);
});
