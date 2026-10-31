import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { siteConfig } from "@/config/site";
import { verifyPassword } from "@/lib/auth/password";
import { clientIp, createLoginRateLimiter } from "@/lib/auth/rate-limit";
import { loginSchema } from "@/lib/auth/schemas";
import { checkSession } from "@/lib/auth/session-policy";
import { accessStatus, credentialVersion, findUser, normalizeEmail } from "@/lib/auth/users";

declare module "next-auth" {
  interface User {
    cv?: string;
  }
  interface Session {
    user: { email: string; name?: string | null } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    cv?: string;
    loginAt?: number;
  }
}

/** Erro específico para muitas tentativas (a mensagem exibida continua genérica). */
export class TooManyAttempts extends CredentialsSignin {
  code = "too_many_attempts";
}

const limiter = createLoginRateLimiter(siteConfig.loginRateLimit);

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: siteConfig.session.maxAgeSeconds,
    // Igual a maxAge: o cookie nunca é reemitido em segundo plano (sem renovação).
    updateAge: siteConfig.session.maxAgeSeconds,
  },
  pages: { signIn: "/entrar", error: "/entrar" },
  logger: {
    // Nunca registra credenciais: o Auth.js só recebe mensagens de erro aqui.
    error(error) {
      if (error.name === "CredentialsSignin" || error.name === "TooManyAttempts") return;
      console.error(`[auth] ${error.name}: ${error.message}`);
    },
    warn(code) {
      if (code !== "debug-enabled") console.warn(`[auth] aviso: ${code}`);
    },
    debug() {},
  },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw, request) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = normalizeEmail(parsed.data.email);
        const ip = clientIp(request?.headers);
        if (limiter.isBlocked(email, ip)) throw new TooManyAttempts();

        const user = findUser(email);
        const passwordOk = await verifyPassword(parsed.data.password, user?.passwordHash);
        if (!user || !passwordOk || accessStatus(user) !== "ok") {
          limiter.recordFailure(email, ip);
          return null;
        }

        limiter.recordSuccess(email, ip);
        return { id: user.email, email: user.email, name: user.name ?? null, cv: credentialVersion(user) };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.email ?? undefined;
        token.email = user.email;
        token.name = user.name;
        token.cv = user.cv;
        token.loginAt = Math.floor(Date.now() / 1000);
      }
      // Revalida a cada leitura: usuário removido, desativado, expirado ou com
      // senha alterada perde a sessão imediatamente (retornar null encerra a sessão).
      const check = checkSession(token);
      if (!check.ok) return null;
      token.name = check.user.name ?? null;
      return token;
    },
    session({ session, token }) {
      session.user.email = token.email ?? "";
      session.user.name = token.name ?? null;
      return session;
    },
  },
});
