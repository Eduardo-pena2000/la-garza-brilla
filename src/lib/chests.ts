import { DECK } from "@/lib/deck";
import { DECK_SKINS } from "@/lib/deckSkins";

export type ChestId = "madera" | "plata" | "oro" | "magico" | "legendario" | "temporada";
export type RewardType = "coins" | "marker" | "sticker" | "emoji" | "wallpaper" | "deck" | "card" | "title";
export type Rarity = "comun" | "especial" | "epica" | "legendaria";

export interface RewardItem {
  id: string;
  type: RewardType;
  title: string;
  description: string;
  amount?: number;
  rarity: Rarity;
  image?: string;
  emoji?: string;
}

export interface ChestConfig {
  id: ChestId;
  name: string;
  subtitle: string;
  price: number;
  isFree?: boolean;
  isSeasonal?: boolean;
  freeCooldownHours?: number;
  image: string;
  openImage?: string;
  rarity: Rarity;
  badge: string;
  color: string;
  glowColor: string;
  minCoins: number;
  maxCoins: number;
  totalCards: number;
  guaranteedRarity?: Rarity;
  perks: string[];
}

export const CHESTS: ChestConfig[] = [
  {
    id: "madera",
    name: "Cofre Diario Gratis",
    subtitle: "Regalo del día de La Garza",
    price: 0,
    isFree: true,
    freeCooldownHours: 4,
    image: "/chests/chest_wooden_closed.png",
    openImage: "/chests/chest_wooden_open.png",
    rarity: "comun",
    badge: "GRATIS",
    color: "from-amber-900/60 via-amber-800/40 to-[#120a1f]",
    glowColor: "rgba(245, 158, 11, 0.4)",
    minCoins: 80,
    maxCoins: 250,
    totalCards: 2,
    perks: ["~80 - 250 Monedas (por suerte)", "Probabilidad de Sticker o Emoji común", "Cada 4 horas gratis"],
  },
  {
    id: "plata",
    name: "Cofre de Plata",
    subtitle: "Ideal para iniciar tu botín",
    price: 250,
    image: "/chests/chest_silver_closed.png",
    openImage: "/chests/chest_silver_open.png",
    rarity: "comun",
    badge: "CLÁSICO",
    color: "from-slate-700/60 via-slate-800/40 to-[#0e1222]",
    glowColor: "rgba(148, 163, 184, 0.6)",
    minCoins: 150,
    maxCoins: 500,
    totalCards: 3,
    perks: ["~150 - 500 Monedas (por suerte)", "Probabilidad de Stickers & Emojis", "Chance de Marcadores y Tapetes", "Chance de Baraja Michis/Lomitos"],
  },
  {
    id: "oro",
    name: "Cofre de Oro",
    subtitle: "Monedas, stickers y tapetes",
    price: 800,
    image: "/chests/chest_gold_closed.png",
    openImage: "/chests/chest_gold_open.png",
    rarity: "especial",
    badge: "POPULAR",
    color: "from-yellow-600/60 via-amber-700/40 to-[#1e1306]",
    glowColor: "rgba(251, 191, 36, 0.75)",
    minCoins: 500,
    maxCoins: 1600,
    totalCards: 4,
    perks: ["~500 - 1,600 Monedas (por suerte)", "Probabilidad de Stickers Especiales", "Tapetes Tradicionales & Fichas", "Chance de Baraja Michis/Lomitos"],
  },
  {
    id: "magico",
    name: "Cofre Mágico",
    subtitle: "Poder arcano y fondos épicos",
    price: 1800,
    image: "/chests/chest_magical_closed.png",
    openImage: "/chests/chest_magical_open.png",
    rarity: "epica",
    badge: "ÉPICO",
    color: "from-purple-800/60 via-fuchsia-900/40 to-[#170a2a]",
    glowColor: "rgba(217, 70, 239, 0.8)",
    minCoins: 1200,
    maxCoins: 3800,
    totalCards: 5,
    perks: ["~1,200 - 3,800 Monedas (por suerte)", "Alta probabilidad de Artículos Épicos", "Tapete Cempasúchil & Gema Obsidiana", "Mayor suerte de Baraja Michis/Lomitos"],
  },
  {
    id: "legendario",
    name: "Gran Cofre de La Garza",
    subtitle: "El cofre supremo con premio asegurado",
    price: 4500,
    image: "/chests/chest_legendary_closed.png",
    openImage: "/chests/chest_legendary_open.png",
    rarity: "legendaria",
    badge: "¡LEGENDARIO!",
    color: "from-cyan-600/50 via-teal-700/40 to-[#0a1f24]",
    glowColor: "rgba(6, 182, 212, 0.95)",
    minCoins: 3500,
    maxCoins: 9500,
    totalCards: 6,
    guaranteedRarity: "legendaria",
    perks: [
      "~3,500 - 9,500 Monedas (por suerte)",
      "¡Sticker o Artículo Épico/Legendario Asegurado!",
      "Corona de Oro Real o Tapete Casino",
      "25% Suerte de Baraja Michis o Lomitos",
    ],
  },
  {
    id: "temporada",
    name: "Cofre Mítico de Temporada",
    subtitle: "¡Tiempo Limitado! Alta probabilidad mítica",
    price: 6500,
    isSeasonal: true,
    image: "/chests/chest_legendary_closed.png",
    openImage: "/chests/chest_legendary_open.png",
    rarity: "legendaria",
    badge: "¡TEMPORADA!",
    color: "from-pink-600/60 via-purple-700/50 to-[#1a0826]",
    glowColor: "rgba(236, 72, 153, 0.95)",
    minCoins: 5000,
    maxCoins: 15000,
    totalCards: 6,
    guaranteedRarity: "legendaria",
    perks: [
      "~5,000 - 15,000 Monedas (por suerte)",
      "¡Sticker Legendario Exclusivo Asegurado!",
      "35% Suerte de Baraja Michis o Lomitos",
      "Disponible por Tiempo Limitado",
    ],
  },
];

