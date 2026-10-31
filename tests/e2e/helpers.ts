import { expect, type Page } from "@playwright/test";

export const PASSWORD = "Senha-de-Teste-123";

export async function login(page: Page, email = "ativa@teste.local", password = PASSWORD, path = "/entrar") {
  await page.goto(path);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

export async function loginOk(page: Page) {
  await login(page);
  await expect(page).toHaveURL(/\/biblioteca$/);
}
