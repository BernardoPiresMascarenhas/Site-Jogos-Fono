import bcrypt from "bcryptjs";
import { defineConfig, devices } from "@playwright/test";

/**
 * Testes de ponta a ponta. Usam usuários TEMPORÁRIOS criados aqui
 * (nunca use estes valores em produção). Rode antes: npm run build
 */
export const TEST_PASSWORD = "Senha-de-Teste-123";
const hash = bcrypt.hashSync(TEST_PASSWORD, 4);
const users = [
  { email: "ativa@teste.local", passwordHash: hash, active: true, name: "Ativa Teste" },
  { email: "inativa@teste.local", passwordHash: hash, active: false },
  { email: "expirada@teste.local", passwordHash: hash, active: true, expiresAt: "2020-01-01" },
  { email: "limite@teste.local", passwordHash: hash, active: true },
];

export const TEST_SECRET = "segredo-somente-para-testes-e2e-0123456789";
const PORT = 3211;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 820 } } },
    {
      name: "tablet",
      testMatch: /jogos|responsivo/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 820, height: 1180 }, hasTouch: true, isMobile: false },
    },
    { name: "mobile", testMatch: /jogos|responsivo/, use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    port: PORT,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      AUTH_SECRET: TEST_SECRET,
      AUTH_TRUST_HOST: "true",
      // Formato base64: imune à expansão de "$" feita pelo carregador de .env do Next.
      AUTH_USERS_JSON: "base64:" + Buffer.from(JSON.stringify(users)).toString("base64"),
    },
  },
});
