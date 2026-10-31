/**
 * Ferramenta de administração de acessos — Jogos da Ana
 *
 * Uso: npm run admin -- <comando> [opções]
 * Rode "npm run admin -- ajuda" para ver todos os comandos.
 *
 * Os usuários ficam em um arquivo LOCAL e PRIVADO (padrão: usuarios.local.json,
 * ignorado pelo git). Depois de cada alteração, a ferramenta mostra o valor
 * pronto para colar na variável AUTH_USERS_JSON da Vercel.
 */
import { randomBytes, randomInt } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import bcrypt from "bcryptjs";
import {
  authUsersSchema,
  expiryInstant,
  normalizeEmail,
  type AuthUser,
} from "../src/lib/auth/users.ts";

const BCRYPT_COST = 12;
const MIN_PASSWORD = 10;
const MAX_PASSWORD_BYTES = 72; // limite do bcrypt

type StoredUser = { email: string; passwordHash: string; active: boolean; expiresAt?: string | null; name?: string };

// ---------- utilidades de terminal ----------

const color = (code: number) => (s: string) => (process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s);
const bold = color(1);
const green = color(32);
const yellow = color(33);
const red = color(31);
const dim = color(2);

function fail(message: string): never {
  console.error(red(`✗ ${message}`));
  process.exit(1);
}

let stdinLines: string[] | null = null;
async function readPipedLine(): Promise<string> {
  if (!stdinLines) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
    stdinLines = Buffer.concat(chunks).toString("utf8").split(/\r?\n/);
  }
  return stdinLines.shift() ?? "";
}

/** Lê uma senha sem exibi-la no terminal. */
async function askHidden(prompt: string): Promise<string> {
  if (!process.stdin.isTTY) return readPipedLine();
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const output = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
    let muted = false;
    output._writeToOutput = (s: string) => {
      if (!muted) output.output.write(s);
    };
    rl.question(prompt, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

function generatePassword(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const groups = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => alphabet[randomInt(alphabet.length)]).join(""),
  );
  return groups.join("-");
}

function checkPassword(password: string) {
  if (password.length < MIN_PASSWORD) fail(`A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`);
  if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) fail("A senha é longa demais (máximo 72 bytes).");
}

async function obtainPassword(flags: Flags): Promise<{ password: string; generated: boolean }> {
  if (flags["gerar-senha"]) {
    const password = generatePassword();
    return { password, generated: true };
  }
  const password = await askHidden("Nova senha: ");
  checkPassword(password);
  const confirm = await askHidden("Repita a senha: ");
  if (password !== confirm) fail("As senhas não conferem.");
  return { password, generated: false };
}

// ---------- arquivo de usuários ----------

type Flags = Record<string, string | boolean>;

function parseArgs(argv: string[]): { command: string; positional: string[]; flags: Flags } {
  const [command = "ajuda", ...rest] = argv;
  const positional: string[] = [];
  const flags: Flags = {};
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg.startsWith("--")) {
      const [key, inline] = arg.slice(2).split("=", 2);
      if (inline !== undefined) flags[key] = inline;
      else if (rest[i + 1] && !rest[i + 1].startsWith("--") && ["arquivo", "nome", "expira"].includes(key)) flags[key] = rest[++i];
      else flags[key] = true;
    } else positional.push(arg);
  }
  return { command, positional, flags };
}

function usersFile(flags: Flags): string {
  return typeof flags.arquivo === "string" ? flags.arquivo : "usuarios.local.json";
}

function loadUsers(file: string): StoredUser[] {
  if (!existsSync(file)) return [];
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    fail(`Não foi possível ler ${file} (JSON inválido).`);
  }
  const parsed = authUsersSchema.safeParse(data);
  if (!parsed.success) {
    fail(`${file} inválido: ${parsed.error.issues.map((i) => `[${i.path.join(".")}] ${i.message}`).join("; ")}`);
  }
  return parsed.data.map(toStored);
}

function toStored(u: AuthUser): StoredUser {
  const out: StoredUser = { email: u.email, passwordHash: u.passwordHash, active: u.active };
  if (u.expiresAt) out.expiresAt = u.expiresAt;
  if (u.name) out.name = u.name;
  return out;
}

function saveUsers(file: string, users: StoredUser[]) {
  const check = authUsersSchema.safeParse(users);
  if (!check.success) fail(`Configuração resultante inválida: ${check.error.issues[0]?.message}`);
  writeFileSync(file, JSON.stringify(users, null, 2) + "\n", { mode: 0o600 });
}

