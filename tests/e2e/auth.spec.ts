import { encode } from "next-auth/jwt";
import { expect, test } from "@playwright/test";
import { login, loginOk, PASSWORD } from "./helpers";

const GENERIC = /Não foi possível entrar/;
const SECRET = "segredo-somente-para-testes-e2e-0123456789";
const COOKIE = "authjs.session-token";

test.describe("autenticação", () => {
  test("rotas privadas redirecionam para o login", async ({ page }) => {
    await page.goto("/biblioteca");
    await expect(page).toHaveURL(/\/entrar\?de=%2Fbiblioteca/);
    await page.goto("/jogar/ligue-os-bichos");
    await expect(page).toHaveURL(/\/entrar\?de=%2Fjogar%2Fligue-os-bichos/);
  });

  test("bloqueio também acontece no servidor (sem seguir redirecionamento)", async ({ request }) => {
    for (const path of ["/biblioteca", "/jogar/memoria-dos-bichos"]) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status()).toBe(307);
      expect(await res.text()).not.toContain("Memória dos bichos");
    }
  });

  test("validação de campos", async ({ page }) => {
    await page.goto("/entrar");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Informe seu e-mail")).toBeVisible();
    await expect(page.getByText("Informe sua senha")).toBeVisible();
    await page.getByLabel("E-mail").fill("nao-e-email");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Digite um e-mail válido")).toBeVisible();
  });

  test("mostrar/ocultar senha", async ({ page }) => {
    await page.goto("/entrar");
    const input = page.getByLabel("Senha", { exact: true });
    await expect(input).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Mostrar senha" }).click();
    await expect(input).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Ocultar senha" }).click();
    await expect(input).toHaveAttribute("type", "password");
  });

  test("senha incorreta e e-mail inexistente recebem a mesma mensagem genérica", async ({ page }) => {
    await login(page, "ativa@teste.local", "senha-errada-000");
    await expect(page.locator("form [role=alert]")).toHaveText(GENERIC);
    const msgWrongPassword = await page.locator("form [role=alert]").textContent();
    await login(page, "ninguem@teste.local", PASSWORD);
    await expect(page.locator("form [role=alert]")).toHaveText(GENERIC);
    expect(await page.locator("form [role=alert]").textContent()).toBe(msgWrongPassword);
    await expect(page).toHaveURL(/\/entrar/);
  });

  test("usuário desativado não entra", async ({ page }) => {
    await login(page, "inativa@teste.local");
    await expect(page.locator("form [role=alert]")).toHaveText(GENERIC);
    await page.goto("/biblioteca");
    await expect(page).toHaveURL(/\/entrar/);
  });

  test("acesso expirado não entra", async ({ page }) => {
    await login(page, "expirada@teste.local");
    await expect(page.locator("form [role=alert]")).toHaveText(GENERIC);
  });

  test("login correto, cookie seguro e logout", async ({ page, context }) => {
    await loginOk(page);
    await expect(page.getByText("Olá, Ativa!")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Vamos brincar e aprender?" })).toBeVisible();

    const cookie = (await context.cookies()).find((c) => c.name.includes("session-token"));
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Lax");
    const storage = await page.evaluate(() => JSON.stringify(window.localStorage));
    expect(storage).not.toMatch(/token|senha|password/i);

    // Navega por links (gerando prefetches) antes de sair, para cobrir a corrida
    // entre requisições em andamento e o logout.
    await page.getByRole("link", { name: "Biblioteca de jogos" }).hover();
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL(/\/entrar\?saiu=1/);
    expect((await context.cookies()).some((c) => c.name.includes("session-token"))).toBe(false);
    await expect(page.getByText("Você saiu da plataforma")).toBeVisible();
    await page.goto("/biblioteca");
    await expect(page).toHaveURL(/\/entrar/);
  });

  test("após o login volta para a página pedida", async ({ page }) => {
    await page.goto("/jogar/memoria-dos-bichos?nivel=facil");
    await expect(page).toHaveURL(/\/entrar\?de=/);
    await page.getByLabel("E-mail").fill("ativa@teste.local");
    await page.getByLabel("Senha", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/jogar\/memoria-dos-bichos\?nivel=facil/);
  });

  test("redirecionamento externo é ignorado", async ({ page }) => {
    await login(page, "ativa@teste.local", PASSWORD, "/entrar?de=//exemplo.com");
    await expect(page).toHaveURL(/localhost:\d+\/biblioteca$/);
  });

  test("sessão expirada leva ao login", async ({ page, context, baseURL }) => {
    const value = await encode({
      token: { email: "ativa@teste.local", sub: "ativa@teste.local", cv: "x", loginAt: Math.floor(Date.now() / 1000) },
      secret: SECRET,
      salt: COOKIE,
      maxAge: -60,
    });
    await context.addCookies([{ name: COOKIE, value, url: baseURL! }]);
    await page.goto("/biblioteca");
    await expect(page).toHaveURL(/\/entrar/);
  });

  test("token forjado com outra chave ou credencial antiga é recusado", async ({ page, context, baseURL }) => {
    const forged = await encode({
      token: { email: "ativa@teste.local", sub: "ativa@teste.local" },
      secret: "outra-chave-qualquer-0123456789-abcdef",
      salt: COOKIE,
    });
    await context.addCookies([{ name: COOKIE, value: forged, url: baseURL! }]);
    await page.goto("/biblioteca");
    await expect(page).toHaveURL(/\/entrar/);

    // Assinado com a chave certa, mas sem a impressão digital da senha atual
    const stale = await encode({
      token: { email: "ativa@teste.local", sub: "ativa@teste.local", cv: "senha-antiga", loginAt: Math.floor(Date.now() / 1000) },
      secret: SECRET,
      salt: COOKIE,
    });
    await context.clearCookies();
    await context.addCookies([{ name: COOKIE, value: stale, url: baseURL! }]);
    await page.goto("/biblioteca");
    await expect(page).toHaveURL(/\/entrar/);
  });

  test("muitas tentativas seguidas são bloqueadas temporariamente", async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await login(page, "limite@teste.local", `errada-${i}-abc`);
      await expect(page.locator("form [role=alert]")).toBeVisible();
    }
    await login(page, "limite@teste.local", PASSWORD);
    await expect(page.locator("form [role=alert]")).toHaveText(/Muitas tentativas/);
  });
});