// Special Barajas Personalizadas (Skins de Baraja Completa)
export const SPECIAL_DECKS: RewardItem[] = [
  {
    id: "deck_michis",
    type: "deck",
    title: "¡Baraja Completa: Michis & Gatos!",
    description: "54 cartas exclusivas de gatitos para todas tus partidas",
    rarity: "legendaria",
    emoji: "🐱",
    image: "/cards/michis/02.jpg",
  },
  {
    id: "deck_lomitos",
    type: "deck",
    title: "¡Baraja Completa: Lomitos & Perros!",
    description: "54 cartas exclusivas de perritos para todas tus partidas",
    rarity: "legendaria",
    emoji: "🐶",
    image: "/cards/lomitos/02.jpg",
  },
  {
    id: "deck_neon",
    type: "deck",
    title: "¡Baraja Completa: Neón Ciberpunk!",
    description: "54 cartas holográficas ultravioleta de la lotería",
    rarity: "epica",
    emoji: "⚡",
    image: "/cards/06.png",
  },
];

// Special Wallpapers (Fondos de Pantalla Funcionales para Partidas)
export const SPECIAL_WALLPAPERS: RewardItem[] = [
  {
    id: "wp_cempasuchil",
    type: "wallpaper",
    title: "Tapete: Noche de Cempasúchil",
    description: "Místicos tonos amatista, cirios y calaveras de azúcar de Día de Muertos.",
    rarity: "epica",
    emoji: "💀",
    image: "/wallpapers/wp_dia_muertos.jpg",
  },
  {
    id: "wp_michis",
    type: "wallpaper",
    title: "Tapete: Mesa Michis & Mininos",
    description: "Tapete de terciopelo felino con huellitas doradas y ambientación felina.",
    rarity: "legendaria",
    emoji: "🐱",
    image: "/wallpapers/wp_michis.jpg",
  },
  {
    id: "wp_lomitos",
    type: "wallpaper",
    title: "Tapete: Mesa Lomitos & Fieles",
    description: "Cálido paño de mesa verde esmeralda y oro con amuletos perrunos.",
    rarity: "legendaria",
    emoji: "🐶",
    image: "/wallpapers/wp_lomitos.jpg",
  },
  {
    id: "wp_feria",
    type: "wallpaper",
    title: "Tapete: Feria Tradicional",
    description: "Fondo festivo con ambiente de verbena mexicana y papel picado.",
    rarity: "especial",
    emoji: "🪅",
  },
  {
    id: "wp_cantina",
    type: "wallpaper",
    title: "Tapete: Hacienda & Cantina",
    description: "Mesa tradicional de madera de roble pulido con ambiente bohemio.",
    rarity: "especial",
    emoji: "🪵",
  },
  {
    id: "wp_casino_oro",
    type: "wallpaper",
    title: "Tapete: Casino Imperial Dorado",
    description: "Terciopelo verde esmeralda con filigrana en oro macizo.",
    rarity: "legendaria",
    emoji: "👑",
  },
];

