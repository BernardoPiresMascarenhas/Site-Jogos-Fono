import type { SequenceQuestion } from "../types";

/**
 * JOGO 7 — COLOQUE NA ORDEM CERTA
 * O nível vem do tamanho da sequência: fácil = 3 figuras, médio = 4,
 * difícil = 5 ou 6. Só entram sequências cuja ordem é clara (ex.: evitamos
 * "escovar os dentes × tomar café", que varia de família para família).
 */
export const SEQUENCES: SequenceQuestion[] = [
  // 3 figuras
  {
    id: "manha",
    category: "rotina",
    title: "Começo do dia",
    steps: ["acordar", "cafe-da-manha", "ir-escola"],
    description: "Primeiro a criança acorda, depois toma café da manhã e, por fim, vai para a escola.",
  },
  {
    id: "hora-de-dormir",
    category: "rotina",
    title: "Hora de dormir",
    steps: ["sono", "deitar", "dormir"],
    description: "A criança fica com sono, deita na cama e dorme.",
  },
  {
    id: "lavar-maos",
    category: "higiene",
    title: "Lavar as mãos",
    steps: ["ensaboar-maos", "enxaguar-maos", "maos-limpas"],
    description: "Ensaboamos as mãos, enxaguamos com água e elas ficam limpinhas.",
  },
  {
    id: "lagarta",
    category: "historias",
    title: "A lagarta",
    steps: ["lagarta", "lagarta-come", "vira-borboleta"],
    description: "Uma lagarta pequenina come muitas folhas e, depois de um tempo, vira uma borboleta.",
  },
  {
    id: "pipoca",
    category: "alimentos",
    title: "Fazer pipoca",
    steps: ["pegar-milho", "esquentar", "pipoca-pronta"],
    description: "Pegamos o milho, esquentamos na panela e a pipoca fica pronta.",
  },

  // 4 figuras
  {
    id: "dia-e-noite",
    category: "rotina",
    title: "O dia passa",
    steps: ["manha", "meio-dia", "fim-de-tarde", "noite"],
    description: "O dia começa de manhã, chega o meio-dia, depois o fim de tarde e, por último, a noite.",
  },
  {
    id: "ovo-galinha",
    category: "historias",
    title: "Do ovo à galinha",
    steps: ["ninho", "pintinho-nasce", "pintinho-cresce", "vira-galinha"],
    description: "Os ovos ficam no ninho, o pintinho nasce, cresce e vira uma galinha.",
  },
  {
    id: "sanduiche",
    category: "alimentos",
    title: "Fazer um sanduíche",
    steps: ["pegar-pao", "colocar-queijo", "fechar-sanduiche", "comer-sanduiche"],
    description: "Pegamos o pão, colocamos o queijo, fechamos o sanduíche e comemos.",
  },
  {
    id: "semente-flor",
    category: "historias",
    title: "Da semente à flor",
    steps: ["plantar-semente", "broto", "planta-cresce", "abre-flor"],
    description: "Plantamos a semente, nasce um broto, a planta cresce e abre uma flor.",
  },
  {
    id: "aniversario",
    category: "historias",
    title: "Festa de aniversário",
    steps: ["encher-baloes", "acender-vela", "cantar-parabens", "comer-bolo"],
    description: "Enchemos os balões, acendemos a vela, cantamos parabéns e comemos o bolo.",
  },

  // 5 ou 6 figuras
  {
    id: "dia-inteiro",
    category: "rotina",
    title: "Um dia inteiro",
    steps: ["acordar", "cafe-da-manha", "ir-escola", "voltar-casa", "jantar", "dormir-cama"],
    description:
      "A criança acorda, toma café, vai para a escola, volta para casa, janta e, à noite, vai dormir.",
  },
  {
    id: "banho",
    category: "higiene",
    title: "Hora do banho",
    steps: ["encher-banheira", "entrar-banheira", "ensaboar-corpo", "enxaguar-corpo", "vestir-roupa"],
    description: "Enchemos a banheira, entramos, ensaboamos o corpo, enxaguamos no chuveiro e vestimos a roupa.",
  },
  {
    id: "escovar-dentes",
    category: "higiene",
    title: "Escovar os dentes",
    steps: ["pegar-escova", "pasta-de-dente", "escovar-dentes", "enxaguar-boca", "sorriso"],
    description: "Pegamos a escova, colocamos a pasta, escovamos os dentes, enxaguamos a boca e pronto: dentes limpinhos!",
    reviewNote: "A figura do enxágue é um copo; confirmar se fica claro para as crianças.",
  },
  {
    id: "chuva",
    category: "historias",
    title: "Dia de chuva",
    steps: ["dia-de-sol", "nuvens", "chuva", "abrir-guarda-chuva", "arco-iris"],
    description: "Era um dia de sol. Chegaram as nuvens, começou a chover, abrimos o guarda-chuva e apareceu o arco-íris.",
  },
  {
    id: "bolo",
    category: "alimentos",
    title: "Fazer um bolo",
    steps: ["separar-ingredientes", "misturar-massa", "assar", "bolo-pronto", "comer-fatia"],
    description: "Separamos os ingredientes, misturamos a massa, assamos no forno, o bolo fica pronto e comemos uma fatia.",
  },
];
