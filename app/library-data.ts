export type Book = {
  id: number;
  slug: string;
  title: string;
  author: string;
  category: string;
  genre: string;
  publicationYear: number;
  available: number;
  code: string;
  color: string;
  summary: string;
  themes: string[];
};

export const books: Book[] = [
  {
    id: 1, slug: "o-pequeno-principe", title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", category: "Literatura", genre: "Fábula filosófica", publicationYear: 1943, available: 2, code: "OP", color: "sun",
    summary: "Um viajante encontra um pequeno príncipe vindo de outro planeta e, por meio de suas histórias, aprende a observar amizade, cuidado e responsabilidade com novos olhos.",
    themes: ["Amizade", "Imaginação", "Crescimento", "Cuidado"],
  },
  {
    id: 2, slug: "quarto-de-despejo", title: "Quarto de Despejo", author: "Carolina Maria de Jesus", category: "Literatura brasileira", genre: "Diário autobiográfico", publicationYear: 1960, available: 0, code: "QD", color: "plum",
    summary: "Em registros do cotidiano, Carolina Maria de Jesus apresenta sua experiência como moradora da favela do Canindé e constrói um importante testemunho sobre desigualdade, resistência e vida urbana.",
    themes: ["Memória", "Sociedade", "Cotidiano", "Brasil"],
  },
  {
    id: 3, slug: "dom-casmurro", title: "Dom Casmurro", author: "Machado de Assis", category: "Clássicos", genre: "Romance clássico", publicationYear: 1899, available: 3, code: "DC", color: "ocean",
    summary: "Bentinho revisita sua juventude e sua relação com Capitu em uma narrativa marcada por lembranças, dúvidas e diferentes possibilidades de interpretação.",
    themes: ["Memória", "Relações", "Narrador", "Brasil"],
  },
  {
    id: 4, slug: "capitaes-da-areia", title: "Capitães da Areia", author: "Jorge Amado", category: "Literatura brasileira", genre: "Romance social", publicationYear: 1937, available: 1, code: "CA", color: "clay",
    summary: "Um grupo de jovens que vive nas ruas de Salvador enfrenta desafios, cria laços de companheirismo e revela diferentes aspectos da sociedade brasileira.",
    themes: ["Juventude", "Sociedade", "Amizade", "Brasil"],
  },
  {
    id: 5, slug: "extraordinario", title: "Extraordinário", author: "R. J. Palacio", category: "Juvenil", genre: "Romance juvenil", publicationYear: 2012, available: 0, code: "EX", color: "mint",
    summary: "Ao começar a frequentar a escola, Auggie e as pessoas ao seu redor aprendem sobre convivência, respeito, coragem e o valor de olhar o outro com empatia.",
    themes: ["Juventude", "Empatia", "Amizade", "Escola"],
  },
  {
    id: 6, slug: "torto-arado", title: "Torto Arado", author: "Itamar Vieira Junior", category: "Contemporâneo", genre: "Romance contemporâneo", publicationYear: 2019, available: 2, code: "TA", color: "earth",
    summary: "Duas irmãs constroem suas trajetórias em uma comunidade rural da Bahia, em uma história sobre família, memória, pertencimento e luta por direitos.",
    themes: ["Memória", "Sociedade", "Família", "Brasil"],
  },
];

export function getBookBySlug(slug: string) {
  return books.find((book) => book.slug === slug);
}

export function getBookRecommendations(selectedBook: Book, limit = 3) {
  const selectedGenreWords = selectedBook.genre.toLocaleLowerCase("pt-BR").split(/\s+/);

  return books
    .filter((book) => book.id !== selectedBook.id)
    .map((book) => {
      const sharedThemes = book.themes.filter((theme) => selectedBook.themes.includes(theme)).length;
      const sharedGenre = selectedGenreWords.some((word) => word.length > 4 && book.genre.toLocaleLowerCase("pt-BR").includes(word));
      const score = sharedThemes * 2 + (book.category === selectedBook.category ? 4 : 0) + (sharedGenre ? 3 : 0);
      return { book, score };
    })
    .sort((a, b) => b.score - a.score || a.book.id - b.book.id)
    .slice(0, limit)
    .map(({ book }) => book);
}