function envValue(users: StoredUser[]): string {
  return "base64:" + Buffer.from(JSON.stringify(users)).toString("base64");
}

function writeEnvLocal(users: StoredUser[]) {
  const file = ".env.local";
  const line = `AUTH_USERS_JSON=${envValue(users)}`;
  let content = existsSync(file) ? readFileSync(file, "utf8") : "";
  if (/^AUTH_USERS_JSON=.*$/m.test(content)) content = content.replace(/^AUTH_USERS_JSON=.*$/m, line);
  else content = `${content.trimEnd()}${content ? "\n" : ""}${line}\n`;
  writeFileSync(file, content, { mode: 0o600 });
  console.log(green(`✓ .env.local atualizado (reinicie o "npm run dev").`));
}

function printNextSteps(users: StoredUser[], flags: Flags) {
  if (flags["env-local"]) writeEnvLocal(users);
  console.log(`\n${bold("Próximo passo — aplicar na Vercel:")}`);
  console.log(`  1. Vercel → Projeto → Settings → Environment Variables → ${bold("AUTH_USERS_JSON")} → Edit`);
  console.log(`  2. Cole o valor abaixo (linha inteira) e salve para o ambiente Production.`);
  console.log(`  3. Faça um ${bold("Redeploy")} (Deployments → ⋯ → Redeploy). Sem isso a mudança NÃO vale.\n`);
  console.log(envValue(users));
  console.log(dim(`\n(Valor também disponível a qualquer momento com: npm run admin -- exportar)`));
}

function findIndex(users: StoredUser[], email: string): number {
  const i = users.findIndex((u) => u.email === normalizeEmail(email));
  if (i < 0) fail(`Usuário não encontrado: ${email}`);
  return i;
}

function parseExpiry(value: string | boolean | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === true || value === "nunca") return null;
  const v = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isNaN(Date.parse(v))) fail("Data inválida. Use AAAA-MM-DD (ex.: 2026-12-31) ou 'nunca'.");
  if (expiryInstant(v) === null || Number.isNaN(expiryInstant(v)!)) fail("Data inválida.");
  return v;
}

function describe(u: StoredUser): string {
  const exp = expiryInstant(u.expiresAt);
  const expired = exp !== null && Date.now() > exp;
  const status = !u.active ? red("desativado") : expired ? yellow("expirado") : green("ativo");
  const validity = u.expiresAt ? `válido até ${u.expiresAt}` : "sem data de expiração";
  return `${u.email}${u.name ? ` (${u.name})` : ""} — ${status}, ${validity}`;
}

// ---------- comandos ----------

