import { LogoMark } from "@/components/logo";

export default function Loading() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-sand-50" role="status">
      <LogoMark className="h-16 w-16 animate-bounce" />
      <p className="font-bold text-ink-soft">Preparando o jogo…</p>
    </div>
  );
}
