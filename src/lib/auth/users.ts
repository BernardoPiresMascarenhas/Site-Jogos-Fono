/**
 * Usuários autorizados, lidos da variável de ambiente privada AUTH_USERS_JSON.
 * Nunca importe este módulo em componentes de cliente.
 *
 * Este arquivo não usa aliases de importação para poder ser reutilizado pela
 * ferramenta de linha de comando (scripts/admin.mts).
 */
import { createHash } from "node:crypto";
import { z } from "zod";

const BCRYPT_HASH = /^\$2[aby]\$(0[4-9]|[12]\d|3[01])\$[./A-Za-z0-9]{53}$/;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Fuso usado para datas sem horário ("2026-12-31" vale até 23:59 de Brasília). */
export const EXPIRY_TIMEZONE_OFFSET = "-03:00";

const expiresAtSchema = z
  .string()
  .trim()
  .refine((v) => (DATE_ONLY.test(v) ? !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) : !Number.isNaN(Date.parse(v))), {
    message: "Data inválida. Use AAAA-MM-DD ou data/hora ISO 8601.",
  });

export const authUserSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: "E-mail inválido" }).max(254)),
  passwordHash: z.string().regex(BCRYPT_HASH, { message: "passwordHash precisa ser um hash bcrypt" }),
  active: z.boolean().default(true),
  expiresAt: expiresAtSchema.nullish(),
  name: z.string().trim().max(60).optional(),
});

export const authUsersSchema = z.array(authUserSchema).superRefine((users, ctx) => {
  const seen = new Set<string>();
  users.forEach((u, i) => {
    if (seen.has(u.email)) {
      ctx.addIssue({ code: "custom", message: "E-mail duplicado", path: [i, "email"] });
    }
    seen.add(u.email);
  });
});

export type AuthUser = z.infer<typeof authUserSchema>;

/** Aceita JSON puro ou "base64:<json em base64>" (evita problemas com "$" em arquivos .env). */
export function decodeUsersValue(raw: string): unknown {
  const value = raw.trim();
  const json = value.startsWith("base64:") ? Buffer.from(value.slice(7), "base64").toString("utf8") : value;
  return JSON.parse(json);
}

export type ParseResult = { ok: true; users: AuthUser[] } | { ok: false; error: string };

/** Converte o valor da variável. Mensagens de erro nunca incluem hashes ou dados dos usuários. */
export function parseUsers(raw: string | undefined): ParseResult {
  if (!raw || !raw.trim()) return { ok: false, error: "AUTH_USERS_JSON não definido" };
  let data: unknown;
  try {
    data = decodeUsersValue(raw);
  } catch {
    return { ok: false, error: "AUTH_USERS_JSON não é um JSON válido" };
  }
  const parsed = authUsersSchema.safeParse(data);
  if (!parsed.success) {
    const where = parsed.error.issues
      .slice(0, 5)
      .map((i) => `[${i.path.join(".")}] ${i.message}`)
      .join("; ");
    const hint = parsed.error.issues.some((i) => i.path.at(-1) === "passwordHash") && !raw.trim().startsWith("base64:")
      ? ' — dica: use o valor "base64:..." gerado por "npm run admin -- exportar" (o "$" dos hashes pode ser corrompido em JSON puro)'
      : "";
    return { ok: false, error: `AUTH_USERS_JSON inválido: ${where}${hint}` };
  }
  return { ok: true, users: parsed.data };
}

let cache: { raw: string | undefined; users: AuthUser[] } | null = null;

/** Usuários configurados no ambiente atual (com cache por valor da variável). */
export function getConfiguredUsers(): AuthUser[] {
  const raw = process.env.AUTH_USERS_JSON;
  if (cache && cache.raw === raw) return cache.users;
  const result = parseUsers(raw);
  if (!result.ok) console.error(`[auth] ${result.error}. Nenhum login será aceito.`);
  cache = { raw, users: result.ok ? result.users : [] };
  return cache.users;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function findUser(email: string, users: AuthUser[] = getConfiguredUsers()): AuthUser | undefined {
  const target = normalizeEmail(email);
  return users.find((u) => u.email === target);
}

/** Momento exato em que o acesso expira (ou null se não expira). */
export function expiryInstant(expiresAt: string | null | undefined): number | null {
  if (!expiresAt) return null;
  if (DATE_ONLY.test(expiresAt)) return Date.parse(`${expiresAt}T23:59:59.999${EXPIRY_TIMEZONE_OFFSET}`);
  return Date.parse(expiresAt);
}

export type AccessStatus = "ok" | "inactive" | "expired";

export function accessStatus(user: AuthUser, now: number = Date.now()): AccessStatus {
  if (!user.active) return "inactive";
  const exp = expiryInstant(user.expiresAt);
  if (exp !== null && now > exp) return "expired";
  return "ok";
}

/**
 * Impressão digital da credencial atual. Fica dentro do token de sessão:
 * quando a senha é trocada, o valor muda e as sessões antigas deixam de valer.
 */
export function credentialVersion(user: Pick<AuthUser, "email" | "passwordHash">): string {
  return createHash("sha256").update(`${user.email}\n${user.passwordHash}`).digest("base64url").slice(0, 22);
}
