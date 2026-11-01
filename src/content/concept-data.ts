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
  { id: "ovelha", word: "Ovelha", article: "a", category: "animais", emoji: "🐑", illustration: "ewe" },
  { id: "rato", word: "Rato", article: "o", category: "animais", emoji: "🐭", illustration: "mouse-face" },
  { id: "galo", word: "Galo", article: "o", category: "animais", emoji: "🐓", illustration: "rooster" },
  { id: "foca", word: "Foca", article: "a", category: "animais", emoji: "🦭", illustration: "seal" },
  { id: "minhoca", word: "Minhoca", article: "a", category: "animais", emoji: "🪱", illustration: "worm" },
  { id: "cao", word: "Cão", article: "o", category: "animais", emoji: "🐕", illustration: "dog" },
  { id: "zebra", word: "Zebra", article: "a", category: "animais", emoji: "🦓", illustration: "zebra" },
  { id: "formiga", word: "Formiga", article: "a", category: "animais", emoji: "🐜", illustration: "ant" },
  { id: "jacare", word: "Jacaré", article: "o", category: "animais", emoji: "🐊", illustration: "crocodile" },
  { id: "abelha", word: "Abelha", article: "a", category: "animais", emoji: "🐝", illustration: "honeybee" },
  { id: "coruja", word: "Coruja", article: "a", category: "animais", emoji: "🦉", illustration: "owl" },
  { id: "pinguim", word: "Pinguim", article: "o", category: "animais", emoji: "🐧", illustration: "penguin" },
  { id: "girafa", word: "Girafa", article: "a", category: "animais", emoji: "🦒", illustration: "giraffe" },
  { id: "urso", word: "Urso", article: "o", category: "animais", emoji: "🐻", illustration: "bear" },
  { id: "passarinho", word: "Passarinho", article: "o", category: "animais", emoji: "🐦", illustration: "bird" },
  { id: "joaninha", word: "Joaninha", article: "a", category: "animais", emoji: "🐞", illustration: "lady-beetle" },

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
  { id: "abacaxi", word: "Abacaxi", article: "o", category: "alimentos", emoji: "🍍", illustration: "pineapple" },
  { id: "pera", word: "Pera", article: "a", category: "alimentos", emoji: "🍐", illustration: "pear" },
  { id: "limao", word: "Limão", article: "o", category: "alimentos", emoji: "🍋", illustration: "lemon" },
  { id: "cereja", word: "Cereja", article: "a", category: "alimentos", emoji: "🍒", illustration: "cherries" },
  { id: "feijao", word: "Feijão", article: "o", category: "alimentos", emoji: "🫘", illustration: "beans" },
  { id: "bala", word: "Bala", article: "a", category: "alimentos", emoji: "🍬", illustration: "candy" },
  { id: "biscoito", word: "Biscoito", article: "o", category: "alimentos", emoji: "🍪", illustration: "cookie" },
  { id: "pepino", word: "Pepino", article: "o", category: "alimentos", emoji: "🥒", illustration: "cucumber" },
  { id: "cafe", word: "Café", article: "o", category: "alimentos", emoji: "☕", illustration: "hot-beverage" },
  { id: "chocolate", word: "Chocolate", article: "o", category: "alimentos", emoji: "🍫", illustration: "chocolate-bar" },

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
  { id: "faca", word: "Faca", article: "a", category: "objetos", emoji: "🔪", illustration: "kitchen-knife" },
  { id: "mala", word: "Mala", article: "a", category: "objetos", emoji: "🧳", illustration: "luggage" },
  { id: "pena", word: "Pena", article: "a", category: "objetos", emoji: "🪶", illustration: "feather" },
  { id: "vela", word: "Vela", article: "a", category: "objetos", emoji: "🕯️", illustration: "candle" },
  { id: "janela", word: "Janela", article: "a", category: "objetos", emoji: "🪟", illustration: "window" },
  { id: "castelo", word: "Castelo", article: "o", category: "objetos", emoji: "🏰", illustration: "castle" },
  { id: "martelo", word: "Martelo", article: "o", category: "objetos", emoji: "🔨", illustration: "hammer" },
  { id: "sacola", word: "Sacola", article: "a", category: "objetos", emoji: "🛍️", illustration: "shopping-bags" },
  { id: "escola", word: "Escola", article: "a", category: "objetos", emoji: "🏫", illustration: "school" },
  { id: "espelho", word: "Espelho", article: "o", category: "objetos", emoji: "🪞", illustration: "mirror" },
  { id: "violao", word: "Violão", article: "o", category: "objetos", emoji: "🎸", illustration: "guitar" },
  { id: "sino", word: "Sino", article: "o", category: "objetos", emoji: "🔔", illustration: "bell" },
  { id: "vassoura", word: "Vassoura", article: "a", category: "objetos", emoji: "🧹", illustration: "broom" },
  { id: "caixa", word: "Caixa", article: "a", category: "objetos", emoji: "📦", illustration: "package" },
  { id: "sofa", word: "Sofá", article: "o", category: "objetos", emoji: "🛋️", illustration: "couch-and-lamp" },
  { id: "televisao", word: "Televisão", article: "a", category: "objetos", emoji: "📺", illustration: "television" },
  { id: "telefone", word: "Telefone", article: "o", category: "objetos", emoji: "☎️", illustration: "telephone" },
  { id: "lampada", word: "Lâmpada", article: "a", category: "objetos", emoji: "💡", illustration: "light-bulb" },
  { id: "mochila", word: "Mochila", article: "a", category: "objetos", emoji: "🎒", illustration: "backpack" },
  { id: "pipa", word: "Pipa", article: "a", category: "objetos", emoji: "🪁", illustration: "kite" },
  { id: "ioio", word: "Ioiô", article: "o", category: "objetos", emoji: "🪀", illustration: "yo-yo" },
  { id: "giz-de-cera", word: "Giz de cera", article: "o", category: "objetos", emoji: "🖍️", illustration: "crayon" },
  { id: "mamadeira", word: "Mamadeira", article: "a", category: "objetos", emoji: "🍼", illustration: "baby-bottle" },

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
  { id: "coracao", word: "Coração", article: "o", category: "corpo", emoji: "❤️", illustration: "red-heart" },

  // Higiene
  { id: "escova-de-dentes", word: "Escova de dentes", article: "a", category: "higiene", emoji: "🪥", illustration: "toothbrush" },
  { id: "sabonete", word: "Sabonete", article: "o", category: "higiene", emoji: "🧼", illustration: "soap" },
  { id: "papel-higienico", word: "Papel higiênico", article: "o", category: "higiene", emoji: "🧻", illustration: "roll-of-paper" },
  { id: "banheira", word: "Banheira", article: "a", category: "higiene", emoji: "🛁", illustration: "bathtub" },
  { id: "chuveiro", word: "Chuveiro", article: "o", category: "higiene", emoji: "🚿", illustration: "shower" },
  { id: "privada", word: "Privada", article: "a", category: "higiene", emoji: "🚽", illustration: "toilet" },
  { id: "esponja", word: "Esponja", article: "a", category: "higiene", emoji: "🧽", illustration: "sponge" },
  { id: "coco", word: "Cocô", article: "o", category: "higiene", emoji: "💩", illustration: "pile-of-poo" },
  { id: "pente", word: "Pente", article: "o", category: "higiene", emoji: "🪮", illustration: "hair-pick" },

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
  { id: "chinelo", word: "Chinelo", article: "o", category: "roupas", emoji: "🩴", illustration: "thong-sandal" },

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
  { id: "foguete", word: "Foguete", article: "o", category: "transportes", emoji: "🚀", illustration: "rocket" },

  // Natureza
  { id: "sol", word: "Sol", article: "o", category: "natureza", emoji: "☀️", illustration: "sun" },
  { id: "flor", word: "Flor", article: "a", category: "natureza", emoji: "🌼", illustration: "blossom" },
  { id: "lua", word: "Lua", article: "a", category: "natureza", emoji: "🌙", illustration: "crescent-moon" },
  { id: "fogo", word: "Fogo", article: "o", category: "natureza", emoji: "🔥", illustration: "fire" },
  { id: "agua", word: "Água", article: "a", category: "natureza", emoji: "💧", illustration: "droplet" },

  // Pessoas
  { id: "bebe", word: "Bebê", article: "o", category: "variadas", emoji: "👶", illustration: "baby" },
  { id: "menino", word: "Menino", article: "o", category: "variadas", emoji: "👦", illustration: "boy" },
  { id: "menina", word: "Menina", article: "a", category: "variadas", emoji: "👧", illustration: "girl" },

  // Profissões
  { id: "medico", word: "Médico", article: "o", category: "profissoes", emoji: "🧑‍⚕️", illustration: "health-worker" },
  { id: "bombeiro", word: "Bombeiro", article: "o", category: "profissoes", emoji: "🧑‍🚒", illustration: "firefighter" },
  { id: "cozinheiro", word: "Cozinheiro", article: "o", category: "profissoes", emoji: "🧑‍🍳", illustration: "cook" },
  { id: "professor", word: "Professor", article: "o", category: "profissoes", emoji: "🧑‍🏫", illustration: "teacher" },
  { id: "policial", word: "Policial", article: "o", category: "profissoes", emoji: "👮", illustration: "police-officer" },
  { id: "agricultor", word: "Agricultor", article: "o", category: "profissoes", emoji: "🧑‍🌾", illustration: "farmer" },
  { id: "astronauta", word: "Astronauta", article: "o", category: "profissoes", emoji: "🧑‍🚀", illustration: "astronaut" },
  { id: "mecanico", word: "Mecânico", article: "o", category: "profissoes", emoji: "🧑‍🔧", illustration: "mechanic" },
  { id: "cantor", word: "Cantor", article: "o", category: "profissoes", emoji: "🧑‍🎤", illustration: "singer" },
  { id: "pintor", word: "Pintor", article: "o", category: "profissoes", emoji: "🧑‍🎨", illustration: "artist" },
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

