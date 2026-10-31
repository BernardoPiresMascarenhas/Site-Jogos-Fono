import type { AccentKey } from "@/content/types";

/** Classes de cor por destaque (strings completas para o Tailwind detectar). */
export const ACCENTS: Record<
  AccentKey,
  { soft: string; tint: string; ring: string; text: string; solid: string; dot: string; hex: string }
> = {
  rose: {
    soft: "bg-rose-100",
    tint: "bg-rose-50",
    ring: "ring-rose-300",
    text: "text-rose-700",
    solid: "bg-rose-600",
    dot: "bg-rose-400",
    hex: "#c39eb0",
  },
  sage: {
    soft: "bg-sage-100",
    tint: "bg-sage-50",
    ring: "ring-sage-300",
    text: "text-sage-700",
    solid: "bg-sage-600",
    dot: "bg-sage-400",
    hex: "#a8c4b5",
  },
  butter: {
    soft: "bg-butter-100",
    tint: "bg-[#fdf8ea]",
    ring: "ring-butter-300",
    text: "text-butter-700",
    solid: "bg-butter-600",
    dot: "bg-butter-300",
    hex: "#f2d68f",
  },
  sky: {
    soft: "bg-sky-100",
    tint: "bg-[#f1f6fa]",
    ring: "ring-sky-300",
    text: "text-sky-700",
    solid: "bg-sky-600",
    dot: "bg-sky-300",
    hex: "#b5cde0",
  },
  peach: {
    soft: "bg-peach-100",
    tint: "bg-[#fdf3ee]",
    ring: "ring-peach-300",
    text: "text-peach-700",
    solid: "bg-peach-600",
    dot: "bg-peach-300",
    hex: "#f2b8a0",
  },
  lilac: {
    soft: "bg-lilac-100",
    tint: "bg-[#f6f3fa]",
    ring: "ring-lilac-300",
    text: "text-lilac-700",
    solid: "bg-lilac-600",
    dot: "bg-lilac-300",
    hex: "#cbbde3",
  },
};
