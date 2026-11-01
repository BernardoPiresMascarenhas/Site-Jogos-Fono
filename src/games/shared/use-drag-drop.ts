"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Distância mínima (px) para um toque virar arrasto. */
const DRAG_THRESHOLD = 8;

interface DragState<T> {
  item: T;
  x: number;
  y: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  over: string | null;
}

/**
 * Arrastar e soltar com eventos de ponteiro (mouse, toque e caneta), sem
 * bibliotecas. É sempre um COMPLEMENTO: todo jogo também funciona tocando no
 * item e depois no destino (e por teclado, já que os itens são botões).
 *
 * Destinos são elementos com o atributo `data-drop="<id>"`.
 */
export function useDragDrop<T>({ enabled, onDrop }: { enabled: boolean; onDrop: (item: T, target: string) => void }) {
  const [drag, setDrag] = useState<DragState<T> | null>(null);
  const dragRef = useRef<DragState<T> | null>(null);
  const pending = useRef<{ item: T; x: number; y: number; rect: DOMRect; pointerId: number } | null>(null);
  const suppressClick = useRef(false);
  const onDropRef = useRef(onDrop);
  useEffect(() => {
    onDropRef.current = onDrop;
  }, [onDrop]);

  const targetAt = (x: number, y: number): string | null => {
    for (const el of document.elementsFromPoint(x, y)) {
      const drop = (el as HTMLElement).closest?.("[data-drop]") as HTMLElement | null;
      if (drop?.dataset.drop) return drop.dataset.drop;
    }
    return null;
  };

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      const p = pending.current;
      if (!p || e.pointerId !== p.pointerId) return;
      if (!dragRef.current && Math.hypot(e.clientX - p.x, e.clientY - p.y) < DRAG_THRESHOLD) return;
      const next: DragState<T> = {
        item: p.item,
        x: e.clientX,
        y: e.clientY,
        width: p.rect.width,
        height: p.rect.height,
        offsetX: p.x - p.rect.left,
        offsetY: p.y - p.rect.top,
        over: targetAt(e.clientX, e.clientY),
      };
      dragRef.current = next;
      setDrag(next);
    };
    const up = (e: PointerEvent) => {
      const p = pending.current;
      if (!p || e.pointerId !== p.pointerId) return;
      pending.current = null;
      const current = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!current) return;
      // O clique que o navegador dispara logo após soltar não deve contar como toque.
      suppressClick.current = true;
      setTimeout(() => {
        suppressClick.current = false;
      }, 0);
      const target = targetAt(e.clientX, e.clientY);
      if (target) onDropRef.current(current.item, target);
    };
    const cancel = () => {
      pending.current = null;
      dragRef.current = null;
      setDrag(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [enabled]);

  /** Propriedades para um item arrastável. */
  const bind = useCallback(
    (item: T) => ({
      onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
        if (!enabled || (e.pointerType === "mouse" && e.button !== 0)) return;
        pending.current = { item, x: e.clientX, y: e.clientY, rect: e.currentTarget.getBoundingClientRect(), pointerId: e.pointerId };
      },
      onClickCapture: (e: React.MouseEvent) => {
        if (suppressClick.current) {
          suppressClick.current = false;
          e.preventDefault();
          e.stopPropagation();
        }
      },
    }),
    [enabled],
  );

  const ghostStyle: React.CSSProperties | undefined = drag
    ? {
        position: "fixed",
        left: drag.x - drag.offsetX,
        top: drag.y - drag.offsetY,
        width: drag.width,
        height: drag.height,
        pointerEvents: "none",
        zIndex: 60,
      }
    : undefined;

  return { bind, dragging: drag?.item ?? null, over: drag?.over ?? null, ghostStyle };
}
