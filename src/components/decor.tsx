import { cn } from "@/lib/cn";

/** Formas orgânicas suaves para fundos. Puramente decorativas. */
export function Blob({ className, color = "#f5e9ee", variant = 0 }: { className?: string; color?: string; variant?: 0 | 1 | 2 }) {
  const paths = [
    "M43.6,-58.4C55.4,-50.9,63,-36.4,67.6,-20.9C72.2,-5.4,73.8,11.1,67.9,24.4C62,37.7,48.6,47.8,34.4,55.6C20.2,63.4,5.1,68.9,-10.6,68.4C-26.3,67.9,-42.6,61.4,-53.4,49.7C-64.2,38,-69.6,21.1,-70.2,4.4C-70.8,-12.3,-66.7,-28.8,-56.6,-37.4C-46.5,-46,-30.5,-46.7,-16.4,-53C-2.3,-59.3,9.8,-71.2,22.7,-71.8C35.6,-72.4,49.2,-61.6,43.6,-58.4Z",
    "M38.9,-48.6C50.7,-41.6,60.6,-30.5,65.2,-17.1C69.8,-3.7,69.1,12,62.3,24.5C55.5,37,42.6,46.3,28.9,53.1C15.2,59.9,0.7,64.2,-14.9,62.7C-30.5,61.2,-47.2,53.9,-56.7,41.1C-66.2,28.3,-68.5,10,-65.3,-6.6C-62.1,-23.2,-53.4,-38.1,-41,-45.1C-28.6,-52.1,-12.5,-51.2,1.4,-52.9C15.3,-54.6,27.1,-55.6,38.9,-48.6Z",
    "M47.1,-56.2C59.2,-46.1,65.4,-29.2,67.5,-12.4C69.6,4.4,67.6,21.1,59.4,33.8C51.2,46.5,36.8,55.2,21.2,61.1C5.6,67,-11.2,70.1,-25.6,65.1C-40,60.1,-52,47,-59.9,31.9C-67.8,16.8,-71.6,-0.3,-67.4,-15.2C-63.2,-30.1,-51,-42.8,-37.5,-52.5C-24,-62.2,-9.2,-68.9,4.9,-74.7C19,-80.5,35,-66.3,47.1,-56.2Z",
  ];
  return (
    <svg viewBox="-80 -80 160 160" aria-hidden="true" className={cn("pointer-events-none absolute", className)}>
      <path d={paths[variant]} fill={color} />
    </svg>
  );
}

export function Sparkle({ className, color = "#c39eb0" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("pointer-events-none", className)}>
      <path d="M12 1.5c.6 4.8 2.7 7.2 7.5 7.9-4.8.7-6.9 3.1-7.5 7.9-.6-4.8-2.7-7.2-7.5-7.9 4.8-.7 6.9-3.1 7.5-7.9Z" fill={color} />
    </svg>
  );
}

export function Squiggle({ className, color = "#a8c4b5" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 120 24" aria-hidden="true" className={cn("pointer-events-none", className)}>
      <path
        d="M2 12c9-10 18-10 27 0s18 10 27 0 18-10 27 0 18 10 27 0"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
