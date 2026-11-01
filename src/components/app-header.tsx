import Link from "next/link";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/entrar/actions";
import type { CurrentUser } from "@/lib/auth/dal";
import { Logo } from "./logo";

export function AppHeader({ user }: { user: CurrentUser }) {
  return (
    <header className="sticky top-0 z-30 border-b border-sand-200/80 bg-sand-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:h-[4.5rem]">
        <Link href="/biblioteca" aria-label="Biblioteca de jogos" className="rounded-xl">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[16rem] truncate text-sm text-ink-soft sm:block" title={user.email}>
            {user.email}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-ink-soft ring-1 ring-sand-300 transition hover:bg-white hover:text-ink"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
