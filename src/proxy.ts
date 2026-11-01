import { NextResponse, type NextRequest } from "next/server";
import { decode } from "next-auth/jwt";
import { checkSession } from "@/lib/auth/session-policy";

/**
 * Primeira barreira: bloqueia rotas privadas antes de renderizar.
 * Apenas LÊ e valida o cookie de sessão (assinatura, expiração e situação atual
 * do usuário). Nunca grava cookies, para que uma requisição em andamento
 * (ex.: prefetch de link) não recrie a sessão logo depois do logout.
 * As páginas também verificam a sessão no servidor (requireUser).
 */
export default async function proxy(req: NextRequest) {
  const secure = req.nextUrl.protocol === "https:";
  const cookieName = secure ? "__Secure-authjs.session-token" : "authjs.session-token";
  const raw = req.cookies.get(cookieName)?.value;

  let valid = false;
  if (raw && process.env.AUTH_SECRET) {
    try {
      const token = await decode({ token: raw, secret: process.env.AUTH_SECRET, salt: cookieName });
      valid = checkSession(token).ok;
    } catch {
      valid = false;
    }
  }
  if (valid) return NextResponse.next();

  const url = new URL("/entrar", req.nextUrl.origin);
  url.searchParams.set("de", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/biblioteca/:path*", "/jogar/:path*", "/jogos/:path*"],
};