// Special Markers (Marcadores para las tablas)
export const SPECIAL_MARKERS: RewardItem[] = [
  { id: "marker_moneda", type: "marker", title: "Moneda de Oro Imperial", description: "Moneda dorada brillante para marcar tus cartas", rarity: "especial", image: "/markers/imoneda.png", emoji: "🪙" },
  { id: "marker_rock", type: "marker", title: "Gema Obsidiana", description: "Marcador místico esculpido en piedra preciosa", rarity: "epica", image: "/markers/irock.png", emoji: "💎" },
  { id: "skin_corona_real", type: "marker", title: "Corona de Oro Real", description: "El marcador más codiciado de La Garza", rarity: "legendaria", emoji: "👑✨" },
  { id: "skin_frijol_oro", type: "marker", title: "Frijol de Oro Puro", description: "Bañado en oro puro para tus tablas", rarity: "especial", emoji: "✨🫘" },
  { id: "skin_moneda_jade", type: "marker", title: "Moneda de Jade", description: "Ficha tallada en jade ancestral", rarity: "epica", emoji: "🟢🪙" },
  { id: "skin_calavera_neon", type: "marker", title: "Calavera Neón", description: "Marcador fosforescente para tus cartas", rarity: "epica", emoji: "💀⚡" },
];

// Special Stickers (Stickers para usar en chat de partida)
export const SPECIAL_STICKERS: RewardItem[] = [
  { id: "stk_garza_victoria", type: "sticker", title: "Garza Victoriosa", description: "Sticker para celebrar tu triunfo", rarity: "legendaria", image: "/stickers/63.png", emoji: "🪿👑" },
  { id: "stk_manoarriba", type: "sticker", title: "Pulgar Arriba Épico", description: "Sticker animado de buena suerte", rarity: "epica", image: "/stickers/manoarriba.gif", emoji: "👍✨" },
  { id: "stk_calavera_sorpresa", type: "sticker", title: "Calavera Festiva", description: "Sticker para reaccionar en rondas", rarity: "epica", image: "/stickers/50.png", emoji: "💀⚡" },
  { id: "stk_catrin_risa", type: "sticker", title: "Risa de Catrín", description: "Reacción elegante con carcajada", rarity: "especial", image: "/stickers/60.png", emoji: "🎩😆" },
  { id: "stk_diablo_fuego", type: "sticker", title: "Diablito Travieso", description: "Reacción traviesa al marcar cartas", rarity: "especial", image: "/stickers/71.png", emoji: "😈🔥" },
  { id: "stk_gallo_furia", type: "sticker", title: "Gallo Peleador", description: "¡Para nunca rendirte en la tabla!", rarity: "comun", image: "/stickers/3.png", emoji: "🐓💥" },
  { id: "stk_corazon_alegria", type: "sticker", title: "Corazón Amistoso", description: "Envía cariño a tus rivales en la mesa", rarity: "comun", image: "/stickers/29.png", emoji: "💖👋" },
  { id: "stk_garza_cool", type: "sticker", title: "Garza con Lentes", description: "Sticker relajado para el chat", rarity: "especial", image: "/stickers/15.png", emoji: "😎🪿" },
  { id: "stk_la_dama", type: "sticker", title: "La Dama Elegante", description: "Sticker con gran distinción", rarity: "especial", image: "/stickers/14.png", emoji: "💃" },
  { id: "stk_el_valiente", type: "sticker", title: "El Gran Valiente", description: "Para jugadores sin miedo", rarity: "epica", image: "/stickers/12.png", emoji: "⚔️" },
  { id: "stk_el_sol", type: "sticker", title: "El Sol Radiante", description: "La bendición de la fortuna", rarity: "legendaria", image: "/stickers/46.png", emoji: "☀️" },
  { id: "stk_la_luna", type: "sticker", title: "La Luna Mística", description: "Para partidas reñidas", rarity: "especial", image: "/stickers/23.png", emoji: "🌙" },
  { id: "stk_el_borracho", type: "sticker", title: "El Borracho Alegre", description: "¡Festejando con humor!", rarity: "comun", image: "/stickers/25.png", emoji: "🍷" },
  { id: "stk_la_chalupa", type: "sticker", title: "La Chalupa Fiestera", description: "Navegando hacia la victoria", rarity: "especial", image: "/stickers/48.png", emoji: "🛶" },
  { id: "stk_la_sirena", type: "sticker", title: "La Sirena Encantada", description: "Buena suerte suprema", rarity: "legendaria", image: "/stickers/6.png", emoji: "🧜‍♀️" },
  { id: "stk_la_muerte", type: "sticker", title: "La Muerte Festiva", description: "Reacción icónica de juego", rarity: "epica", image: "/stickers/10.png", emoji: "💀" },
];

