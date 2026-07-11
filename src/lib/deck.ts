/**
 * Traditional Lotería Mexicana deck — 54 cards.
 * Card images live in /cards/NN.jpeg (card 6 is .png).
 */

export interface LoteriaCard {
  n: number;
  name: string;
  image: string;   // path relative to public root, e.g. "/cards/01.jpeg"
}

function cardImage(n: number): string {
  const padded = String(n).padStart(2, "0");
  // Card 6 (La Sirena) was extracted as PNG, all others as JPEG
  const ext = n === 6 ? "png" : "jpeg";
  return `/cards/${padded}.${ext}`;
}

export const DECK: LoteriaCard[] = [
  { n: 1,  name: "El Gallo" },
  { n: 2,  name: "El Diablito" },
  { n: 3,  name: "La Dama" },
  { n: 4,  name: "El Catrín" },
  { n: 5,  name: "El Paraguas" },
  { n: 6,  name: "La Sirena" },
  { n: 7,  name: "La Escalera" },
  { n: 8,  name: "La Botella" },
  { n: 9,  name: "El Barril" },
  { n: 10, name: "El Árbol" },
  { n: 11, name: "El Melón" },
  { n: 12, name: "El Valiente" },
  { n: 13, name: "El Gorrito" },
  { n: 14, name: "La Muerte" },
  { n: 15, name: "La Pera" },
  { n: 16, name: "La Bandera" },
  { n: 17, name: "El Bandolón" },
  { n: 18, name: "El Violoncello" },
  { n: 19, name: "La Garza" },
  { n: 20, name: "El Pájaro" },
  { n: 21, name: "La Mano" },
  { n: 22, name: "La Bota" },
  { n: 23, name: "La Luna" },
  { n: 24, name: "El Cotorro" },
  { n: 25, name: "El Borracho" },
  { n: 26, name: "El Negrito" },
  { n: 27, name: "El Corazón" },
  { n: 28, name: "La Sandía" },
  { n: 29, name: "El Tambor" },
  { n: 30, name: "El Camarón" },
  { n: 31, name: "Las Jaras" },
  { n: 32, name: "El Músico" },
  { n: 33, name: "La Araña" },
  { n: 34, name: "El Soldado" },
  { n: 35, name: "La Estrella" },
  { n: 36, name: "El Cazo" },
  { n: 37, name: "El Mundo" },
  { n: 38, name: "El Apache" },
  { n: 39, name: "El Nopal" },
  { n: 40, name: "El Alacrán" },
  { n: 41, name: "La Rosa" },
  { n: 42, name: "La Calavera" },
  { n: 43, name: "La Campana" },
  { n: 44, name: "El Cantarito" },
  { n: 45, name: "El Venado" },
  { n: 46, name: "El Sol" },
  { n: 47, name: "La Corona" },
  { n: 48, name: "La Chalupa" },
  { n: 49, name: "El Pino" },
  { n: 50, name: "El Pescado" },
  { n: 51, name: "La Palma" },
  { n: 52, name: "La Maceta" },
  { n: 53, name: "El Arpa" },
  { n: 54, name: "La Rana" },
].map((c) => ({ ...c, image: cardImage(c.n) }));

/** Quick lookup by card number */
export function getCard(n: number): LoteriaCard | undefined {
  return DECK.find((c) => c.n === n);
}
