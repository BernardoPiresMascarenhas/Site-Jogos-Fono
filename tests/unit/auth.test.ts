import bcrypt from "bcryptjs";
import { beforeAll, describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import { verifyPassword } from "@/lib/auth/password";
import { createLoginRateLimiter } from "@/lib/auth/rate-limit";
import { safeRedirectPath } from "@/lib/auth/schemas";
import { checkSession } from "@/lib/auth/session-policy";
import { accessStatus, credentialVersion, expiryInstant, parseUsers, type AuthUser } from "@/lib/auth/users";

let hash: string;
let users: AuthUser[];

beforeAll(async () => {
  hash = await bcrypt.hash("senha-correta-123", 4);
  users = [
    { email: "ativa@exemplo.com", passwordHash: hash, active: true },
    { email: "inativa@exemplo.com", passwordHash: hash, active: false },
    { email: "expirada@exemplo.com", passwordHash: hash, active: true, expiresAt: "2020-01-31" },
  ];
});

describe("configuração de usuários", () => {
  it("aceita JSON e base64, normalizando e-mails", () => {
    const json = JSON.stringify([{ email: "  Pessoa@Exemplo.COM ", passwordHash: hash }]);
    for (const raw of [json, `base64:${Buffer.from(json).toString("base64")}`]) {
      const r = parseUsers(raw);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.users[0]).toMatchObject({ email: "pessoa@exemplo.com", active: true });
    }
  });

  it("rejeita senha em texto puro, duplicados e JSON inválido sem vazar dados", () => {
    const plain = parseUsers(JSON.stringify([{ email: "a@b.com", passwordHash: "minhasenha" }]));
    expect(plain.ok).toBe(false);
    if (!plain.ok) expect(plain.error).not.toContain("minhasenha");
    const dup = parseUsers(JSON.stringify([{ email: "a@b.com", passwordHash: hash }, { email: "A@b.com", passwordHash: hash }]));
    expect(dup.ok).toBe(false);
    expect(parseUsers("{oops").ok).toBe(false);
    expect(parseUsers(undefined).ok).toBe(false);
  });

  it("data sem horário vale até o fim do dia em Brasília", () => {
    const end = expiryInstant("2026-12-31")!;
    expect(new Date(end).toISOString()).toBe("2027-01-01T02:59:59.999Z");
    const u = { email: "x@y.com", passwordHash: hash, active: true, expiresAt: "2026-12-31" };
    expect(accessStatus(u, Date.parse("2026-12-31T23:00:00-03:00"))).toBe("ok");
    expect(accessStatus(u, Date.parse("2027-01-01T00:00:01-03:00"))).toBe("expired");
  });
});

describe("senha", () => {
  it("verifica corretamente e trata usuário inexistente", async () => {
    expect(await verifyPassword("senha-correta-123", hash)).toBe(true);
    expect(await verifyPassword("errada", hash)).toBe(false);
    expect(await verifyPassword("qualquer", undefined)).toBe(false);
  });
});

describe("revalidação de sessão", () => {
  const now = Date.now();
  const token = (email: string, extra: Record<string, unknown> = {}) => ({
    email,
    cv: credentialVersion({ email, passwordHash: hash }),
    loginAt: Math.floor(now / 1000),
    ...extra,
  });

  it("aceita sessão válida", () => {
    expect(checkSession(token("ativa@exemplo.com"), users, now).ok).toBe(true);
  });

  it("encerra sessão de usuário desativado, expirado ou removido", () => {
    expect(checkSession(token("inativa@exemplo.com"), users, now)).toMatchObject({ ok: false, reason: "inactive" });
    expect(checkSession(token("expirada@exemplo.com"), users, now)).toMatchObject({ ok: false, reason: "expired" });
    expect(checkSession(token("sumiu@exemplo.com"), users, now)).toMatchObject({ ok: false, reason: "unknown" });
  });

  it("encerra sessão quando a senha é trocada", () => {
    const changed = [{ ...users[0], passwordHash: hash.replace(/.$/, (c) => (c === "a" ? "b" : "a")) }];
    expect(checkSession(token("ativa@exemplo.com"), changed, now)).toMatchObject({ ok: false, reason: "credentials-changed" });
  });

  it("respeita o limite absoluto da sessão", () => {
    const old = token("ativa@exemplo.com", { loginAt: Math.floor(now / 1000) - siteConfig.session.maxAgeSeconds - 60 });
    expect(checkSession(old, users, now)).toMatchObject({ ok: false, reason: "too-old" });
  });

  it("rejeita token incompleto", () => {
    expect(checkSession({ email: "ativa@exemplo.com" }, users, now).ok).toBe(false);
    expect(checkSession(null, users, now).ok).toBe(false);
  });
});

describe("limitador de tentativas (melhor esforço, em memória)", () => {
  it("bloqueia após o limite por e-mail+IP e libera após a janela", () => {
    const rl = createLoginRateLimiter({ windowMs: 1000, maxAttemptsPerEmailAndIp: 3, maxAttemptsPerIp: 10 });
    for (let i = 0; i < 3; i++) rl.recordFailure("a@b.com", "1.1.1.1", 0);
    expect(rl.isBlocked("a@b.com", "1.1.1.1", 10)).toBe(true);
    expect(rl.isBlocked("c@d.com", "1.1.1.1", 10)).toBe(false);
    expect(rl.isBlocked("a@b.com", "1.1.1.1", 2000)).toBe(false);
  });

  it("bloqueia um IP que tenta muitos e-mails", () => {
    const rl = createLoginRateLimiter({ windowMs: 1000, maxAttemptsPerEmailAndIp: 100, maxAttemptsPerIp: 5 });
    for (let i = 0; i < 5; i++) rl.recordFailure(`u${i}@b.com`, "2.2.2.2", 0);
    expect(rl.isBlocked("novo@b.com", "2.2.2.2", 1)).toBe(true);
  });
});

describe("redirecionamento seguro", () => {
  it("aceita apenas caminhos internos", () => {
    expect(safeRedirectPath("/jogar/x?nivel=facil")).toBe("/jogar/x?nivel=facil");
    expect(safeRedirectPath("//evil.com")).toBe("/biblioteca");
    expect(safeRedirectPath("https://evil.com")).toBe("/biblioteca");
    expect(safeRedirectPath("/\\evil.com")).toBe("/biblioteca");
    expect(safeRedirectPath(undefined)).toBe("/biblioteca");
  });
});
