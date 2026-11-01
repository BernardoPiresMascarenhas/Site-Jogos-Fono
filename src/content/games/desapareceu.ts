import type { DisappearItem } from "../types";

/**
 * JOGO 13 — O QUE DESAPARECEU?
 * Conjuntos de figuras por categoria. A partida sorteia os objetos exibidos,
 * o que desaparece e as alternativas (resposta + distratores diferentes).
 * Cada categoria precisa de pelo menos 9 figuras para o nível difícil
 * (6 exibidas + 3 distratores que não estavam na tela).
 */
const POOLS: Record<string, string[]> = {
  animais: ["cachorro", "gato", "vaca", "porco", "galinha", "pato", "peixe", "cavalo", "sapo", "macaco", "coelho", "leao", "elefante", "borboleta", "tartaruga"],
  alimentos: ["maca", "banana", "uva", "morango", "melancia", "laranja", "pao", "ovo", "cenoura", "queijo", "leite", "bolo", "milho", "sorvete", "pipoca"],
  objetos: ["bola", "casa", "chave", "livro", "cadeira", "oculos", "guarda-chuva", "balao", "celular", "relogio", "lapis", "tesoura", "cama", "ursinho"],
  roupas: ["camiseta", "calca", "meia", "bone", "vestido", "sapato", "luva", "casaco", "short", "chinelo"],
  transportes: ["carro", "onibus", "aviao", "bicicleta", "trem", "barco", "moto", "caminhao", "helicoptero", "foguete"],
};

export const DISAPPEAR_ITEMS: DisappearItem[] = Object.values(POOLS).flatMap((ids) =>
  ids.map((conceptId) => ({ id: conceptId, conceptId })),
);
