import { DIFFICULTY_LABEL, type Difficulty } from "@/content/types";
import { cn } from "@/lib/cn";

const LEVEL: Record<Difficulty, number> = { facil: 1, medio: 2, dificil: 3 };

/** Indicador de dificuldade: barras + texto (não depende só de cor). */
export function DifficultyBadge({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  const level = LEVEL[difficulty];
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm font-bold text-ink-soft", className)}>
      <span className="flex items-end gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn("w-1.5 rounded-full", n <= level ? "bg-rose-600" : "bg-sand-300")}
            style={{ height: 6 + n * 4 }}
          />
        ))}
      </span>
      <span>
        <span className="sr-only">Dificuldade sugerida: </span>
        {DIFFICULTY_LABEL[difficulty]}
      </span>
    </span>
  );
}
