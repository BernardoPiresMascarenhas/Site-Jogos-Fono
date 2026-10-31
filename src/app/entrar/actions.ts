"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { signIn, signOut } from "@/auth";
import { loginSchema, safeRedirectPath } from "@/lib/auth/schemas";

export interface LoginState {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: { email?: string; password?: string };
  email?: string;
}

const GENERIC_ERROR =
  "Não foi possível entrar. Confira o e-mail e a senha. Se o problema continuar, fale com a responsável pela plataforma.";
const TOO_MANY = "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.";

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      fieldErrors: { email: flat.email?.[0], password: flat.password?.[0] },
      email: raw.email,
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeRedirectPath(formData.get("de")),
    });
  } catch (error) {
    if (error instanceof CredentialsSignin && error.code === "too_many_attempts") {
      return { status: "error", message: TOO_MANY, email: raw.email };
    }
    if (error instanceof AuthError) {
      return { status: "error", message: GENERIC_ERROR, email: raw.email };
    }
    throw error; // inclui o redirecionamento de sucesso do Next.js
  }
  return { status: "idle" };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/entrar?saiu=1" });
}
