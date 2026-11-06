import { DECK, type LoteriaCard, getCard as getBaseCard } from "@/lib/deck";

export interface DeckSkinConfig {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  rarity: "comun" | "especial" | "epica" | "legendaria";
  badge: string;
  icon: string;
  accentColor: string;
  glowColor: string;
  unlockedByDefault?: boolean;
  sourceHint: string;
  previewGradient: string;
  mascotEmoji?: string;
  cardNamePrefix?: string;
  bannerImage?: string;
  sampleCardImage?: string;
  thumbnailImage?: string;
}

export const DECK_SKINS: DeckSkinConfig[] = [
  {
    id: "deck_clasica",
    name: "Baraja Clásica Mexicana",
    subtitle: "Edición Tradicional Oficial",
    description: "La auténtica baraja mexicana de lotería con sus 54 grabados clásicos de La Garza.",
    rarity: "comun",
    badge: "TRADICIONAL",
    icon: "🐓",
    accentColor: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.4)",
    unlockedByDefault: true,
    sourceHint: "Desbloqueada por defecto",
    previewGradient: "from-amber-950 via-slate-900 to-black",
    sampleCardImage: "/cards/01.jpeg",
    thumbnailImage: "/cards/01.jpeg",
  },
  {
    id: "deck_michis",
    name: "Baraja Michis & Gatos",
    subtitle: "Edición Mítica de Temporada",
    description: "¡Los personajes de la lotería reimaginados con traviesos gatitos michis y arte tradicional mexicano!",
    rarity: "legendaria",
    badge: "MICHIS 🐱",
    icon: "🐱",
    accentColor: "#ec4899",
    glowColor: "rgba(236, 72, 153, 0.7)",
    sourceHint: "Gran Cofre Mítico de Temporada",
    previewGradient: "from-pink-950 via-fuchsia-950 to-slate-950",
    mascotEmoji: "🐱",
    cardNamePrefix: "Michi ",
    sampleCardImage: "/cards/michis/02.jpg",
    thumbnailImage: "/cards/michis/02.jpg",
  },
  {
    id: "deck_lomitos",
    name: "Baraja Lomitos & Perros",
    subtitle: "Edición Mítica de Temporada",
    description: "¡La lotería con perritos alegres, fieles guardianes y lomitos de la buena suerte!",
    rarity: "legendaria",
    badge: "LOMITOS 🐶",
    icon: "🐶",
    accentColor: "#f97316",
    glowColor: "rgba(249, 115, 22, 0.7)",
    sourceHint: "Gran Cofre Mítico de Temporada",
    previewGradient: "from-amber-950 via-orange-950 to-slate-950",
    mascotEmoji: "🐶",
    cardNamePrefix: "Lomito ",
    sampleCardImage: "/cards/lomitos/02.jpg",
    thumbnailImage: "/cards/lomitos/02.jpg",
  },
  {
    id: "deck_neon",
    name: "Baraja Neón Ciberpunk",
    subtitle: "Edición Especial Holográfica",
    description: "Estilo retro-futurista con destellos de neón ultravioleta y bordes luminosos.",
    rarity: "epica",
    badge: "NEÓN ⚡",
    icon: "⚡",
    accentColor: "#06b6d4",
    glowColor: "rgba(6, 182, 212, 0.65)",
    sourceHint: "Cofre Mágico o Legendario",
    previewGradient: "from-cyan-950 via-indigo-950 to-slate-950",
    mascotEmoji: "⚡",
    cardNamePrefix: "Ciber ",
    sampleCardImage: "/cards/06.png",
    thumbnailImage: "/cards/06.png",
  },
];

/**
 * Mapeo de ilustraciones personalizadas de alta definición para cada baraja temática.
/**
 * Nombres temáticos personalizados para las 54 cartas de lotería
 */
