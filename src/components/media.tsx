"use client";

import Image from "next/image";
import { useState } from "react";
import type { Media as MediaData } from "@/content/types";
import { cn } from "@/lib/cn";

interface MediaProps {
  media: MediaData;
  /** Tamanho em px usado para reservar espaço (o CSS pode redimensionar). */
  size?: number;
  className?: string;
  /** Quando true, a imagem é decorativa e não é lida por leitores de tela. */
  decorative?: boolean;
  priority?: boolean;
}

/**
 * Exibe a imagem de um conceito. Aceita emoji, imagem local ou SVG local,
 * sempre com descrição acessível. Se o arquivo falhar, usa o emoji de reserva.
 */
export function Media({ media, size = 96, className, decorative = false, priority = false }: MediaProps) {
  const [failed, setFailed] = useState(false);
  const alt = decorative ? "" : media.alt;

  if (media.kind === "emoji" || failed) {
    const emoji = media.kind === "emoji" ? media.emoji : media.fallbackEmoji ?? "❔";
    return (
      <span
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : media.alt}
        aria-hidden={decorative || undefined}
        className={cn("inline-flex select-none items-center justify-center leading-none", className)}
        style={{ fontSize: size * 0.82, width: size, height: size }}
      >
        {emoji}
      </span>
    );
  }

  return (
    <Image
      src={media.src}
      alt={alt}
      width={size}
      height={size}
      unoptimized={media.kind === "svg"}
      priority={priority}
      draggable={false}
      onError={() => setFailed(true)}
      className={cn("pointer-events-none select-none object-contain", className)}
    />
  );
}
