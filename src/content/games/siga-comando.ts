import type { CommandQuestion, Relation } from "../types";

/**
 * JOGO 6 — SIGA O COMANDO
 * Cena = marcos fixos (cadeira, caixa, cama) + objetos que a criança move.
 * Cada marco tem áreas de destino bem definidas (ver LANDMARK_ZONES).
 * A validação confere a posição final de cada objeto e, nos comandos com
 * "antes/depois" (ordered: true), também a ordem em que as ações foram feitas.
 */

/** Áreas de destino de cada marco. "dentro" só existe em recipientes. */
export const LANDMARK_ZONES: Record<string, Relation[]> = {
  cadeira: ["em-cima", "embaixo", "ao-lado"],
  cama: ["em-cima", "embaixo", "ao-lado"],
  caixa: ["dentro", "em-cima", "ao-lado"],
};

export const RELATION_LABEL: Record<Relation | "fora", string> = {
  "em-cima": "em cima",
  embaixo: "embaixo",
  dentro: "dentro",
  "ao-lado": "ao lado",
  fora: "fora",
};

const chao = { at: "chao" } as const;

export const COMMANDS: CommandQuestion[] = [
  // Fácil — uma etapa
  {
    id: "bola-dentro-caixa",
    category: "objetos",
    text: "Coloque a bola dentro da caixa.",
    landmarkIds: ["caixa", "cadeira"],
    objects: [
      { id: "bola", start: chao },
      { id: "gato", start: chao },
      { id: "ursinho", start: chao },
    ],
    goals: [{ objectId: "bola", landmarkId: "caixa", relation: "dentro" }],
    levels: ["facil"],
  },
  {
    id: "gato-em-cima-cadeira",
    category: "objetos",
    text: "Coloque o gato em cima da cadeira.",
    landmarkIds: ["cadeira", "caixa"],
    objects: [
      { id: "gato", start: chao },
      { id: "bola", start: chao },
      { id: "pato", start: chao },
    ],
    goals: [{ objectId: "gato", landmarkId: "cadeira", relation: "em-cima" }],
    levels: ["facil"],
  },
  {
    id: "ursinho-em-cima-cama",
    category: "objetos",
    text: "Coloque o ursinho em cima da cama.",
    landmarkIds: ["cama", "cadeira"],
    objects: [
      { id: "ursinho", start: chao },
      { id: "bola", start: chao },
      { id: "gato", start: chao },
    ],
    goals: [{ objectId: "ursinho", landmarkId: "cama", relation: "em-cima" }],
    levels: ["facil"],
  },
  {
    id: "pato-dentro-caixa",
    category: "objetos",
    text: "Coloque o pato dentro da caixa.",
    landmarkIds: ["cama", "caixa"],
    objects: [
      { id: "pato", start: chao },
      { id: "cachorro", start: chao },
      { id: "bola", start: chao },
    ],
    goals: [{ objectId: "pato", landmarkId: "caixa", relation: "dentro" }],
    levels: ["facil"],
  },
  {
    id: "cachorro-em-cima-cama",
    category: "objetos",
    text: "Coloque o cachorro em cima da cama.",
    landmarkIds: ["caixa", "cama"],
    objects: [
      { id: "cachorro", start: chao },
      { id: "ursinho", start: chao },
      { id: "pato", start: chao },
    ],
    goals: [{ objectId: "cachorro", landmarkId: "cama", relation: "em-cima" }],
    levels: ["facil"],
  },

  // Médio — conceitos espaciais mais elaborados
  {
    id: "gato-embaixo-cadeira",
    category: "objetos",
    text: "Coloque o gato embaixo da cadeira.",
    landmarkIds: ["cadeira", "cama"],
    objects: [
      { id: "gato", start: chao },
      { id: "bola", start: chao },
      { id: "ursinho", start: chao },
      { id: "pato", start: chao },
    ],
    goals: [{ objectId: "gato", landmarkId: "cadeira", relation: "embaixo" }],
    levels: ["medio"],
  },
  {
    id: "cachorro-ao-lado-caixa",
    category: "objetos",
    text: "Coloque o cachorro ao lado da caixa.",
    landmarkIds: ["caixa", "cadeira"],
    objects: [
      { id: "cachorro", start: chao },
      { id: "gato", start: chao },
      { id: "bola", start: chao },
      { id: "pato", start: chao },
    ],
    goals: [{ objectId: "cachorro", landmarkId: "caixa", relation: "ao-lado" }],
    levels: ["medio"],
  },
  {
    id: "bola-embaixo-cama",
    category: "objetos",
    text: "Coloque a bola embaixo da cama.",
    landmarkIds: ["cama", "caixa"],
    objects: [
      { id: "bola", start: chao },
      { id: "ursinho", start: chao },
      { id: "cachorro", start: chao },
      { id: "gato", start: chao },
    ],
    goals: [{ objectId: "bola", landmarkId: "cama", relation: "embaixo" }],
    levels: ["medio"],
  },
  {
    id: "ursinho-fora-caixa",
    category: "objetos",
    text: "Tire o ursinho de dentro da caixa.",
    landmarkIds: ["caixa", "cadeira"],
    objects: [
      { id: "ursinho", start: { at: "caixa", relation: "dentro" } },
      { id: "bola", start: chao },
      { id: "gato", start: chao },
      { id: "pato", start: chao },
    ],
    goals: [{ objectId: "ursinho", landmarkId: "caixa", relation: "fora" }],
    levels: ["medio"],
  },
  {
    id: "pato-ao-lado-cadeira",
    category: "objetos",
    text: "Coloque o pato ao lado da cadeira.",
    landmarkIds: ["cama", "cadeira"],
    objects: [
      { id: "pato", start: chao },
      { id: "bola", start: chao },
      { id: "gato", start: chao },
      { id: "ursinho", start: chao },
    ],
    goals: [{ objectId: "pato", landmarkId: "cadeira", relation: "ao-lado" }],
    levels: ["medio"],
  },
  {
    id: "bola-em-cima-caixa",
    category: "objetos",
    text: "Coloque a bola em cima da caixa.",
    landmarkIds: ["caixa", "cama"],
    objects: [
      { id: "bola", start: chao },
      { id: "gato", start: chao },
      { id: "cachorro", start: chao },
      { id: "ursinho", start: chao },
    ],
    goals: [{ objectId: "bola", landmarkId: "caixa", relation: "em-cima" }],
    levels: ["medio"],
    reviewNote: "Contraste proposital com 'dentro da caixa'.",
  },

  // Difícil — duas etapas (algumas com antes/depois)
  {
    id: "bola-caixa-gato-cadeira",
    category: "objetos",
    text: "Coloque a bola dentro da caixa e o gato em cima da cadeira.",
    landmarkIds: ["caixa", "cadeira", "cama"],
    objects: [
      { id: "bola", start: chao },
      { id: "gato", start: chao },
      { id: "cachorro", start: chao },
      { id: "ursinho", start: chao },
    ],
    goals: [
      { objectId: "bola", landmarkId: "caixa", relation: "dentro" },
      { objectId: "gato", landmarkId: "cadeira", relation: "em-cima" },
    ],
    levels: ["dificil"],
  },
  {
    id: "primeiro-ursinho-depois-cachorro",
    category: "objetos",
    text: "Primeiro, coloque o ursinho em cima da cama. Depois, coloque o cachorro embaixo da cama.",
    landmarkIds: ["cama", "cadeira", "caixa"],
    objects: [
      { id: "ursinho", start: chao },
      { id: "cachorro", start: chao },
      { id: "bola", start: chao },
      { id: "pato", start: chao },
    ],
    goals: [
      { objectId: "ursinho", landmarkId: "cama", relation: "em-cima" },
      { objectId: "cachorro", landmarkId: "cama", relation: "embaixo" },
    ],
    ordered: true,
    levels: ["dificil"],
  },
  {
    id: "antes-gato-bola",
    category: "objetos",
    text: "Antes de colocar o gato embaixo da cadeira, coloque a bola em cima da cadeira.",
    landmarkIds: ["cadeira", "caixa", "cama"],
    objects: [
      { id: "gato", start: chao },
      { id: "bola", start: chao },
      { id: "ursinho", start: chao },
      { id: "pato", start: chao },
    ],
    // Ordem exigida: primeiro a bola, depois o gato.
    goals: [
      { objectId: "bola", landmarkId: "cadeira", relation: "em-cima" },
      { objectId: "gato", landmarkId: "cadeira", relation: "embaixo" },
    ],
    ordered: true,
    levels: ["dificil"],
    reviewNote: "A ordem falada (gato, bola) é o inverso da ordem das ações (bola, gato).",
  },
  {
    id: "tire-bola-coloque-pato",
    category: "objetos",
    text: "Tire a bola de dentro da caixa e coloque o pato dentro dela.",
    landmarkIds: ["caixa", "cama", "cadeira"],
    objects: [
      { id: "bola", start: { at: "caixa", relation: "dentro" } },
      { id: "pato", start: chao },
      { id: "gato", start: chao },
      { id: "ursinho", start: chao },
    ],
    goals: [
      { objectId: "bola", landmarkId: "caixa", relation: "fora" },
      { objectId: "pato", landmarkId: "caixa", relation: "dentro" },
    ],
    levels: ["dificil"],
  },
  {
    id: "depois-cachorro-cama",
    category: "objetos",
    text: "Coloque o cachorro ao lado da cama depois de colocar o gato em cima da cama.",
    landmarkIds: ["cama", "caixa", "cadeira"],
    objects: [
      { id: "cachorro", start: chao },
      { id: "gato", start: chao },
      { id: "bola", start: chao },
      { id: "pato", start: chao },
    ],
    // Ordem exigida: primeiro o gato, depois o cachorro.
    goals: [
      { objectId: "gato", landmarkId: "cama", relation: "em-cima" },
      { objectId: "cachorro", landmarkId: "cama", relation: "ao-lado" },
    ],
    ordered: true,
    levels: ["dificil"],
  },
  {
    id: "ursinho-cadeira-bola-caixa",
    category: "objetos",
    text: "Coloque o ursinho embaixo da cadeira e a bola ao lado da caixa.",
    landmarkIds: ["cadeira", "caixa", "cama"],
    objects: [
      { id: "ursinho", start: chao },
      { id: "bola", start: chao },
      { id: "gato", start: chao },
      { id: "cachorro", start: chao },
    ],
    goals: [
      { objectId: "ursinho", landmarkId: "cadeira", relation: "embaixo" },
      { objectId: "bola", landmarkId: "caixa", relation: "ao-lado" },
    ],
    levels: ["dificil"],
  },
];