const MICHI_NAMES: Record<number, string> = {
  1: "El Michi Gallo",
  2: "El Michi Diablo",
  3: "La Dama Michi",
  4: "El Catrín Michi",
  5: "El Paraguas Michi",
  6: "La Michi Sirena",
  7: "La Escalera Michi",
  8: "La Botella Michi",
  9: "El Michi Barril",
  10: "El Árbol Michi",
  11: "El Melón Michi",
  12: "El Michi Valiente",
  13: "El Gorrito Michi",
  14: "La Michi Muerte",
  15: "La Pera Michi",
  16: "La Bandera Michi",
  17: "El Michi Bandolón",
  18: "El Michi Violoncello",
  19: "La Garza & El Michi",
  20: "El Pájaro Michi",
  21: "La Patita Michi",
  22: "La Bota Michi",
  23: "La Luna Michi",
  24: "El Cotorro Michi",
  25: "El Michi Borracho",
  26: "El Negrito Michi",
  27: "El Corazón Michi",
  28: "La Sandía Michi",
  29: "El Tambor Michi",
  30: "El Camarón Michi",
  31: "Las Jaras Michi",
  32: "El Músico Michi",
  33: "La Araña Michi",
  34: "El Michi Soldado",
  35: "La Estrella Michi",
  36: "El Cazo Michi",
  37: "El Michi Mundo",
  38: "El Apache Michi",
  39: "El Nopal Michi",
  40: "El Alacrán Michi",
  41: "La Rosa Michi",
  42: "La Michi Calavera",
  43: "La Campana Michi",
  44: "El Cantarito Michi",
  45: "El Venado Michi",
  46: "El Michi Sol",
  47: "La Corona Michi",
  48: "La Chalupa Michi",
  49: "El Pino Michi",
  50: "El Pescado Michi",
  51: "La Palma Michi",
  52: "La Maceta Michi",
  53: "El Arpa Michi",
  54: "La Rana Michi",
};

const LOMITO_NAMES: Record<number, string> = {
  1: "El Lomito Gallo",
  2: "El Lomito Diablo",
  3: "La Dama Lomita",
  4: "El Catrín Lomito",
  5: "El Paraguas Lomito",
  6: "La Lomito Sirena",
  7: "La Escalera Lomito",
  8: "La Botella Lomito",
  9: "El Lomito Barril",
  10: "El Árbol Lomito",
  11: "El Melón Lomito",
  12: "El Lomito Valiente",
  13: "El Gorrito Lomito",
  14: "La Lomito Muerte",
  15: "La Pera Lomito",
  16: "La Bandera Lomito",
  17: "El Lomito Bandolón",
  18: "El Lomito Violoncello",
  19: "La Garza & El Lomito",
  20: "El Pájaro Lomito",
  21: "La Patita Lomito",
  22: "La Bota Lomito",
  23: "La Luna Lomito",
  24: "El Cotorro Lomito",
  25: "El Lomito Alegre",
  26: "El Negrito Lomito",
  27: "El Corazón Lomito",
  28: "La Sandía Lomito",
  29: "El Tambor Lomito",
  30: "El Camarón Lomito",
  31: "Las Jaras Lomito",
  32: "El Músico Lomito",
  33: "La Araña Lomito",
  34: "El Lomito Soldado",
  35: "La Estrella Lomito",
  36: "El Cazo Lomito",
  37: "El Lomito Mundo",
  38: "El Apache Lomito",
  39: "El Nopal Lomito",
  40: "El Alacrán Lomito",
  41: "La Rosa Lomito",
  42: "La Lomito Calavera",
  43: "La Campana Lomito",
  44: "El Cantarito Lomito",
  45: "El Venado Lomito",
  46: "El Lomito Sol",
  47: "La Corona Lomito",
  48: "La Chalupa Lomito",
  49: "El Pino Lomito",
  50: "El Pescado Lomito",
  51: "La Palma Lomito",
  52: "La Maceta Lomito",
  53: "El Arpa Lomito",
  54: "La Rana Lomito",
};

