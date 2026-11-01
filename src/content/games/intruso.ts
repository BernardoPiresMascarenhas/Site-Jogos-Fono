import type { IntrusoQuestion } from "../types";

/**
 * JOGO 4 — QUAL É O INTRUSO?
 * Cada questão tem um grupo (pelo menos 5 membros que compartilham uma categoria
 * clara) e um intruso que claramente não pertence a ele. A partida sorteia
 * 2, 3 ou 5 membros do grupo (fácil, médio, difícil) + o intruso.
 * As explicações são fixas e falam do grupo inteiro, não de membros específicos.
 */
export const INTRUSO_QUESTIONS: IntrusoQuestion[] = [
  // Animais
  {
    id: "animais-carro",
    category: "animais",
    groupIds: ["cachorro", "gato", "cavalo", "vaca", "porco", "coelho"],
    intruderId: "carro",
    explanation: "O carro é um meio de transporte. Todas as outras imagens são animais.",
  },
  {
    id: "animais-bola",
    category: "animais",
    groupIds: ["leao", "elefante", "macaco", "girafa", "zebra", "urso"],
    intruderId: "bola",
    explanation: "A bola é um brinquedo. Todas as outras imagens são animais.",
  },
  {
    id: "animais-maca",
    category: "animais",
    groupIds: ["pato", "galinha", "peixe", "sapo", "tartaruga", "coelho"],
    intruderId: "maca",
    explanation: "A maçã é uma fruta. Todas as outras imagens são animais.",
  },
  {
    id: "fazenda-leao",
    category: "animais",
    groupIds: ["vaca", "porco", "galinha", "cavalo", "ovelha", "pato"],
    intruderId: "leao",
    explanation: "O leão é um animal selvagem. Todos os outros vivem na fazenda.",
    levels: ["medio", "dificil"],
  },
  {
    id: "voam-tartaruga",
    category: "animais",
    groupIds: ["borboleta", "abelha", "coruja", "passarinho", "joaninha"],
    intruderId: "tartaruga",
    explanation: "A tartaruga não voa. Todos os outros bichos conseguem voar.",
    levels: ["dificil"],
    reviewNote: "Critério mais abstrato (voar); usado só no nível difícil.",
  },

  // Alimentos
  {
    id: "frutas-sapato",
    category: "alimentos",
    groupIds: ["maca", "banana", "uva", "morango", "melancia", "laranja"],
    intruderId: "sapato",
    explanation: "O sapato é um calçado. Todas as outras imagens são frutas.",
  },
  {
    id: "alimentos-lapis",
    category: "alimentos",
    groupIds: ["pao", "queijo", "ovo", "leite", "bolo", "milho"],
    intruderId: "lapis",
    explanation: "O lápis é um material escolar. Todas as outras imagens são alimentos.",
  },
  {
    id: "frutas-cenoura",
    category: "alimentos",
    groupIds: ["maca", "banana", "uva", "morango", "abacaxi", "pera"],
    intruderId: "cenoura",
    explanation: "A cenoura é um legume. Todas as outras imagens são frutas.",
    reviewNote: "Distinção fruta × legume: confirmar se é adequada ao público desejado.",
  },

  // Roupas (vestuário)
  {
    id: "roupas-banana",
    category: "roupas",
    groupIds: ["camiseta", "calca", "meia", "bone", "vestido", "casaco", "short"],
    intruderId: "banana",
    explanation: "A banana é uma fruta. Todas as outras imagens são roupas.",
  },
  {
    id: "roupas-cadeira",
    category: "roupas",
    groupIds: ["camiseta", "calca", "meia", "vestido", "casaco", "luva"],
    intruderId: "cadeira",
    explanation: "A cadeira é um móvel. Todas as outras imagens são roupas.",
  },
  {
    id: "roupas-peixe",
    category: "roupas",
    groupIds: ["bone", "sapato", "luva", "short", "chinelo", "meia"],
    intruderId: "peixe",
    explanation: "O peixe é um animal. Todas as outras imagens são coisas que vestimos.",
  },

  // Transportes
  {
    id: "transportes-vaca",
    category: "transportes",
    groupIds: ["carro", "onibus", "aviao", "bicicleta", "trem", "barco", "moto"],
    intruderId: "vaca",
    explanation: "A vaca é um animal. Todas as outras imagens são meios de transporte.",
  },
  {
    id: "transportes-cama",
    category: "transportes",
    groupIds: ["carro", "onibus", "caminhao", "bicicleta", "trem", "helicoptero"],
    intruderId: "cama",
    explanation: "A cama é um móvel. Todas as outras imagens são meios de transporte.",
  },
  {
    id: "transportes-maca",
    category: "transportes",
    groupIds: ["aviao", "barco", "moto", "caminhao", "onibus", "foguete"],
    intruderId: "maca",
    explanation: "A maçã é uma fruta. Todas as outras imagens são meios de transporte.",
  },

  // Objetos
  {
    id: "brinquedos-cenoura",
    category: "objetos",
    groupIds: ["bola", "ursinho", "balao", "pipa", "ioio"],
    intruderId: "cenoura",
    explanation: "A cenoura é um alimento. Todas as outras imagens são brinquedos.",
  },
  {
    id: "escolar-peixe",
    category: "objetos",
    groupIds: ["lapis", "livro", "tesoura", "mochila", "giz-de-cera"],
    intruderId: "peixe",
    explanation: "O peixe é um animal. Todas as outras imagens são materiais escolares.",
  },
  {
    id: "casa-aviao",
    category: "objetos",
    groupIds: ["cama", "cadeira", "sofa", "televisao", "lampada", "relogio"],
    intruderId: "aviao",
    explanation: "O avião é um meio de transporte. Todas as outras imagens são coisas de dentro de casa.",
  },

  // Outras categorias (entram em "Variadas")
  {
    id: "higiene-bola",
    category: "higiene",
    groupIds: ["escova-de-dentes", "sabonete", "chuveiro", "banheira", "esponja", "papel-higienico"],
    intruderId: "bola",
    explanation: "A bola é um brinquedo. Todas as outras imagens são coisas que usamos para a higiene.",
  },
  {
    id: "corpo-relogio",
    category: "corpo",
    groupIds: ["olho", "orelha", "nariz", "boca", "mao", "pe", "perna"],
    intruderId: "relogio",
    explanation: "O relógio é um objeto. Todas as outras imagens são partes do corpo.",
  },
  {
    id: "profissoes-gato",
    category: "profissoes",
    groupIds: ["medico", "bombeiro", "cozinheiro", "professor", "policial", "agricultor"],
    intruderId: "gato",
    explanation: "O gato é um animal. Todas as outras imagens são pessoas trabalhando em suas profissões.",
  },
];
