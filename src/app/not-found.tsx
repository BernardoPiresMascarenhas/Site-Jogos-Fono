import Link from "next/link";
import { buttonClasses } from "@/components/button";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <LogoMark className="h-20 w-20" />
      <h1 className="mt-6 font-display-soft text-4xl font-semibold">Página não encontrada</h1>
      <p className="mt-2 max-w-md text-ink-soft">Essa página não existe ou foi movida.</p>
      <Link href="/biblioteca" className={buttonClasses("primary", "lg", "mt-8")}>
        Ir para a biblioteca
      </Link>
    </main>
  );
}
