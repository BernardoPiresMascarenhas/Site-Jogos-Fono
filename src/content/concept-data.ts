import type { Article, CategoryId } from "./types";

/**
 * ACERVO DE CONCEITOS
 *
 * Cada linha = uma palavra e sua imagem.
 *  - id: identificador único (sem acentos, usado nas atividades)
 *  - word: palavra exibida para a criança
 *  - article: artigo para frases ("Onde está O cachorro?")
 *  - emoji: imagem de reserva e versão em emoji
 *  - illustration: nome da ilustração Fluent Emoji (MIT) gerada em /public/ilustracoes
 *    pelo script `npm run ilustracoes`. Para usar uma imagem própria, informe `image`
 *    com o caminho do arquivo em /public (ex.: "/imagens/cachorro.png").
 *
 * Este arquivo só pode conter `import type` (é lido também por scripts Node).
 */
export interface ConceptData {
  id: string;
  word: string;
  article: Article;
  category: CategoryId;
  emoji: string;
  illustration?: string;
  image?: string;
  audio?: string;
}

export const CONCEPT_DATA: ConceptData[] = [
  // Animais
  { id: "cachorro", word: "Cachorro", article: "o", category: "animais", emoji: "🐶", illustration: "dog-face" },
  { id: "gato", word: "Gato", article: "o", category: "animais", emoji: "🐱", illustration: "cat-face" },
  { id: "vaca", word: "Vaca", article: "a", category: "animais", emoji: "🐮", illustration: "cow-face" },
  { id: "porco", word: "Porco", article: "o", category: "animais", emoji: "🐷", illustration: "pig-face" },
  { id: "galinha", word: "Galinha", article: "a", category: "animais", emoji: "🐔", illustration: "chicken" },
  { id: "pato", word: "Pato", article: "o", category: "animais", emoji: "🦆", illustration: "duck" },
  { id: "peixe", word: "Peixe", article: "o", category: "animais", emoji: "🐟", illustration: "fish" },
  { id: "cavalo", word: "Cavalo", article: "o", category: "animais", emoji: "🐴", illustration: "horse-face" },
  { id: "sapo", word: "Sapo", article: "o", category: "animais", emoji: "🐸", illustration: "frog" },
  { id: "macaco", word: "Macaco", article: "o", category: "animais", emoji: "🐵", illustration: "monkey-face" },
  { id: "coelho", word: "Coelho", article: "o", category: "animais", emoji: "🐰", illustration: "rabbit-face" },
  { id: "leao", word: "Leão", article: "o", category: "animais", emoji: "🦁", illustration: "lion" },
  { id: "elefante", word: "Elefante", article: "o", category: "animais", emoji: "🐘", illustration: "elephant" },
  { id: "borboleta", word: "Borboleta", article: "a", category: "animais", emoji: "🦋", illustration: "butterfly" },
  { id: "tartaruga", word: "Tartaruga", article: "a", category: "animais", emoji: "🐢", illustration: "turtle" },

  // Alimentos
  { id: "maca", word: "Maçã", article: "a", category: "alimentos", emoji: "🍎", illustration: "red-apple" },
  { id: "banana", word: "Banana", article: "a", category: "alimentos", emoji: "🍌", illustration: "banana" },
  { id: "uva", word: "Uva", article: "a", category: "alimentos", emoji: "🍇", illustration: "grapes" },
  { id: "morango", word: "Morango", article: "o", category: "alimentos", emoji: "🍓", illustration: "strawberry" },
  { id: "melancia", word: "Melancia", article: "a", category: "alimentos", emoji: "🍉", illustration: "watermelon" },
  { id: "laranja", word: "Laranja", article: "a", category: "alimentos", emoji: "🍊", illustration: "tangerine" },
  { id: "pao", word: "Pão", article: "o", category: "alimentos", emoji: "🍞", illustration: "bread" },
  { id: "ovo", word: "Ovo", article: "o", category: "alimentos", emoji: "🥚", illustration: "egg" },
  { id: "cenoura", word: "Cenoura", article: "a", category: "alimentos", emoji: "🥕", illustration: "carrot" },
  { id: "queijo", word: "Queijo", article: "o", category: "alimentos", emoji: "🧀", illustration: "cheese-wedge" },
  { id: "leite", word: "Leite", article: "o", category: "alimentos", emoji: "🥛", illustration: "glass-of-milk" },
  { id: "bolo", word: "Bolo", article: "o", category: "alimentos", emoji: "🎂", illustration: "birthday-cake" },
  { id: "milho", word: "Milho", article: "o", category: "alimentos", emoji: "🌽", illustration: "ear-of-corn" },
  { id: "sorvete", word: "Sorvete", article: "o", category: "alimentos", emoji: "🍦", illustration: "soft-ice-cream" },
  { id: "pipoca", word: "Pipoca", article: "a", category: "alimentos", emoji: "🍿", illustration: "popcorn" },

  // Objetos do cotidiano
  { id: "bola", word: "Bola", article: "a", category: "objetos", emoji: "⚽", illustration: "soccer-ball" },
  { id: "casa", word: "Casa", article: "a", category: "objetos", emoji: "🏠", illustration: "house" },
  { id: "chave", word: "Chave", article: "a", category: "objetos", emoji: "🔑", illustration: "key" },
  { id: "livro", word: "Livro", article: "o", category: "objetos", emoji: "📕", illustration: "closed-book" },
  { id: "cadeira", word: "Cadeira", article: "a", category: "objetos", emoji: "🪑", illustration: "chair" },
  { id: "oculos", word: "Óculos", article: "os", category: "objetos", emoji: "👓", illustration: "glasses" },
  { id: "guarda-chuva", word: "Guarda-chuva", article: "o", category: "objetos", emoji: "☂️", illustration: "umbrella" },
  { id: "balao", word: "Balão", article: "o", category: "objetos", emoji: "🎈", illustration: "balloon" },
  { id: "celular", word: "Celular", article: "o", category: "objetos", emoji: "📱", illustration: "mobile-phone" },
  { id: "relogio", word: "Relógio", article: "o", category: "objetos", emoji: "⏰", illustration: "alarm-clock" },
  { id: "lapis", word: "Lápis", article: "o", category: "objetos", emoji: "✏️", illustration: "pencil" },
  { id: "tesoura", word: "Tesoura", article: "a", category: "objetos", emoji: "✂️", illustration: "scissors" },
  { id: "cama", word: "Cama", article: "a", category: "objetos", emoji: "🛏️", illustration: "bed" },
  { id: "ursinho", word: "Ursinho", article: "o", category: "objetos", emoji: "🧸", illustration: "teddy-bear" },

  // Partes do corpo
  { id: "olho", word: "Olho", article: "o", category: "corpo", emoji: "👁️", illustration: "eye" },
  { id: "orelha", word: "Orelha", article: "a", category: "corpo", emoji: "👂", illustration: "ear" },
  { id: "nariz", word: "Nariz", article: "o", category: "corpo", emoji: "👃", illustration: "nose" },
  { id: "boca", word: "Boca", article: "a", category: "corpo", emoji: "👄", illustration: "mouth" },
  { id: "lingua", word: "Língua", article: "a", category: "corpo", emoji: "😛", illustration: "face-with-tongue" },
  { id: "dente", word: "Dente", article: "o", category: "corpo", emoji: "🦷", illustration: "tooth" },
  { id: "mao", word: "Mão", article: "a", category: "corpo", emoji: "✋", illustration: "raised-hand" },
  { id: "pe", word: "Pé", article: "o", category: "corpo", emoji: "🦶", illustration: "foot" },
  { id: "perna", word: "Perna", article: "a", category: "corpo", emoji: "🦵", illustration: "leg" },

  // Higiene
  { id: "escova-de-dentes", word: "Escova de dentes", article: "a", category: "higiene", emoji: "🪥", illustration: "toothbrush" },
  { id: "sabonete", word: "Sabonete", article: "o", category: "higiene", emoji: "🧼", illustration: "soap" },
  { id: "papel-higienico", word: "Papel higiênico", article: "o", category: "higiene", emoji: "🧻", illustration: "roll-of-paper" },
  { id: "banheira", word: "Banheira", article: "a", category: "higiene", emoji: "🛁", illustration: "bathtub" },
  { id: "chuveiro", word: "Chuveiro", article: "o", category: "higiene", emoji: "🚿", illustration: "shower" },
  { id: "privada", word: "Privada", article: "a", category: "higiene", emoji: "🚽", illustration: "toilet" },
  { id: "esponja", word: "Esponja", article: "a", category: "higiene", emoji: "🧽", illustration: "sponge" },
  { id: "coco", word: "Cocô", article: "o", category: "higiene", emoji: "💩", illustration: "pile-of-poo" },

  // Roupas
  { id: "camiseta", word: "Camiseta", article: "a", category: "roupas", emoji: "👕", illustration: "t-shirt" },
  { id: "calca", word: "Calça", article: "a", category: "roupas", emoji: "👖", illustration: "jeans" },
  { id: "meia", word: "Meia", article: "a", category: "roupas", emoji: "🧦", illustration: "socks" },
  { id: "bone", word: "Boné", article: "o", category: "roupas", emoji: "🧢", illustration: "billed-cap" },
  { id: "vestido", word: "Vestido", article: "o", category: "roupas", emoji: "👗", illustration: "dress" },
  { id: "sapato", word: "Sapato", article: "o", category: "roupas", emoji: "👞", illustration: "mans-shoe" },
  { id: "luva", word: "Luva", article: "a", category: "roupas", emoji: "🧤", illustration: "gloves" },
  { id: "casaco", word: "Casaco", article: "o", category: "roupas", emoji: "🧥", illustration: "coat" },
  { id: "short", word: "Short", article: "o", category: "roupas", emoji: "🩳", illustration: "shorts" },

  // Transportes
  { id: "carro", word: "Carro", article: "o", category: "transportes", emoji: "🚗", illustration: "automobile" },
  { id: "onibus", word: "Ônibus", article: "o", category: "transportes", emoji: "🚌", illustration: "bus" },
  { id: "aviao", word: "Avião", article: "o", category: "transportes", emoji: "✈️", illustration: "airplane" },
  { id: "bicicleta", word: "Bicicleta", article: "a", category: "transportes", emoji: "🚲", illustration: "bicycle" },
  { id: "trem", word: "Trem", article: "o", category: "transportes", emoji: "🚂", illustration: "locomotive" },
  { id: "barco", word: "Barco", article: "o", category: "transportes", emoji: "⛵", illustration: "sailboat" },
  { id: "moto", word: "Moto", article: "a", category: "transportes", emoji: "🏍️", illustration: "motorcycle" },
  { id: "caminhao", word: "Caminhão", article: "o", category: "transportes", emoji: "🚚", illustration: "delivery-truck" },
  { id: "helicoptero", word: "Helicóptero", article: "o", category: "transportes", emoji: "🚁", illustration: "helicopter" },
];

/** Ilustrações decorativas usadas na interface (não fazem parte do conteúdo dos jogos). */
export const UI_ILLUSTRATIONS: Record<string, string> = {
  trofeu: "trophy",
  estrela: "glowing-star",
  festa: "party-popper",
  brilho: "sparkles",
  coracao: "growing-heart",
  balao: "balloon",
};
