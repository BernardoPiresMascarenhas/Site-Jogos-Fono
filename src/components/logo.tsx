import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

/** Marca: balão de fala (comunicação) com sorriso e uma folha sálvia. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("shrink-0", className)}>
      <path
        d="M24 5c10.8 0 19 7.4 19 17s-8.2 17-19 17c-2 0-3.9-.2-5.7-.7L10 42.6c-.9.4-1.8-.4-1.5-1.3l2-6.4C7 31.9 5 27.2 5 22 5 12.4 13.2 5 24 5Z"
        fill="#c39eb0"
      />
      <path
        d="M24 8c9.4 0 16 6.3 16 14s-6.6 14-16 14c-2 0-4-.3-5.8-.8l-5.6 2.8 1.4-4.5C10.8 30.9 8 26.9 8 22 8 14.3 14.6 8 24 8Z"
        fill="#d8bcca"
        opacity=".55"
      />
      <circle cx="18.5" cy="20" r="2.3" fill="#2d2a32" />
      <circle cx="29.5" cy="20" r="2.3" fill="#2d2a32" />
      <path d="M17.5 26.2c3.6 3.6 9.4 3.6 13 0" fill="none" stroke="#2d2a32" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M37.5 3.5c3.6.2 6.6 2.9 6.9 6.6-3.7.2-6.8-2.6-6.9-6.6Z" fill="#8aab98" />
    </svg>
  );
}

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const mark = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" }[size];
  const text = { sm: "text-lg", md: "text-xl", lg: "text-3xl" }[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={mark} />
      <span className={cn("font-display-soft font-semibold tracking-tight text-ink", text)}>{siteConfig.name}</span>
    </span>
  );
}