async function main() {
  const { command, positional, flags } = parseArgs(process.argv.slice(2));
  const file = usersFile(flags);

  switch (command) {
    case "hash": {
      const { password } = await obtainPassword(flags);
      console.log(await bcrypt.hash(password, BCRYPT_COST));
      return;
    }
    case "gerar-senha": {
      console.log(generatePassword());
      return;
    }
    case "segredo": {
      console.log(randomBytes(32).toString("base64"));
      return;
    }
    case "adicionar": {
      const email = positional[0];
      if (!email) fail("Informe o e-mail: npm run admin -- adicionar comprador@exemplo.com");
      const users = loadUsers(file);
      if (users.some((u) => u.email === normalizeEmail(email))) fail("Este e-mail já está cadastrado. Use o comando 'senha' para trocar a senha.");
      const { password, generated } = await obtainPassword(flags);
      const user: StoredUser = {
        email: normalizeEmail(email),
        passwordHash: await bcrypt.hash(password, BCRYPT_COST),
        active: true,
      };
      const expiresAt = parseExpiry(flags.expira);
      if (expiresAt) user.expiresAt = expiresAt;
      if (typeof flags.nome === "string") user.name = flags.nome.trim();
      users.push(user);
      saveUsers(file, users);
      console.log(green(`✓ Usuário adicionado em ${file}: ${describe(user)}`));
      if (generated) console.log(`${bold("Senha inicial")} (envie ao comprador por um canal privado): ${bold(password)}`);
      printNextSteps(users, flags);
      return;
    }
    case "senha": {
      const email = positional[0] ?? fail("Informe o e-mail.");
      const users = loadUsers(file);
      const i = findIndex(users, email);
      const { password, generated } = await obtainPassword(flags);
      users[i].passwordHash = await bcrypt.hash(password, BCRYPT_COST);
      saveUsers(file, users);
      console.log(green(`✓ Senha alterada: ${users[i].email}. As sessões abertas com a senha antiga serão encerradas após o redeploy.`));
      if (generated) console.log(`${bold("Nova senha")}: ${bold(password)}`);
      printNextSteps(users, flags);
      return;
    }
    case "desativar":
    case "ativar": {
      const email = positional[0] ?? fail("Informe o e-mail.");
      const users = loadUsers(file);
      const i = findIndex(users, email);
      users[i].active = command === "ativar";
      saveUsers(file, users);
      console.log(green(`✓ ${describe(users[i])}`));
      printNextSteps(users, flags);
      return;
    }
    case "validade": {
      const [email, date] = positional;
      if (!email || !date) fail("Uso: npm run admin -- validade <email> <AAAA-MM-DD|nunca>");
      const users = loadUsers(file);
      const i = findIndex(users, email);
      const expiresAt = parseExpiry(date);
      if (expiresAt) users[i].expiresAt = expiresAt;
      else delete users[i].expiresAt;
      saveUsers(file, users);
      console.log(green(`✓ ${describe(users[i])}`));
      printNextSteps(users, flags);
      return;
    }
    case "remover": {
      const email = positional[0] ?? fail("Informe o e-mail.");
      const users = loadUsers(file);
      const i = findIndex(users, email);
      const [removed] = users.splice(i, 1);
      saveUsers(file, users);
      console.log(green(`✓ Removido: ${removed.email}`));
      printNextSteps(users, flags);
      return;
    }
    case "listar": {
      const users = loadUsers(file);
      if (users.length === 0) console.log(dim(`Nenhum usuário em ${file}.`));
      users.forEach((u) => console.log(`• ${describe(u)}`));
      return;
    }
    case "exportar": {
      const users = loadUsers(file);
      if (flags.json) console.log(JSON.stringify(users));
      else console.log(envValue(users));
      if (flags["env-local"]) writeEnvLocal(users);
      return;
    }
    case "importar": {
      // Recria o arquivo local a partir do valor atual da Vercel (copiado do painel).
      const raw = await askHidden("Cole o valor atual de AUTH_USERS_JSON e tecle Enter: ");
      const json = raw.trim().startsWith("base64:") ? Buffer.from(raw.trim().slice(7), "base64").toString("utf8") : raw;
      let data: unknown;
      try {
        data = JSON.parse(json);
      } catch {
        fail("Valor inválido.");
      }
      const parsed = authUsersSchema.safeParse(data);
      if (!parsed.success) fail("Valor inválido: " + parsed.error.issues[0]?.message);
      if (existsSync(file) && !flags.sobrescrever) fail(`${file} já existe. Use --sobrescrever para substituir.`);
      saveUsers(file, parsed.data.map(toStored));
      console.log(green(`✓ ${parsed.data.length} usuário(s) importado(s) para ${file}.`));
      return;
    }
    case "ajuda":
    default:
      console.log(`${bold("Administração de acessos — Jogos da Ana")}

  npm run admin -- ${bold("adicionar")} <email> [--nome "Nome"] [--expira AAAA-MM-DD] [--gerar-senha]
  npm run admin -- ${bold("senha")} <email> [--gerar-senha]        Altera a senha
  npm run admin -- ${bold("desativar")} <email>                     Bloqueia o acesso
  npm run admin -- ${bold("ativar")} <email>                        Reativa o acesso
  npm run admin -- ${bold("validade")} <email> <AAAA-MM-DD|nunca>   Define/remove a expiração
  npm run admin -- ${bold("remover")} <email>                       Exclui o usuário
  npm run admin -- ${bold("listar")}                                Lista usuários e status
  npm run admin -- ${bold("exportar")} [--json]                     Valor para AUTH_USERS_JSON
  npm run admin -- ${bold("importar")} [--sobrescrever]             Recria o arquivo local a partir da Vercel
  npm run admin -- ${bold("hash")}                                  Gera o hash bcrypt de uma senha
  npm run admin -- ${bold("gerar-senha")}                           Sugere uma senha forte
  npm run admin -- ${bold("segredo")}                               Gera um AUTH_SECRET

Opções gerais:
  --arquivo <caminho>   Arquivo de usuários (padrão: usuarios.local.json)
  --env-local           Também atualiza AUTH_USERS_JSON no .env.local (desenvolvimento)
`);
      if (command !== "ajuda") process.exitCode = 1;
  }
}

main().catch((error: unknown) => fail(error instanceof Error ? error.message : String(error)));
