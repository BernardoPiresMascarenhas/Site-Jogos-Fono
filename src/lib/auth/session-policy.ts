import { siteConfig } from "../../config/site";
import { accessStatus, credentialVersion, findUser, type AuthUser } from "./users";

export interface SessionTokenClaims {
  email?: string | null;
  cv?: unknown;
  loginAt?: unknown;
}

export type SessionCheck =
  | { ok: true; user: AuthUser }
  | { ok: false; reason: "missing" | "unknown" | "inactive" | "expired" | "credentials-changed" | "too-old" };

/**
 * Revalida uma sessão existente contra a configuração atual do servidor.
 * Executado a cada leitura de sessão (proxy, páginas e rotas protegidas).
 */
export function checkSession(
  token: SessionTokenClaims | null | undefined,
  users?: AuthUser[],
  now: number = Date.now(),
): SessionCheck {
  if (!token?.email || typeof token.cv !== "string" || typeof token.loginAt !== "number") {
    return { ok: false, reason: "missing" };
  }
  const user = findUser(token.email, users);
  if (!user) return { ok: false, reason: "unknown" };
  const status = accessStatus(user, now);
  if (status !== "ok") return { ok: false, reason: status };
  if (credentialVersion(user) !== token.cv) return { ok: false, reason: "credentials-changed" };
  if (now - token.loginAt * 1000 > siteConfig.session.maxAgeSeconds * 1000) {
    return { ok: false, reason: "too-old" };
  }
  return { ok: true, user };
}
