import { RewardItem } from "@/lib/chests";
import { WALLPAPERS, type WallpaperConfig } from "@/lib/wallpapers";

export interface LootHistoryEntry {
  id: string;
  timestamp: number;
  source: string; // e.g., "Cofre de Plata", "Cofre de Oro", "Ruleta Diaria"
  item: RewardItem;
}

const OWNED_KEY = "garza:owned";
const LOOT_HISTORY_KEY = "garza:loot_history";
const EQUIPPED_MARKER_KEY = "garza:equipped_marker";

/**
 * Obtener todos los IDs de artículos que posee el jugador
 */
export function getOwnedItemIds(): string[] {
  try {
    const raw = localStorage.getItem(OWNED_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    // Siempre posee el fondo clásico y los marcadores base y la baraja clásica
    if (!list.includes("wp_clasico")) list.push("wp_clasico");
    if (!list.includes("wp_cempasuchil")) list.push("wp_cempasuchil");
    if (!list.includes("marker_frijol")) list.push("marker_frijol");
    if (!list.includes("marker_ficha")) list.push("marker_ficha");
    if (!list.includes("deck_clasica")) list.push("deck_clasica");
    return list;
  } catch {
    return [
      "wp_clasico",
      "wp_cempasuchil",
      "marker_frijol",
      "marker_ficha",
      "deck_clasica",
    ];
  }
}

/**
 * Registrar artículos reclamados de cofres, ruleta o tienda
 */
export function recordLootClaim(items: RewardItem[], source: string): void {
  try {
    const owned = getOwnedItemIds();
    let ownedChanged = false;

    // Cargar historial previo
    const rawHistory = localStorage.getItem(LOOT_HISTORY_KEY);
    const history: LootHistoryEntry[] = rawHistory ? JSON.parse(rawHistory) : [];

    const now = Date.now();

    items.forEach((item, idx) => {
      // Si no es solo monedas, registrar en owned
      if (item.type !== "coins" && item.id) {
        if (!owned.includes(item.id)) {
          owned.push(item.id);
          ownedChanged = true;
        }
      }

      // Añadir al registro de botín
      history.unshift({
        id: `loot_${now}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: now,
        source,
        item,
      });
    });

    // Guardar lista de posesiones si cambió
    if (ownedChanged) {
      localStorage.setItem(OWNED_KEY, JSON.stringify(owned));
    }

    // Limitar historial a los últimos 60 registros para rendimiento
    const trimmedHistory = history.slice(0, 60);
    localStorage.setItem(LOOT_HISTORY_KEY, JSON.stringify(trimmedHistory));

    // Notificar a la app
    window.dispatchEvent(new Event("garza:loot-updated"));
    window.dispatchEvent(new Event("garza:wallpaper-updated"));
    window.dispatchEvent(new Event("garza:deck-updated"));
  } catch (err) {
    console.error("Error al registrar botín:", err);
  }
}

/**
 * Obtener el historial completo de botín obtenido
 */
export function getLootHistory(): LootHistoryEntry[] {
  try {
    const raw = localStorage.getItem(LOOT_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Obtener el marcador equipado para las partidas
 */
export function getEquippedMarker(): { id: string; name: string; image?: string; emoji: string } {
  try {
    const raw = localStorage.getItem(EQUIPPED_MARKER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return parsed;
    }
  } catch {}

  return {
    id: "marker_frijol",
    name: "Frijol Tradicional",
    image: "/markers/ifrijol.png",
    emoji: "🫘",
  };
}

/**
 * Equipar un marcador de ficha
 */
export function setEquippedMarker(marker: { id: string; name: string; image?: string; emoji: string }): void {
  try {
    localStorage.setItem(EQUIPPED_MARKER_KEY, JSON.stringify(marker));
    // Sincronizar con settings si aplica
    try {
      const rawSettings = localStorage.getItem("garza:settings");
      if (rawSettings) {
        const settings = JSON.parse(rawSettings);
        if (marker.image) {
          settings.marker = marker.id === "marker_ficha" ? "ficha" : marker.id === "marker_frijol" ? "frijol" : "corazon";
          localStorage.setItem("garza:settings", JSON.stringify(settings));
        }
      }
    } catch {}

    window.dispatchEvent(new Event("garza:marker-updated"));
  } catch {}
}
