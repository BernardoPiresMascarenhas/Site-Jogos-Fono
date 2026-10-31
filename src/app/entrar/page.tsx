import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Blob, Sparkle } from "@/components/decor";
import { Logo } from "@/components/logo";
import { Media } from "@/components/media";
import { siteConfig } from "@/config/site";
import { getConcept } from "@/content/concepts";
import type { Concept } from "@/content/types";
import { getCurrentUser } from "@/lib/auth/dal";
import { safeRedirectPath } from "@/lib/auth/schemas";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/entrar">) {
  const params = await searchParams;
  const redirectTo = safeRedirectPath(params.de);
  if (await getCurrentUser()) redirect(redirectTo);

  const loggedOut = params.saiu === "1";
  const art = ["sapo", "uva", "balao", "dente", "carro", "ursinho"].map((id) => getConcept(id) as Concept);

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-rose-100 lg:block" aria-hidden="true">
        <Blob className="-left-24 -top-24 h-[28rem] w-[28rem]" color="#ead2dc" />
        <Blob className="-bottom-32 -right-24 h-[30rem] w-[30rem]" color="#e8efe8" variant={2} />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo size="md" />
          <div className="mx-auto grid w-full max-w-sm grid-cols-3 gap-4">
            {art.map((concept, i) => (
              <div
                key={concept.id}
                className="animate-float-slow flex aspect-square items-center justify-center rounded-[1.75rem] bg-white shadow-soft"
                style={{ "--r": `${(i % 2 ? 1 : -1) * (3 + i)}deg`, animationDelay: `${i * 0.5}s` } as React.CSSProperties}
              >
                <Media media={concept.media} size={64} decorative className="h-3/5 w-3/5" />
              </div>
            ))}
          </div>
          <div>
            <p className="font-display-soft text-3xl font-semibold leading-tight text-ink">
              Cada sessão, uma nova
              <br />
              descoberta.
            </p>
            <p className="mt-3 max-w-sm text-ink-soft">{siteConfig.tagline}.</p>
          </div>
        </div>
        <Sparkle className="absolute right-16 top-24 h-8 w-8" color="#b58a9d" />
      </aside>

      <main className="relative flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold text-ink-soft hover:text-ink">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Início
          </Link>
          <Logo size="sm" className="lg:hidden" />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <h1 className="font-display-soft text-4xl font-semibold tracking-tight">Que bom ver você!</h1>
            <p className="mt-2 text-ink-soft">Entre com o e-mail e a senha que você recebeu.</p>
            {loggedOut && (
              <p role="status" className="mt-6 rounded-2xl bg-sage-100 px-4 py-3 text-sm font-semibold text-sage-800">
                Você saiu da plataforma. Até a próxima!
              </p>
            )}
            <LoginForm redirectTo={redirectTo} />
            <p className="mt-8 text-sm text-ink-faint">
              Ainda não tem acesso? A plataforma é vendida diretamente pela{" "}
              <a
                href={siteConfig.owner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-rose-700 underline-offset-4 hover:underline"
              >
                {siteConfig.owner.name}
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
