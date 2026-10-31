"use client";

import { useLayoutEffect, useRef, useState } from "react";

export interface FitGrid {
  cols: number;
  rows: number;
  /** Largura de cada célula em px (0 antes da primeira medição). */
  cellWidth: number;
}

/**
 * Calcula quantas colunas usar para que `count` células com a proporção
 * `aspect` (largura/altura) fiquem o maior possível dentro do contêiner,
 * sem rolagem — adapta-se a retrato, paisagem, tablet e celular.
 */
export function computeFitGrid(
  count: number,
  width: number,
  height: number,
  aspect: number,
  gap: number,
  maxCell = 240,
): FitGrid {
  let best: FitGrid = { cols: Math.min(count, 3), rows: Math.ceil(count / 3), cellWidth: 0 };
  // Prefere grades completas (ex.: 3×2 em vez de 5+1). Só aceita linhas
  // incompletas quando a quantidade não tem divisores úteis (ex.: 5 ou 7).
  const hasFullLayout = Array.from({ length: count - 2 }, (_, i) => i + 2).some((c) => count % c === 0);
  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);
    const empty = rows * cols - count;
    if (hasFullLayout ? empty !== 0 : empty >= cols) continue;
    const byWidth = (width - gap * (cols - 1)) / cols;
    const byHeight = ((height - gap * (rows - 1)) / rows) * aspect;
    const cell = Math.min(byWidth, byHeight, maxCell);
    if (cell > best.cellWidth + 0.5) best = { cols, rows, cellWidth: Math.max(0, Math.floor(cell)) };
  }
  return best;
}

export function useFitGrid<T extends HTMLElement>(count: number, aspect: number, gap: number, maxCell?: number) {
  const ref = useRef<T>(null);
  const [grid, setGrid] = useState<FitGrid | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setGrid(computeFitGrid(count, width, height, aspect, gap, maxCell));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [count, aspect, gap, maxCell]);

  return { ref, grid };
}