/**
 * FIGURAS DE CENA
 * Imagens de ações e momentos (ex.: "Acordar") usadas nas sequências e nas frases.
 * Não são palavras do acervo: não aparecem nos jogos de vocabulário.
 * Geradas em /public/ilustracoes/cena-<id>.webp pelo script `npm run ilustracoes`.
 */
export interface PictureData {
  id: string;
  label: string;
  emoji: string;
  illustration?: string;
  image?: string;
}

export const PICTURE_DATA: PictureData[] = [
  // Rotina
  { id: "acordar", label: "Acordar", emoji: "⏰", illustration: "alarm-clock" },
  { id: "cafe-da-manha", label: "Tomar café da manhã", emoji: "🥣", illustration: "bowl-with-spoon" },
  { id: "ir-escola", label: "Ir para a escola", emoji: "🏫", illustration: "school" },
  { id: "voltar-casa", label: "Voltar para casa", emoji: "🏠", illustration: "house" },
  { id: "jantar", label: "Jantar", emoji: "🍽️", illustration: "fork-and-knife-with-plate" },
  { id: "dormir-cama", label: "Dormir", emoji: "🛌", illustration: "person-in-bed" },
  { id: "sono", label: "Ficar com sono", emoji: "🥱", illustration: "yawning-face" },
  { id: "deitar", label: "Deitar na cama", emoji: "🛏️", illustration: "bed" },
  { id: "dormir", label: "Dormir", emoji: "😴", illustration: "sleeping-face" },
  { id: "manha", label: "Manhã", emoji: "🌅", illustration: "sunrise" },
  { id: "meio-dia", label: "Meio-dia", emoji: "☀️", illustration: "sun" },
  { id: "fim-de-tarde", label: "Fim de tarde", emoji: "🌇", illustration: "sunset" },
  { id: "noite", label: "Noite", emoji: "🌃", illustration: "night-with-stars" },
  // Higiene
  { id: "ensaboar-maos", label: "Ensaboar as mãos", emoji: "🧼", illustration: "soap" },
  { id: "enxaguar-maos", label: "Enxaguar as mãos", emoji: "🚰", illustration: "potable-water" },
  { id: "maos-limpas", label: "Mãos limpinhas!", emoji: "🙌", illustration: "raising-hands" },
  { id: "encher-banheira", label: "Encher a banheira", emoji: "🛁", illustration: "bathtub" },
  { id: "entrar-banheira", label: "Entrar na banheira", emoji: "🛀", illustration: "person-taking-bath" },
  { id: "ensaboar-corpo", label: "Ensaboar o corpo", emoji: "🧽", illustration: "sponge" },
  { id: "enxaguar-corpo", label: "Enxaguar no chuveiro", emoji: "🚿", illustration: "shower" },
  { id: "vestir-roupa", label: "Vestir a roupa", emoji: "👕", illustration: "t-shirt" },
  { id: "pegar-escova", label: "Pegar a escova", emoji: "🪥", illustration: "toothbrush" },
  { id: "pasta-de-dente", label: "Colocar a pasta de dente", emoji: "🧴", illustration: "lotion-bottle" },
  { id: "escovar-dentes", label: "Escovar os dentes", emoji: "🦷", illustration: "tooth" },
  { id: "enxaguar-boca", label: "Enxaguar a boca", emoji: "🥛", illustration: "glass-of-milk" },
  { id: "sorriso", label: "Dentes limpinhos!", emoji: "😁", illustration: "beaming-face-with-smiling-eyes" },
  // Histórias e natureza
  { id: "lagarta", label: "Uma lagarta pequenina", emoji: "🐛", illustration: "bug" },
  { id: "lagarta-come", label: "A lagarta come folhas", emoji: "🌿", illustration: "herb" },
  { id: "vira-borboleta", label: "Vira uma borboleta", emoji: "🦋", illustration: "butterfly" },
  { id: "ninho", label: "Ovos no ninho", emoji: "🪺", illustration: "nest-with-eggs" },
  { id: "pintinho-nasce", label: "O pintinho nasce", emoji: "🐣", illustration: "hatching-chick" },
  { id: "pintinho-cresce", label: "O pintinho cresce", emoji: "🐥", illustration: "baby-chick" },
  { id: "vira-galinha", label: "Vira uma galinha", emoji: "🐔", illustration: "chicken" },
  { id: "plantar-semente", label: "Plantar a semente", emoji: "🫘", illustration: "beans" },
  { id: "broto", label: "Nasce um broto", emoji: "🌱", illustration: "seedling" },
  { id: "planta-cresce", label: "A planta cresce", emoji: "🪴", illustration: "potted-plant" },
  { id: "abre-flor", label: "Abre uma flor", emoji: "🌻", illustration: "sunflower" },
  { id: "dia-de-sol", label: "Um dia de sol", emoji: "😎", illustration: "sun-with-face" },
  { id: "nuvens", label: "Chegam as nuvens", emoji: "☁️", illustration: "cloud" },
  { id: "chuva", label: "Começa a chover", emoji: "🌧️", illustration: "cloud-with-rain" },
  { id: "abrir-guarda-chuva", label: "Abrir o guarda-chuva", emoji: "☔", illustration: "umbrella-with-rain-drops" },
  { id: "arco-iris", label: "Aparece o arco-íris", emoji: "🌈", illustration: "rainbow" },
  { id: "encher-baloes", label: "Encher os balões", emoji: "🎈", illustration: "balloon" },
  { id: "acender-vela", label: "Acender a vela", emoji: "🕯️", illustration: "candle" },
  { id: "cantar-parabens", label: "Cantar parabéns", emoji: "🎉", illustration: "party-popper" },
  { id: "comer-bolo", label: "Comer o bolo", emoji: "🎂", illustration: "birthday-cake" },
  // Alimentos
  { id: "pegar-milho", label: "Pegar o milho", emoji: "🌽", illustration: "ear-of-corn" },
  { id: "esquentar", label: "Esquentar na panela", emoji: "🔥", illustration: "fire" },
  { id: "pipoca-pronta", label: "Pipoca pronta!", emoji: "🍿", illustration: "popcorn" },
  { id: "pegar-pao", label: "Pegar o pão", emoji: "🍞", illustration: "bread" },
  { id: "colocar-queijo", label: "Colocar o queijo", emoji: "🧀", illustration: "cheese-wedge" },
  { id: "fechar-sanduiche", label: "Fechar o sanduíche", emoji: "🥪", illustration: "sandwich" },
  { id: "comer-sanduiche", label: "Comer o sanduíche", emoji: "😋", illustration: "face-savoring-food" },
  { id: "separar-ingredientes", label: "Separar os ingredientes", emoji: "🥚", illustration: "egg" },
  { id: "misturar-massa", label: "Misturar a massa", emoji: "🥣", illustration: "bowl-with-spoon" },
  { id: "assar", label: "Assar no forno", emoji: "🔥", illustration: "fire" },
  { id: "bolo-pronto", label: "O bolo está pronto", emoji: "🎂", illustration: "birthday-cake" },
  { id: "comer-fatia", label: "Comer uma fatia", emoji: "🍰", illustration: "shortcake" },
  // Ações usadas nas frases
  { id: "acao-dormir", label: "Dormir", emoji: "💤", illustration: "zzz" },
  { id: "acao-comer", label: "Comer", emoji: "🍽️", illustration: "fork-and-knife-with-plate" },
  { id: "acao-beber", label: "Beber", emoji: "🥤", illustration: "cup-with-straw" },
  { id: "acao-chorar", label: "Chorar", emoji: "😭", illustration: "loudly-crying-face" },
  { id: "acao-ler", label: "Ler", emoji: "📖", illustration: "open-book" },
  { id: "acao-nadar", label: "Nadar", emoji: "🏊", illustration: "person-swimming" },
  { id: "acao-correr", label: "Correr", emoji: "🏃", illustration: "person-running" },
  { id: "lago", label: "Lago", emoji: "🌊", illustration: "water-wave" },
  { id: "almoco", label: "Almoço", emoji: "🍽️", illustration: "fork-and-knife-with-plate" },
];
