import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { findUser, accessStatus } from "./users";

export interface CurrentUser {
  email: string;
  name: string | null;
}

/**
 * Camada de acesso a dados da sessão. Toda página/rota privada chama esta função:
 * a proteção acontece no servidor, não apenas no redirecionamento do navegador.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  const user = findUser(email);
  if (!user || accessStatus(user) !== "ok") return null;
  return { email: user.email, name: user.name ?? null };
});

export async function requireUser(returnTo?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(returnTo ? `/entrar?de=${encodeURIComponent(returnTo)}` : "/entrar");
  return user;
}
