export interface WallpaperConfig {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  rarity: "comun" | "especial" | "epica" | "legendaria";
  unlockedByDefault?: boolean;
  sourceHint: string;
  badge: string;
  previewGradient: string;
  accentColor: string;
  glowColor: string;
  ambientClass: string;
  backgroundImage?: string;
}

export const WALLPAPERS: WallpaperConfig[] = [
  {
    id: "wp_clasico",
    name: "Azul Real La Garza",
    subtitle: "Tapete Oficial",
    description: "El tapete clásico y elegante de terciopelo azul marino oficial de La Garza.",
    rarity: "comun",
    unlockedByDefault: true,
    sourceHint: "Desbloqueado por defecto",
    badge: "CLÁSICO",
    previewGradient: "from-[#0d1633] via-[#16224d] to-[#080d21]",
    accentColor: "#38bdf8",
    glowColor: "rgba(56, 189, 248, 0.4)",
    ambientClass: "wallpaper-clasico",
  },
  {
    id: "wp_cempasuchil",
    name: "Noche de Cempasúchil",
    subtitle: "Día de Muertos",
    description: "Místicos tonos amatista iluminados por cirios, calaveras de azúcar y lluvia de flores doradas.",
    rarity: "epica",
    sourceHint: "Cofre Mágico o Cofre de Temporada",
    badge: "DÍA DE MUERTOS 💀",
    previewGradient: "from-[#1d0933] via-[#340f4d] to-[#120421]",
    accentColor: "#d946ef",
    glowColor: "rgba(217, 70, 239, 0.6)",
    ambientClass: "wallpaper-cempasuchil",
    backgroundImage: "/wallpapers/wp_dia_muertos.jpg",
  },
  {
    id: "wp_michis",
    name: "Mesa Michis & Mininos",
    subtitle: "Tapete Felino de la Suerte",
    description: "Elegante tapete de terciopelo magenta con huellitas doradas y ambientación felina para tu mesa.",
    rarity: "legendaria",
    sourceHint: "Gran Cofre Mítico de Temporada",
    badge: "MICHIS 🐱",
    previewGradient: "from-[#230829] via-[#3d0f47] to-[#140418]",
    accentColor: "#ec4899",
    glowColor: "rgba(236, 72, 153, 0.65)",
    ambientClass: "wallpaper-michis",
    backgroundImage: "/wallpapers/wp_michis.jpg",
  },
  {
    id: "wp_lomitos",
    name: "Mesa Lomitos & Fieles",
    subtitle: "Tapete Canino de la Suerte",
    description: "Cálido paño de mesa verde esmeralda y oro con huellitas de la buena suerte y amuletos perrunos.",
    rarity: "legendaria",
    sourceHint: "Gran Cofre Mítico de Temporada",
    badge: "LOMITOS 🐶",
    previewGradient: "from-[#0a1c12] via-[#133321] to-[#06120b]",
    accentColor: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.65)",
    ambientClass: "wallpaper-lomitos",
    backgroundImage: "/wallpapers/wp_lomitos.jpg",
  },
  {
    id: "wp_feria",
    name: "Feria Tradicional",
    subtitle: "Verbena y Papel Picado",
    description: "Ambiente cálido de verbena mexicana con guirnaldas festivas y luces de feria.",
    rarity: "especial",
    sourceHint: "Cofre de Plata, Cofre de Oro o Ruleta",
    badge: "ESPECIAL",
    previewGradient: "from-[#2e0d1e] via-[#4a1230] to-[#1a0510]",
    accentColor: "#f43f5e",
    glowColor: "rgba(244, 63, 94, 0.5)",
    ambientClass: "wallpaper-feria",
  },
  {
    id: "wp_cantina",
    name: "Hacienda & Cantina",
    subtitle: "Madera Rústica",
    description: "Mesa tradicional de madera de roble pulido con ambiente bohemio de cantina.",
    rarity: "especial",
    sourceHint: "Cofre de Oro o Cofre Mágico",
    badge: "RÚSTICO",
    previewGradient: "from-[#291408] via-[#3d1d0c] to-[#140a04]",
    accentColor: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.5)",
    ambientClass: "wallpaper-cantina",
  },
  {
    id: "wp_casino_oro",
    name: "Casino Imperial Dorado",
    subtitle: "Mesa Real de Alta Alcurnia",
    description: "Terciopelo verde esmeralda con filigrana en oro macizo para grandes mesas.",
    rarity: "legendaria",
    sourceHint: "Gran Cofre Legendario o Ruleta Mayor",
    badge: "LEGENDARIO",
    previewGradient: "from-[#042416] via-[#073822] to-[#02140c]",
    accentColor: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.65)",
    ambientClass: "wallpaper-casino",
  },
];

const EQUIPPED_KEY = "garza:equipped_wallpaper";
const OWNED_KEY = "garza:owned";

export function getEquippedWallpaper(): WallpaperConfig {
  try {
    const raw = localStorage.getItem(EQUIPPED_KEY);
    const found = WALLPAPERS.find((w) => w.id === raw);
    return found || WALLPAPERS[0];
  } catch {
    return WALLPAPERS[0];
  }
}

export function setEquippedWallpaper(id: string): void {
  try {
    localStorage.setItem(EQUIPPED_KEY, id);
    window.dispatchEvent(new Event("garza:wallpaper-updated"));
  } catch {}
}

import { getOwnedItemIds } from "@/lib/loot";

export function isWallpaperUnlocked(id: string): boolean {
  if (id === "wp_clasico") return true;
  try {
    return getOwnedItemIds().includes(id);
  } catch {
    return false;
  }
}