// Special Emojis (Reacciones rápidas)
export const SPECIAL_EMOJIS: RewardItem[] = [
  { id: "emoji_fiesta", type: "emoji", title: "Pack Emojis: Fiesta Mexicana", description: "Expresiones para el chat: 🪅 🌮 🎺 🌶️", rarity: "especial", emoji: "🪅" },
  { id: "emoji_suerte", type: "emoji", title: "Pack Emojis: Buena Suerte", description: "Expresiones para el chat: 🍀 🎯 🎲 🪙", rarity: "comun", emoji: "🍀" },
  { id: "emoji_fuego", type: "emoji", title: "Pack Emojis: Alta Tensión", description: "Expresiones para el chat: 🔥 ⚡ 💣 💥", rarity: "epica", emoji: "🔥" },
  { id: "emoji_realeza", type: "emoji", title: "Pack Emojis: Corona Imperial", description: "Expresiones para el chat: 👑 💎 🏆 ✨", rarity: "legendaria", emoji: "👑" },
];

/** Helper seguro para obtener posesiones del jugador sin dependencias circulares */
function getOwnedItemIdsSafely(): string[] {
  try {
    const raw = localStorage.getItem("garza:owned");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** 
 * Sistema de apertura de cofres por probabilidad:
 * - El oro es un rango aproximado (minCoins a maxCoins) por suerte.
 * - Los objetos NO están garantizados en cofres baratos; se tiran por porcentaje de suerte.
 * - Solo el cofre más caro (legendario / temporada) garantiza 1 sticker o artículo asegurado.
 * - Las barajas temáticas (Michis y Lomitos) salen por probabilidad/suerte, nada garantizado.
 */
export function openChest(chest: ChestConfig): RewardItem[] {
  const rewards: RewardItem[] = [];

  // 1. Monedas con rango aproximado según la suerte
  const coinAmount = Math.floor(
    Math.random() * (chest.maxCoins - chest.minCoins + 1) + chest.minCoins
  );
  rewards.push({
    id: `coins_${Date.now()}`,
    type: "coins",
    title: `${coinAmount.toLocaleString()} Monedas`,
    description: "Oro por suerte para tu botín",
    amount: coinAmount,
    rarity: "comun",
    emoji: "🪙",
  });

  // 2. Determinar cuántos objetos adicionales tocan por probabilidad pura
  let numItemsToDrop = 0;
  const roll = Math.random();

  if (chest.id === "madera") {
    // 40% de probabilidad de 1 objeto común, 60% solo monedas
    if (roll < 0.40) numItemsToDrop = 1;
  } else if (chest.id === "plata") {
    // 50% 1 objeto, 20% 2 objetos, 30% solo monedas
    if (roll < 0.20) numItemsToDrop = 2;
    else if (roll < 0.70) numItemsToDrop = 1;
  } else if (chest.id === "oro") {
    // 35% 2 objetos, 45% 1 objeto, 20% solo monedas
    if (roll < 0.35) numItemsToDrop = 2;
    else if (roll < 0.80) numItemsToDrop = 1;
  } else if (chest.id === "magico") {
    // 40% 3 objetos, 45% 2 objetos, 15% 1 objeto
    if (roll < 0.40) numItemsToDrop = 3;
    else if (roll < 0.85) numItemsToDrop = 2;
    else numItemsToDrop = 1;
  } else if (chest.id === "legendario" || chest.id === "temporada") {
    // El cofre más caro: ¡SÍ TIENE ASEGURADO AL MENOS 1 OBJETO!
    // Además tiene chance de 1 o 2 objetos extras
    if (roll < 0.35) numItemsToDrop = 3;
    else if (roll < 0.75) numItemsToDrop = 2;
    else numItemsToDrop = 1; // Mínimo 1 asegurado
  }

  // 3. Barajas temáticas por probabilidad (Michis o Lomitos por suerte, NADA asegurado)
  const deckChances: Record<ChestId, number> = {
    madera: 0,
    plata: 0.02,     // 2%
    oro: 0.06,       // 6%
    magico: 0.12,    // 12%
    legendario: 0.25,// 25%
    temporada: 0.35, // 35% (por suerte, no asegurado)
  };

  const deckRoll = Math.random();
  let droppedDeck = false;
  if (deckRoll < (deckChances[chest.id] || 0)) {
    const ownedIds = getOwnedItemIdsSafely();
    const candidateDecks = SPECIAL_DECKS.filter((d) => !ownedIds.includes(d.id));
    const deckToGive =
      candidateDecks.length > 0
        ? candidateDecks[Math.floor(Math.random() * candidateDecks.length)]
        : SPECIAL_DECKS[Math.floor(Math.random() * SPECIAL_DECKS.length)];
    rewards.push(deckToGive);
    droppedDeck = true;
    numItemsToDrop = Math.max(0, numItemsToDrop - 1);
  }

  // En el cofre más caro, si aún no tiene un objeto (y no cayó baraja), aseguramos 1 sticker/artículo
  const isMostExpensive = chest.id === "legendario" || chest.id === "temporada";
  if (isMostExpensive && rewards.length === 1 && !droppedDeck && numItemsToDrop === 0) {
    numItemsToDrop = 1;
  }

  let droppedWallpaper = false;
  let droppedMarker = false;

  for (let i = 0; i < numItemsToDrop; i++) {
    const isGuaranteedItem = isMostExpensive && i === 0 && !droppedDeck;

    // Determinación de rareza por suerte
    let targetRarity: Rarity = "comun";
    if (isGuaranteedItem) {
      targetRarity = chest.guaranteedRarity || "legendaria";
    } else {
      const rarityRoll = Math.random();
      if (chest.id === "temporada" || chest.id === "legendario") {
        targetRarity = rarityRoll < 0.45 ? "legendaria" : rarityRoll < 0.8 ? "epica" : "especial";
      } else if (chest.id === "magico") {
        targetRarity = rarityRoll < 0.25 ? "legendaria" : rarityRoll < 0.65 ? "epica" : "especial";
      } else if (chest.id === "oro") {
        targetRarity = rarityRoll < 0.15 ? "epica" : rarityRoll < 0.55 ? "especial" : "comun";
      } else if (chest.id === "plata") {
        targetRarity = rarityRoll < 0.25 ? "especial" : "comun";
      } else {
        targetRarity = rarityRoll < 0.15 ? "especial" : "comun";
      }
    }

    const typeRoll = Math.random();

    // Probabilidad de Tapete
    if (!droppedWallpaper && ((targetRarity === "legendaria" && typeRoll < 0.5) || (targetRarity === "epica" && typeRoll < 0.35))) {
      const matchingWps = SPECIAL_WALLPAPERS.filter((w) => w.rarity === targetRarity);
      const chosenWp = matchingWps.length > 0 ? matchingWps[Math.floor(Math.random() * matchingWps.length)] : SPECIAL_WALLPAPERS[0];
      rewards.push(chosenWp);
      droppedWallpaper = true;
      continue;
    }

    // Probabilidad de Marcador
    if (!droppedMarker && (targetRarity !== "comun" && typeRoll < 0.45)) {
      const matchingMarkers = SPECIAL_MARKERS.filter((m) => m.rarity === targetRarity);
      if (matchingMarkers.length > 0) {
        rewards.push(matchingMarkers[Math.floor(Math.random() * matchingMarkers.length)]);
        droppedMarker = true;
        continue;
      }
    }

    // Probabilidad de Sticker o Emoji (El cofre más caro asegura sticker/recompensa épica/legendaria)
    if (Math.random() < 0.75 || isGuaranteedItem) {
      const matchingStk = SPECIAL_STICKERS.filter((s) => s.rarity === targetRarity);
      const chosenStk = matchingStk.length > 0 ? matchingStk[Math.floor(Math.random() * matchingStk.length)] : SPECIAL_STICKERS[Math.floor(Math.random() * SPECIAL_STICKERS.length)];
      rewards.push(chosenStk);
    } else {
      const matchingEmo = SPECIAL_EMOJIS.filter((e) => e.rarity === targetRarity);
      const chosenEmo = matchingEmo.length > 0 ? matchingEmo[Math.floor(Math.random() * matchingEmo.length)] : SPECIAL_EMOJIS[Math.floor(Math.random() * SPECIAL_EMOJIS.length)];
      rewards.push(chosenEmo);
    }
  }

  return rewards;
}

const LAST_FREE_CHEST_KEY = "garza:last_free_chest";

export function getFreeChestCooldown(): { canOpen: boolean; remainingMs: number } {
  try {
    const raw = localStorage.getItem(LAST_FREE_CHEST_KEY);
    if (!raw) return { canOpen: true, remainingMs: 0 };
    const lastTime = parseInt(raw, 10);
    const cooldownMs = 4 * 60 * 60 * 1000; // 4 hours
    const elapsed = Date.now() - lastTime;
    if (elapsed >= cooldownMs) {
      return { canOpen: true, remainingMs: 0 };
    }
    return { canOpen: false, remainingMs: cooldownMs - elapsed };
  } catch {
    return { canOpen: true, remainingMs: 0 };
  }
}

export function markFreeChestOpened(): void {
  try {
    localStorage.setItem(LAST_FREE_CHEST_KEY, Date.now().toString());
  } catch {}
}

export type ChestInventory = Record<ChestId, number>;
const CHEST_INVENTORY_KEY = "garza:chest_inventory";

export function getChestInventory(): ChestInventory {
  try {
    const raw = localStorage.getItem(CHEST_INVENTORY_KEY);
    if (!raw) return { madera: 0, plata: 0, oro: 0, magico: 0, legendario: 0, temporada: 0 };
    return {
      madera: 0,
      plata: 0,
      oro: 0,
      magico: 0,
      legendario: 0,
      temporada: 0,
      ...JSON.parse(raw),
    };
  } catch {
    return { madera: 0, plata: 0, oro: 0, magico: 0, legendario: 0, temporada: 0 };
  }
}

export function addChestToInventory(chestId: ChestId, count = 1): ChestInventory {
  const inv = getChestInventory();
  inv[chestId] = Math.max(0, (inv[chestId] || 0) + count);
  try {
    localStorage.setItem(CHEST_INVENTORY_KEY, JSON.stringify(inv));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("garza:chest-inventory-updated"));
    }
  } catch {}
  return inv;
}

export function consumeChestFromInventory(chestId: ChestId): boolean {
  const inv = getChestInventory();
  if (!inv[chestId] || inv[chestId] <= 0) return false;
  inv[chestId] -= 1;
  try {
    localStorage.setItem(CHEST_INVENTORY_KEY, JSON.stringify(inv));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("garza:chest-inventory-updated"));
    }
  } catch {}
  return true;
}
