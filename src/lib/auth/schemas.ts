import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ message: "Informe seu e-mail" })
    .trim()
    .min(1, "Informe seu e-mail")
    .max(254, "E-mail muito longo")
    .pipe(z.email({ message: "Digite um e-mail válido" })),
  password: z
    .string({ message: "Informe sua senha" })
    .min(1, "Informe sua senha")
    .max(200, "Senha muito longa"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Aceita apenas caminhos internos (evita redirecionamento para sites externos). */
export function safeRedirectPath(value: unknown, fallback = "/biblioteca"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value.startsWith("/api/") || value.startsWith("/entrar")) return fallback;
  return value;
}
