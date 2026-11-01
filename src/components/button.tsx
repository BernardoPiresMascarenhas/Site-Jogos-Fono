import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "soft";
type Size = "sm" | "md" | "lg" | "xl";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-teal-700 text-white shadow-[0_6px_0_-1px_var(--color-teal-800)] hover:bg-teal-800 active:translate-y-[3px] active:shadow-[0_3px_0_-1px_var(--color-teal-800)]",
  secondary:
    "bg-white text-ink ring-1 ring-sand-300 shadow-soft hover:ring-teal-300 hover:bg-teal-50 active:translate-y-px",
  soft: "bg-teal-50 text-teal-800 hover:bg-teal-100 active:translate-y-px",
  ghost: "text-ink-soft hover:bg-sand-100 hover:text-ink",
};

const SIZES: Record<Size, string> = {
  sm: "h-10 px-4 text-sm gap-2 rounded-xl",
  md: "h-12 px-5 text-base gap-2 rounded-2xl",
  lg: "h-14 px-7 text-lg gap-2.5 rounded-2xl",
  xl: "h-16 px-8 text-xl gap-3 rounded-3xl",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex select-none items-center justify-center font-bold transition-[background-color,box-shadow,transform,color] duration-150 ease-out disabled:opacity-60 disabled:pointer-events-none",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}