export const CUSTOM_SKIN_IMAGES: Record<string, Record<number, { image: string; name?: string }>> = {
  deck_michis: Object.fromEntries(
    Array.from({ length: 54 }, (_, i) => [
      i + 1,
      {
        image: `/cards/michis/${String(i + 1).padStart(2, "0")}.jpg`,
        name: MICHI_NAMES[i + 1],
      },
    ])
  ),
  deck_lomitos: Object.fromEntries(
    Array.from({ length: 54 }, (_, i) => [
      i + 1,
      {
        image: `/cards/lomitos/${String(i + 1).padStart(2, "0")}.jpg`,
        name: LOMITO_NAMES[i + 1],
      },
    ])
  ),
};

const EQUIPPED_DECK_KEY = "garza:equipped_deck";
const OWNED_KEY = "garza:owned";

export function getEquippedDeckSkin(): DeckSkinConfig {
  try {
    const raw = localStorage.getItem(EQUIPPED_DECK_KEY);
    const found = DECK_SKINS.find((d) => d.id === raw);
    if (found && (found.id === "deck_clasica" || isDeckSkinUnlocked(found.id))) {
      return found;
    }
    return DECK_SKINS[0];
  } catch {
    return DECK_SKINS[0];
  }
}

export function setEquippedDeckSkin(id: string): void {
  try {
    localStorage.setItem(EQUIPPED_DECK_KEY, id);
    // Sync with settings.deckStyle if applicable
    try {
      const rawSettings = localStorage.getItem("garza:settings");
      if (rawSettings) {
        const settings = JSON.parse(rawSettings);
        settings.deckStyle = id === "deck_clasica" ? "clasica" : "moderna";
        localStorage.setItem("garza:settings", JSON.stringify(settings));
      }
    } catch {}

    window.dispatchEvent(new Event("garza:deck-updated"));
  } catch {}
}

export const equipDeckSkin = setEquippedDeckSkin;

import { getOwnedItemIds } from "@/lib/loot";

export function isDeckSkinUnlocked(id: string): boolean {
  if (id === "deck_clasica") return true;
  try {
    return getOwnedItemIds().includes(id);
  } catch {
    return false;
  }
}

export interface ThemedCard {
  n: number;
  name: string;
  image: string;
  fallbackImage: string;
  mascot?: string;
  skinId: string;
  frameStyle?: string;
}

/**
 * Obtener carta con la personalización de la baraja equipada (o forzada por skinId)
 * Soporta las 54 cartas completas para barajas temáticas (Michis, Lomitos, Clásica)
 */
export function getThemedCard(n: number, overrideSkinId?: string): ThemedCard | undefined {
  const baseCard = getBaseCard(n);
  if (!baseCard) return undefined;

  const skin = overrideSkinId
    ? DECK_SKINS.find((s) => s.id === overrideSkinId) || getEquippedDeckSkin()
    : getEquippedDeckSkin();

  if (skin.id === "deck_clasica") {
    return {
      n: baseCard.n,
      name: baseCard.name,
      image: baseCard.image,
      fallbackImage: baseCard.image,
      skinId: skin.id,
    };
  }

  const padded = String(n).padStart(2, "0");
  let cardImage = baseCard.image;
  let cardName = baseCard.name;

  if (skin.id === "deck_michis") {
    cardImage = `/cards/michis/${padded}.jpg`;
    cardName = MICHI_NAMES[n] || `Michi ${baseCard.name}`;
  } else if (skin.id === "deck_lomitos") {
    cardImage = `/cards/lomitos/${padded}.jpg`;
    cardName = LOMITO_NAMES[n] || `Lomito ${baseCard.name}`;
  } else {
    // Custom overrides fallback
    const customOverride = CUSTOM_SKIN_IMAGES[skin.id]?.[n];
    cardImage = customOverride?.image || baseCard.image;
    cardName = customOverride?.name || (skin.cardNamePrefix ? `${skin.cardNamePrefix}${baseCard.name}` : baseCard.name);
  }

  return {
    n: baseCard.n,
    name: cardName,
    image: cardImage,
    fallbackImage: baseCard.image,
    mascot: skin.mascotEmoji,
    skinId: skin.id,
    frameStyle: skin.accentColor,
  };
}
