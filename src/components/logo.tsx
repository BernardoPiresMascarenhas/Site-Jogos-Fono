import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import simbolo from "../../public/marca/simbolo.png";
import nome from "../../public/marca/logo-nome.png";
import completa from "../../public/marca/logo-completa.png";
import compacta from "../../public/marca/logo-compacta.png";

/*
 * Marca Brinque & Descomplique.
 * Todas as imagens são recortes da logo oficial (public/logo), com o fundo
 * branco removido por scripts/preparar-logo.py. As letras da logo nunca são
 * recriadas com fonte. Tamanhos definidos pela ALTURA, com largura automática,
 * para não distorcer.
 */

/** Símbolo: as três peças do quebra-cabeça. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src={simbolo}
      alt=""
      aria-hidden="true"
      sizes="96px"
      className={cn("h-10 w-auto shrink-0 select-none object-contain", className)}
      draggable={false}
    />
  );
}

const SIZES = {
  // cabeçalhos: símbolo + nome lado a lado (a logo inteira ficaria ilegível em 40 px)
  sm: { mark: "h-7 sm:h-9", name: "h-10 sm:h-12" },
  md: { mark: "h-8 sm:h-10", name: "h-11 sm:h-14" },
} as const;

/** Versão horizontal compacta para cabeçalhos. */
export function Logo({ className, size = "md" }: { className?: string; size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex items-center gap-1.5 sm:gap-2", className)}>
      <LogoMark className={s.mark} />
      <Image
        src={nome}
        alt={siteConfig.name}
        sizes="(min-width: 640px) 140px, 100px"
        priority
        className={cn("w-auto select-none object-contain", s.name)}
        draggable={false}
      />
    </span>
  );
}

/** Logo completa (com "Recursos Terapêuticos") ou compacta (sem o subtítulo). */
export function LogoFull({ variant = "completa", className, priority }: { variant?: "completa" | "compacta"; className?: string; priority?: boolean }) {
  return (
    <Image
      src={variant === "completa" ? completa : compacta}
      alt={variant === "completa" ? `${siteConfig.name} — ${siteConfig.subtitle}` : siteConfig.name}
      sizes="(min-width: 1024px) 320px, 240px"
      priority={priority}
      className={cn("h-auto select-none object-contain", className)}
      draggable={false}
    />
  );
}
