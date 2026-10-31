"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/button";
import { LogoMark } from "@/components/logo";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <LogoMark className="h-20 w-20" />
      <h1 className="mt-6 font-display-soft text-4xl font-semibold">Algo não saiu como esperado</h1>
      <p className="mt-2 max-w-md text-ink-soft">Tente novamente. Se o problema continuar, recarregue a página.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className={buttonClasses("primary", "lg")}>
          Tentar novamente
        </button>
        <Link href="/biblioteca" className={buttonClasses("secondary", "lg")}>
          Voltar à biblioteca
        </Link>
      </div>
    </main>
  );
}
