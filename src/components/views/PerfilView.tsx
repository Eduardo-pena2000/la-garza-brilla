import { useEffect, useState } from "react";
import {
  Save,
  ChevronDown,
  LayoutGrid,
  Settings as SettingsIcon,
  Crown,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Package,
  Layers,
  Smile,
  CheckCircle2,
  Lock,
  Check,
  X,
  Play,
  Trophy,
  Sparkle,
  LogOut,
  Mail,
  ShieldCheck,
  Scale,
  Trash2,
  AlertTriangle,
  FileText,
  Copyright,
  Coins,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { getCurrentUser, logoutUser, deleteUserAccount, type UserAccount } from "@/lib/auth";
import { VipSubscriptionModal } from "@/components/VipSubscriptionModal";
import { LegalNoticeModal, type LegalTab } from "@/components/LegalNoticeModal";
import {
  WALLPAPERS,
  getEquippedWallpaper,
  setEquippedWallpaper,
  isWallpaperUnlocked,
  type WallpaperConfig,
} from "@/lib/wallpapers";
import {
  SPECIAL_WALLPAPERS,
  SPECIAL_STICKERS,
  SPECIAL_EMOJIS,
  SPECIAL_MARKERS,
} from "@/lib/chests";
import {
  getOwnedItemIds,
  getEquippedMarker,
  setEquippedMarker,
} from "@/lib/loot";
import {
  DECK_SKINS,
  getEquippedDeckSkin,
  setEquippedDeckSkin,
  isDeckSkinUnlocked,
  getThemedCard,
  type DeckSkinConfig,
} from "@/lib/deckSkins";

const SETTINGS_KEY = "garza:settings";

// Audio trigger helper
function playSfx(name: "pop" | "sacar" | "marcar" | "winner") {
  try {
    const audio = new Audio(`/audio/effects/${name}.mp3`);
    audio.volume = 0.55;
    audio.play().catch(() => {});
  } catch {}
}

interface Settings {
  name: string;
  audio: boolean;
  voice: "mujer" | "hombre" | "nino";
  deckStyle: "clasica" | "moderna";
  sfx: boolean;
  confetti: boolean;
  vibration: boolean;
  classicMode: boolean;
  tableView: "rejilla" | "lista";
  marker: "ficha" | "frijol" | "corazon";
}

const DEFAULTS: Settings = {
  name: "",
  audio: true,
  voice: "mujer",
  deckStyle: "clasica",
  sfx: true,
  confetti: false,
  vibration: true,
  classicMode: false,
  tableView: "rejilla",
  marker: "ficha",
};

type PerfilTab = "botin" | "ajustes";

interface CollectibleItem {
  id: string;
  type: "wallpaper" | "sticker" | "marker" | "emoji" | "deck";
  title: string;
  subtitle?: string;
  description: string;
  rarity: "comun" | "especial" | "epica" | "legendaria";
  image?: string;
  emoji?: string;
  sourceHint?: string;
  wallpaperConfig?: WallpaperConfig;
  markerData?: { id: string; name: string; image?: string; emoji: string };
  deckConfig?: DeckSkinConfig;
}

// Expanded catalog of stickers including iconic character stickers
const ALL_CATALOG_STICKERS: CollectibleItem[] = [
  ...SPECIAL_STICKERS.map((s) => ({
    id: s.id,
    type: "sticker" as const,
    title: s.title,
    description: s.description,
    rarity: s.rarity,
    image: s.image,
    emoji: s.emoji,
    sourceHint: "Cofres de la Tienda o Ruleta Diaria",
  })),
  {
    id: "stk_la_dama",
    type: "sticker",
    title: "La Dama Elegante",
    description: "Sticker con gran porte y distinción",
    rarity: "especial",
    image: "/stickers/14.png",
    emoji: "💃",
    sourceHint: "Cofre de Plata u Oro",
  },
  {
    id: "stk_el_valiente",
    type: "sticker",
    title: "El Gran Valiente",
    description: "Para jugadores sin miedo en la mesa",
    rarity: "epica",
    image: "/stickers/12.png",
    emoji: "⚔️",
    sourceHint: "Cofre Mágico",
  },
  {
    id: "stk_el_sol",
    type: "sticker",
    title: "El Sol Radiante",
    description: "La bendición de la fortuna solar",
    rarity: "legendaria",
    image: "/stickers/46.png",
    emoji: "☀️",
    sourceHint: "Cofre Legendario",
  },
  {
    id: "stk_la_luna",
    type: "sticker",
    title: "La Luna Mística",
    description: "Reacción nocturna para partidas reñidas",
    rarity: "especial",
    image: "/stickers/23.png",
    emoji: "🌙",
    sourceHint: "Cofre de Plata u Oro",
  },
  {
    id: "stk_el_borracho",
    type: "sticker",
    title: "El Borracho Alegre",
    description: "¡Festejando cada ronda con humor!",
    rarity: "comun",
    image: "/stickers/25.png",
    emoji: "🍷",
    sourceHint: "Cofre Diario Gratis o de Plata",
  },
  {
    id: "stk_la_chalupa",
    type: "sticker",
    title: "La Chalupa Fiestera",
    description: "Navegando hacia la victoria",
    rarity: "especial",
    image: "/stickers/48.png",
    emoji: "🛶",
    sourceHint: "Cofre de Oro",
  },
  {
    id: "stk_la_sirena",
    type: "sticker",
    title: "La Sirena Encantada",
    description: "El canto de la buena suerte suprema",
    rarity: "legendaria",
    image: "/stickers/6.png",
    emoji: "🧜‍♀️",
    sourceHint: "Cofre Legendario",
  },
  {
    id: "stk_la_muerte",
    type: "sticker",
    title: "La Muerte Festiva",
    description: "Reacción icónica para cuando te ganan la carta",
    rarity: "epica",
    image: "/stickers/10.png",
    emoji: "💀",
    sourceHint: "Cofre Mágico",
  },
];

// All Marker Tokens
const ALL_CATALOG_MARKERS: CollectibleItem[] = [
  {
    id: "marker_frijol",
    type: "marker",
    title: "Frijol Tradicional",
    subtitle: "Clásico",
    description: "El marcador auténtico de frijol pinto para jugar lotería con suerte.",
    rarity: "comun",
    image: "/markers/ifrijol.png",
    emoji: "🫘",
    sourceHint: "Desbloqueado por defecto",
    markerData: { id: "marker_frijol", name: "Frijol Tradicional", image: "/markers/ifrijol.png", emoji: "🫘" },
  },
  {
    id: "marker_ficha",
    type: "marker",
    title: "Ficha Roja de Casino",
    subtitle: "Clásica",
    description: "Ficha plástica roja brillante de salón tradicional.",
    rarity: "comun",
    image: "/markers/ficha.png",
    emoji: "🔴",
    sourceHint: "Desbloqueado por defecto",
    markerData: { id: "marker_ficha", name: "Ficha Roja", image: "/markers/ficha.png", emoji: "🔴" },
  },
  {
    id: "marker_moneda",
    type: "marker",
    title: "Moneda de Oro Imperial",
    subtitle: "Moneda de Oro",
    description: "Moneda bañada en oro brillante que resalta en cualquier casilla.",
    rarity: "especial",
    image: "/markers/imoneda.png",
    emoji: "🪙",
    sourceHint: "Cofre de Plata, Oro o Ruleta",
    markerData: { id: "marker_moneda", name: "Moneda de Oro", image: "/markers/imoneda.png", emoji: "🪙" },
  },
  {
    id: "marker_rock",
    type: "marker",
    title: "Gema Obsidiana",
    subtitle: "Piedra Preciosa",
    description: "Piedra volcánica mística tallada a mano con destello oscuro.",
    rarity: "epica",
    image: "/markers/irock.png",
    emoji: "💎",
    sourceHint: "Cofre Mágico o Ruleta",
    markerData: { id: "marker_rock", name: "Gema Obsidiana", image: "/markers/irock.png", emoji: "💎" },
  },
  {
    id: "skin_corona_real",
    type: "marker",
    title: "Corona de Oro Real",
    subtitle: "Corona Legendaria",
    description: "Símbolo supremo de victoria para jugadores de alto rango.",
    rarity: "legendaria",
    emoji: "👑✨",
    sourceHint: "Gran Cofre Legendario",
    markerData: { id: "skin_corona_real", name: "Corona Real", emoji: "👑✨" },
  },
  {
    id: "skin_frijol_oro",
    type: "marker",
    title: "Frijol de Oro Puro",
    subtitle: "Frijol Dorado",
    description: "Bañado en oro de 24 kilates para una racha imbatible.",
    rarity: "especial",
    emoji: "✨🫘",
    sourceHint: "Cofre de Oro o Ruleta",
    markerData: { id: "skin_frijol_oro", name: "Frijol Dorado", emoji: "✨🫘" },
  },
  {
    id: "skin_moneda_jade",
    type: "marker",
    title: "Moneda de Jade Ancestral",
    subtitle: "Jade Verde",
    description: "Ficha tallada en jade verde prehispánico de la buena fortuna.",
    rarity: "epica",
    emoji: "🟢🪙",
    sourceHint: "Cofre Mágico",
    markerData: { id: "skin_moneda_jade", name: "Moneda de Jade", emoji: "🟢🪙" },
  },
  {
    id: "skin_calavera_neon",
    type: "marker",
    title: "Calavera Neón",
    subtitle: "Calaverita Glow",
    description: "Marcador fosforescente para resaltar tus cartas cantadas.",
    rarity: "epica",
    emoji: "💀⚡",
    sourceHint: "Cofre Mágico o Especial",
    markerData: { id: "skin_calavera_neon", name: "Calavera Neón", emoji: "💀⚡" },
  },
];

export function PerfilView({ onNavigateTienda }: { onNavigateTienda?: () => void }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PerfilTab>("botin");

  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [isVip, setIsVip] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Loot state
  const [equippedWp, setEquippedWpState] = useState<WallpaperConfig>(getEquippedWallpaper());
  const [equippedMarkerState, setEquippedMarkerState] = useState(getEquippedMarker());
  const [equippedDeck, setEquippedDeckState] = useState<DeckSkinConfig>(getEquippedDeckSkin());
  const [ownedIds, setOwnedIds] = useState<string[]>(getOwnedItemIds());

  // Inspect Modal (Clash Royale Style)
  const [inspectItem, setInspectItem] = useState<CollectibleItem | null>(null);
  const [deckInspectCardNum, setDeckInspectCardNum] = useState<number>(1);
  const [previewStickerBounce, setPreviewStickerBounce] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Legal & Account deletion states
  const [legalModalTab, setLegalModalTab] = useState<LegalTab | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadState = () => {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        const storedName = localStorage.getItem("garza:name") ?? "";
        const parsed = raw ? (JSON.parse(raw) as Partial<Settings>) : {};
        setSettings({ ...DEFAULTS, name: storedName, ...parsed });

        const storedVip = localStorage.getItem("garza:vip");
        setIsVip(storedVip === "true");

        setEquippedWpState(getEquippedWallpaper());
        setEquippedMarkerState(getEquippedMarker());
        setEquippedDeckState(getEquippedDeckSkin());
        setOwnedIds(getOwnedItemIds());
        setCurrentUser(getCurrentUser());
      } catch {}
    };

    loadState();
    window.addEventListener("garza:vip-updated", loadState);
    window.addEventListener("garza:wallpaper-updated", loadState);
    window.addEventListener("garza:marker-updated", loadState);
    window.addEventListener("garza:deck-updated", loadState);
    window.addEventListener("garza:loot-updated", loadState);
    window.addEventListener("garza:auth-updated", loadState);

    return () => {
      window.removeEventListener("garza:vip-updated", loadState);
      window.removeEventListener("garza:wallpaper-updated", loadState);
      window.removeEventListener("garza:marker-updated", loadState);
      window.removeEventListener("garza:deck-updated", loadState);
      window.removeEventListener("garza:loot-updated", loadState);
      window.removeEventListener("garza:auth-updated", loadState);
    };
  }, []);

  function showFeedback(msg: string) {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2800);
  }

  function handleEquipWallpaper(wp: WallpaperConfig) {
    playSfx("sacar");
    setEquippedWallpaper(wp.id);
    setEquippedWpState(wp);
    showFeedback(`¡Tapete "${wp.name}" equipado en tus partidas!`);
    if (inspectItem?.id === wp.id) {
      setInspectItem(null);
    }
  }

  function handleEquipMarker(markerItem: { id: string; name: string; image?: string; emoji: string }) {
    playSfx("marcar");
    setEquippedMarker(markerItem);
    setEquippedMarkerState(markerItem);
    showFeedback(`¡Marcador "${markerItem.name}" equipado para tus tablas!`);
    if (inspectItem?.id === markerItem.id) {
      setInspectItem(null);
    }
  }

  function handleEquipDeck(deck: DeckSkinConfig) {
    playSfx("sacar");
    setEquippedDeckSkin(deck.id);
    setEquippedDeckState(deck);
    showFeedback(`¡Baraja "${deck.name}" equipada para tus partidas!`);
    if (inspectItem?.id === deck.id) {
      setInspectItem(null);
    }
  }

  function handleInspect(item: CollectibleItem) {
    playSfx("pop");
    setDeckInspectCardNum(1);
    setInspectItem(item);
    setPreviewStickerBounce(false);
  }

  function triggerStickerReaction() {
    playSfx("pop");
    setPreviewStickerBounce(true);
    setTimeout(() => setPreviewStickerBounce(false), 600);
  }

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function saveName() {
    try {
      localStorage.setItem("garza:name", settings.name.trim());
      showFeedback("Nombre de perfil guardado");
      playSfx("sacar");
    } catch {}
  }

  // Calculate loot progress
  const unlockedDecksCount = DECK_SKINS.filter((d) => isDeckSkinUnlocked(d.id)).length;
  const unlockedWallpapersCount = WALLPAPERS.filter((w) => isWallpaperUnlocked(w.id)).length;
  const unlockedStickersCount = ALL_CATALOG_STICKERS.filter((s) => ownedIds.includes(s.id)).length;
  const unlockedMarkersCount = ALL_CATALOG_MARKERS.filter((m) => ownedIds.includes(m.id)).length;
  const totalItemsCount =
    DECK_SKINS.length + WALLPAPERS.length + ALL_CATALOG_STICKERS.length + ALL_CATALOG_MARKERS.length;
  const totalUnlocked =
    unlockedDecksCount + unlockedWallpapersCount + unlockedStickersCount + unlockedMarkersCount;
  const progressPercent = Math.min(100, Math.round((totalUnlocked / totalItemsCount) * 100));

  const voiceEmoji =
    settings.voice === "mujer" ? "👩‍🎤" : settings.voice === "hombre" ? "🧔‍♂️" : "🧒";
  const voiceLabel =
    settings.voice === "mujer" ? "Mujer" : settings.voice === "hombre" ? "Hombre" : "Niño";

  return (
    <div className="flex flex-col h-full font-sans relative overflow-x-hidden text-white pt-3 pb-36 scroll-touch-y">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-52 left-0 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating feedback toast */}
      {feedbackMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-game text-xs px-5 py-2.5 rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.5)] border border-emerald-300 flex items-center gap-2 animate-bounce-gentle">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 stroke-[3]" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 flex flex-col items-center justify-center px-4 shrink-0 pb-2">
        <div className="flex flex-col items-center leading-tight">
          <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-400 font-black">
            Lotería La Garza
          </span>
          <h1 className="text-xl font-game game-title flex items-center gap-2 mt-0.5">
            Mi Perfil
          </h1>
        </div>

        {/* Top Segmented Switcher: [ 🎒 Mi Botín ] vs [ ⚙️ Ajustes ] */}
        <div className="mt-2.5 w-full max-w-sm bg-black/50 p-1 rounded-2xl border border-white/10 flex items-center gap-1 shadow-inner backdrop-blur-md">
          <button
            onClick={() => {
              playSfx("pop");
              setActiveTab("botin");
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-game text-xs flex items-center justify-center gap-1.5 transition-all duration-200 ${
              activeTab === "botin"
                ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg scale-[1.02]"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Mi Botín</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === "botin" ? "bg-black/20 text-slate-950" : "bg-white/10 text-white/80"
              }`}
            >
              {totalUnlocked}
            </span>
          </button>

          <button
            onClick={() => {
              playSfx("pop");
              setActiveTab("ajustes");
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-game text-xs flex items-center justify-center gap-1.5 transition-all duration-200 ${
              activeTab === "ajustes"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black shadow-lg scale-[1.02]"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Ajustes</span>
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* TAB 1: MI BOTÍN (ORDENADO DE ARRIBA HACIA ABAJO SIN FILTROS NI LOG) */}
      {/* =================================================================== */}
      {activeTab === "botin" && (
        <main className="flex-1 mx-auto w-full max-w-md px-4 space-y-5 relative z-10 animate-fade-in">
          
          {/* ------------------------------------------------------------- */}
          {/* HERO BANNER: CLASH ROYALE BATTLE DECK (EQUIPAMIENTO ACTIVO)   */}
          {/* ------------------------------------------------------------- */}
          <div className="relative rounded-3xl p-4 bg-gradient-to-br from-[#1a1236] via-[#120a27] to-[#090514] border-2 border-amber-400/40 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                  <Crown className="w-4 h-4" />
                </span>
                <span className="text-xs font-game game-title uppercase tracking-wider text-white">
                  Equipamiento Activo
                </span>
              </div>

              {/* Collectibles Counter */}
              <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full border border-amber-400/30">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[11px] font-game text-amber-200">
                  {totalUnlocked}/{totalItemsCount}
                </span>
              </div>
            </div>

            {/* Battle Deck Equipped Slots (3 Slots: Tapete, Ficha, Baraja) */}
            <div className="grid grid-cols-3 gap-2 relative z-10">
              
              {/* Slot 1: Tapete Activo */}
              <button
                onClick={() => {
                  handleInspect({
                    id: equippedWp.id,
                    type: "wallpaper",
                    title: equippedWp.name,
                    subtitle: equippedWp.subtitle,
                    description: equippedWp.description,
                    rarity: equippedWp.rarity,
                    wallpaperConfig: equippedWp,
                  });
                }}
                className="relative rounded-2xl p-2 bg-black/50 border-2 border-cyan-400/60 shadow-lg text-left flex flex-col justify-between hover:border-cyan-300 transition-all active:scale-95 group"
              >
                <div
                  className={`w-full h-11 rounded-xl bg-gradient-to-br ${equippedWp.previewGradient} border flex items-center justify-center shadow-inner relative overflow-hidden`}
                  style={{ borderColor: equippedWp.accentColor }}
                >
                  {equippedWp.backgroundImage ? (
                    <img
                      src={equippedWp.backgroundImage}
                      alt={equippedWp.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Layers className="w-4 h-4" style={{ color: equippedWp.accentColor }} />
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[7px] font-game text-center text-cyan-300">
                    ACTIVO
                  </span>
                </div>
                <div className="min-w-0 mt-1.5">
                  <div className="text-[9px] font-game uppercase tracking-wider text-cyan-300 flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" /> Tapete
                  </div>
                  <div className="text-[11px] font-game text-white truncate leading-tight mt-0.5">
                    {equippedWp.name.replace("Azul Real ", "")}
                  </div>
                </div>
              </button>

              {/* Slot 2: Ficha Activa */}
              <button
                onClick={() => {
                  const mConfig =
                    ALL_CATALOG_MARKERS.find((m) => m.id === equippedMarkerState.id) ||
                    ALL_CATALOG_MARKERS[0];
                  handleInspect(mConfig);
                }}
                className="relative rounded-2xl p-2 bg-black/50 border-2 border-emerald-400/60 shadow-lg text-left flex flex-col justify-between hover:border-emerald-300 transition-all active:scale-95 group"
              >
                <div className="w-full h-11 rounded-xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-400/50 flex items-center justify-center shadow-inner relative p-1">
                  {equippedMarkerState.image ? (
                    <img
                      src={equippedMarkerState.image}
                      alt={equippedMarkerState.name}
                      className="w-8 h-8 object-contain drop-shadow"
                    />
                  ) : (
                    <span className="text-xl drop-shadow">{equippedMarkerState.emoji}</span>
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[7px] font-game text-center text-emerald-300">
                    ACTIVA
                  </span>
                </div>
                <div className="min-w-0 mt-1.5">
                  <div className="text-[9px] font-game uppercase tracking-wider text-emerald-300 flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" /> Ficha
                  </div>
                  <div className="text-[11px] font-game text-white truncate leading-tight mt-0.5">
                    {equippedMarkerState.name.split(" ")[0]}
                  </div>
                </div>
              </button>

              {/* Slot 3: Baraja Activa */}
              <button
                onClick={() => {
                  handleInspect({
                    id: equippedDeck.id,
                    type: "deck",
                    title: equippedDeck.name,
                    subtitle: equippedDeck.subtitle,
                    description: equippedDeck.description,
                    rarity: equippedDeck.rarity,
                    deckConfig: equippedDeck,
                  });
                }}
                className="relative rounded-2xl p-2 bg-black/50 border-2 border-pink-400/60 shadow-lg text-left flex flex-col justify-between hover:border-pink-300 transition-all active:scale-95 group"
              >
                <div
                  className={`w-full h-11 rounded-xl bg-gradient-to-br ${equippedDeck.previewGradient} border flex items-center justify-center shadow-inner relative overflow-hidden`}
                  style={{ borderColor: equippedDeck.accentColor }}
                >
                  {equippedDeck.thumbnailImage ? (
                    <img
                      src={equippedDeck.thumbnailImage}
                      alt={equippedDeck.name}
                      decoding="async"
                      onError={(e) => {
                        if (equippedDeck.sampleCardImage && e.currentTarget.src !== equippedDeck.sampleCardImage) {
                          e.currentTarget.src = equippedDeck.sampleCardImage;
                        }
                      }}
                      className="h-full w-auto aspect-[2/3] object-cover rounded shadow"
                    />
                  ) : (
                    <span className="text-2xl drop-shadow">{equippedDeck.icon}</span>
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[7px] font-game text-center text-pink-300">
                    ACTIVA
                  </span>
                </div>
                <div className="min-w-0 mt-1.5">
                  <div className="text-[9px] font-game uppercase tracking-wider text-pink-300 flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" /> Baraja
                  </div>
                  <div className="text-[11px] font-game text-white truncate leading-tight mt-0.5">
                    {equippedDeck.badge.replace(" 🐱", "").replace(" 🐶", "")}
                  </div>
                </div>
              </button>
            </div>

            {/* Collection Progress Bar */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-3 relative z-10">
              <span className="text-[10px] font-game text-white/60 uppercase">Colección Desbloqueada</span>
              <div className="flex-1 h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden relative">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-500 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-game text-amber-300">{progressPercent}%</span>
            </div>
          </div>

          {/* ============================================================= */}
          {/* SECCIÓN 1: BARAJAS PERSONALIZADAS (SKINS DE TEMPORADA)        */}
          {/* ============================================================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-game game-title uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                <span>🃏</span>
                Barajas Personalizadas (Skins de Lotería)
              </h3>
              <span className="text-[11px] font-game text-white/60">
                {unlockedDecksCount}/{DECK_SKINS.length}
              </span>
            </div>

            <p className="text-[11px] text-white/60 px-1 leading-snug">
              Transforma los 54 dibujos de la lotería en tus partidas con ediciones especiales de temporada.
            </p>

            {/* Grid Horizontal de Barajas */}
            <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 px-1 scrollbar-none">
              {DECK_SKINS.map((deck) => {
                const unlocked = isDeckSkinUnlocked(deck.id);
                const isEquipped = equippedDeck.id === deck.id;

                const rarityBadge =
                  deck.rarity === "legendaria"
                    ? "border-pink-400 bg-pink-950/60 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.5)]"
                    : deck.rarity === "epica"
                    ? "border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                    : "border-slate-500 bg-slate-900/60 text-slate-300";

                return (
                  <div
                    key={deck.id}
                    onClick={() =>
                      handleInspect({
                        id: deck.id,
                        type: "deck",
                        title: deck.name,
                        subtitle: deck.subtitle,
                        description: deck.description,
                        rarity: deck.rarity,
                        deckConfig: deck,
                      })
                    }
                    className={`min-w-[210px] max-w-[230px] shrink-0 rounded-3xl p-3 border-2 flex flex-col justify-between transition-all duration-200 cursor-pointer relative overflow-hidden group shadow-xl ${
                      isEquipped
                        ? "border-pink-400 bg-gradient-to-b from-pink-950/50 via-slate-900 to-slate-950 shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                        : unlocked
                        ? "border-white/20 bg-slate-900/80 hover:border-white/40 hover:-translate-y-1"
                        : "clash-slot-locked"
                    }`}
                  >
                    <div className="relative z-10 flex items-start justify-between gap-1 mb-2">
                      <span className={`text-[9px] font-game uppercase tracking-wider px-2 py-0.5 rounded-full border ${rarityBadge}`}>
                        {deck.badge}
                      </span>

                      {isEquipped ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[9px] font-game uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <Check className="w-2.5 h-2.5 stroke-[3]" /> Activa
                        </span>
                      ) : !unlocked ? (
                        <span className="p-1 rounded-full bg-black/60 border border-white/20 text-white/60">
                          <Lock className="w-3 h-3" />
                        </span>
                      ) : null}
                    </div>

                    {/* Visual Deck Frame */}
                    <div
                      className={`w-full h-24 rounded-2xl bg-gradient-to-br ${deck.previewGradient} border flex flex-col items-center justify-center relative overflow-hidden my-1 shadow-inner`}
                      style={{ borderColor: deck.accentColor }}
                    >
                      {deck.thumbnailImage ? (
                        <div className="relative w-full h-full flex items-center justify-center p-1.5">
                          <img
                            src={deck.thumbnailImage}
                            alt={deck.name}
                            decoding="async"
                            onError={(e) => {
                              if (deck.sampleCardImage && e.currentTarget.src !== deck.sampleCardImage) {
                                e.currentTarget.src = deck.sampleCardImage;
                              }
                            }}
                            className="h-full w-auto aspect-[2/3] object-cover rounded-lg shadow-md border border-white/20 group-hover:scale-110 transition-transform"
                          />
                        </div>
                      ) : (
                        <>
                          <span className="text-4xl drop-shadow group-hover:scale-110 transition-transform">
                            {deck.icon}
                          </span>
                          <span className="text-[10px] font-game text-white/90 uppercase tracking-widest mt-1">
                            54 Cartas Temáticas
                          </span>
                        </>
                      )}
                    </div>

                    <div className="relative z-10 mt-1">
                      <h4 className="text-xs font-game game-title text-white truncate leading-tight">
                        {deck.name}
                      </h4>
                      <p className="text-[10px] text-white/60 line-clamp-2 mt-0.5 leading-snug">
                        {deck.subtitle}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 relative z-10">
                      {isEquipped ? (
                        <span className="text-[11px] font-game text-emerald-300 flex items-center justify-center gap-1 w-full py-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Baraja en Uso
                        </span>
                      ) : unlocked ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEquipDeck(deck);
                          }}
                          className="btn-clash-green py-1 px-3 text-[11px] rounded-full w-full active:translate-y-[1px]"
                        >
                          Equipar
                        </button>
                      ) : (
                        <span className="text-[10px] text-white/50 flex items-center justify-center gap-1 py-1">
                          <Lock className="w-3 h-3" /> En Cofre Mítico
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================================= */}
          {/* SECCIÓN 2: TAPETES DE MESA (GRID HORIZONTAL DE ARENAS)        */}
          {/* ============================================================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-game game-title uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Tapetes de Mesa (Fondos de Partida)
              </h3>
              <span className="text-[11px] font-game text-white/60">
                {unlockedWallpapersCount}/{WALLPAPERS.length}
              </span>
            </div>

            {/* Horizontal Scrollable Grid of Arenas / Banners */}
            <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 px-1 scrollbar-none">
              {WALLPAPERS.map((wp) => {
                const unlocked = isWallpaperUnlocked(wp.id);
                const isEquipped = equippedWp.id === wp.id;

                const rarityBadge =
                  wp.rarity === "legendaria"
                    ? "border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                    : wp.rarity === "epica"
                    ? "border-fuchsia-400 bg-fuchsia-950/60 text-fuchsia-300 shadow-[0_0_10px_rgba(217,70,239,0.4)]"
                    : wp.rarity === "especial"
                    ? "border-amber-400 bg-amber-950/60 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                    : "border-slate-500 bg-slate-900/60 text-slate-300";

                return (
                  <div
                    key={wp.id}
                    onClick={() =>
                      handleInspect({
                        id: wp.id,
                        type: "wallpaper",
                        title: wp.name,
                        subtitle: wp.subtitle,
                        description: wp.description,
                        rarity: wp.rarity,
                        wallpaperConfig: wp,
                      })
                    }
                    className={`min-w-[210px] max-w-[230px] shrink-0 rounded-3xl p-3 border-2 flex flex-col justify-between transition-all duration-200 cursor-pointer relative overflow-hidden group shadow-xl ${
                      isEquipped
                        ? "border-emerald-400 bg-gradient-to-b from-emerald-950/50 via-slate-900 to-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                        : unlocked
                        ? "border-white/20 bg-slate-900/80 hover:border-white/40 hover:-translate-y-1"
                        : "clash-slot-locked"
                    }`}
                  >
                    <div className="relative z-10 flex items-start justify-between gap-1 mb-2">
                      <span className={`text-[9px] font-game uppercase tracking-wider px-2 py-0.5 rounded-full border ${rarityBadge}`}>
                        {wp.badge}
                      </span>

                      {isEquipped ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[9px] font-game uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <Check className="w-2.5 h-2.5 stroke-[3]" /> Activo
                        </span>
                      ) : !unlocked ? (
                        <span className="p-1 rounded-full bg-black/60 border border-white/20 text-white/60">
                          <Lock className="w-3 h-3" />
                        </span>
                      ) : null}
                    </div>

                    <div
                      className={`w-full h-20 rounded-2xl bg-gradient-to-br ${wp.previewGradient} border flex items-center justify-center relative overflow-hidden my-1 shadow-inner`}
                      style={{ borderColor: wp.accentColor }}
                    >
                      {wp.backgroundImage ? (
                        <img
                          src={wp.backgroundImage}
                          alt={wp.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <Layers className="w-8 h-8 drop-shadow" style={{ color: wp.accentColor }} />
                      )}
                    </div>

                    <div className="relative z-10 mt-1">
                      <h4 className="text-xs font-game game-title text-white truncate leading-tight">
                        {wp.name}
                      </h4>
                      <p className="text-[10px] text-white/60 line-clamp-2 mt-0.5 leading-snug">
                        {wp.subtitle}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 relative z-10">
                      {isEquipped ? (
                        <span className="text-[11px] font-game text-emerald-300 flex items-center justify-center gap-1 w-full py-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> En uso en partidas
                        </span>
                      ) : unlocked ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEquipWallpaper(wp);
                          }}
                          className="btn-clash-green py-1 px-3 text-[11px] rounded-full w-full active:translate-y-[1px]"
                        >
                          Equipar
                        </button>
                      ) : (
                        <span className="text-[10px] text-white/50 flex items-center justify-center gap-1 py-1">
                          <Lock className="w-3 h-3" /> En Cofres
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================================= */}
          {/* SECCIÓN 3: STICKERS & EMOTES (GRID VERTICAL 4 COLUMNAS)      */}
          {/* ============================================================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-game game-title uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5" />
                Stickers & Emoticonos de Chat
              </h3>
              <span className="text-[11px] font-game text-white/60">
                {unlockedStickersCount}/{ALL_CATALOG_STICKERS.length}
              </span>
            </div>

            {/* 4-Column Grid of Collectible Clash Royale Emotes */}
            <div className="grid grid-cols-4 gap-2.5">
              {ALL_CATALOG_STICKERS.map((stk) => {
                const unlocked = ownedIds.includes(stk.id);

                const rarityClass =
                  stk.rarity === "legendaria"
                    ? "clash-slot-legendaria"
                    : stk.rarity === "epica"
                    ? "clash-slot-epica"
                    : stk.rarity === "especial"
                    ? "clash-slot-especial"
                    : "clash-slot-comun";

                return (
                  <button
                    key={stk.id}
                    onClick={() => handleInspect(stk)}
                    className={`clash-slot aspect-square p-2 flex flex-col items-center justify-center relative cursor-pointer group ${
                      unlocked ? rarityClass : "clash-slot-locked"
                    }`}
                  >
                    <span
                      className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full shadow-sm ${
                        stk.rarity === "legendaria"
                          ? "bg-cyan-400"
                          : stk.rarity === "epica"
                          ? "bg-fuchsia-400"
                          : stk.rarity === "especial"
                          ? "bg-amber-400"
                          : "bg-slate-400"
                      }`}
                    />

                    <div className="w-full h-full flex items-center justify-center">
                      {stk.image ? (
                        <img
                          src={stk.image}
                          alt={stk.title}
                          className={`w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform ${
                            !unlocked ? "grayscale opacity-35" : ""
                          }`}
                          loading="lazy"
                        />
                      ) : (
                        <span className={`text-3xl drop-shadow ${!unlocked ? "grayscale opacity-35" : ""}`}>
                          {stk.emoji}
                        </span>
                      )}
                    </div>

                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
                        <Lock className="w-5 h-5 text-white/80 drop-shadow" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ============================================================= */}
          {/* SECCIÓN 4: MARCADORES DE FICHA (GRID 4 COLUMNAS DE TOKENS)    */}
          {/* ============================================================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-game game-title uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <span>🪙</span>
                Fichas y Marcadores para Tablas
              </h3>
              <span className="text-[11px] font-game text-white/60">
                {unlockedMarkersCount}/{ALL_CATALOG_MARKERS.length}
              </span>
            </div>

            {/* 4-Column Grid of 3D Token Cells */}
            <div className="grid grid-cols-4 gap-2.5">
              {ALL_CATALOG_MARKERS.map((m) => {
                const unlocked = ownedIds.includes(m.id);
                const isEquipped = equippedMarkerState.id === m.id;

                const rarityClass =
                  m.rarity === "legendaria"
                    ? "clash-slot-legendaria"
                    : m.rarity === "epica"
                    ? "clash-slot-epica"
                    : m.rarity === "especial"
                    ? "clash-slot-especial"
                    : "clash-slot-comun";

                return (
                  <button
                    key={m.id}
                    onClick={() => handleInspect(m)}
                    className={`clash-slot aspect-square p-2 flex flex-col items-center justify-center relative cursor-pointer group ${
                      isEquipped
                        ? "border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.5)] bg-emerald-950/40"
                        : unlocked
                        ? rarityClass
                        : "clash-slot-locked"
                    }`}
                  >
                    {isEquipped && (
                      <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md z-10">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}

                    <div className="w-full h-full flex items-center justify-center">
                      {m.image ? (
                        <img
                          src={m.image}
                          alt={m.title}
                          className={`w-11 h-11 sm:w-12 sm:h-12 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)] group-hover:scale-110 transition-transform ${
                            !unlocked ? "grayscale opacity-35" : ""
                          }`}
                          loading="lazy"
                        />
                      ) : (
                        <span className={`text-3xl drop-shadow ${!unlocked ? "grayscale opacity-35" : ""}`}>
                          {m.emoji}
                        </span>
                      )}
                    </div>

                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
                        <Lock className="w-5 h-5 text-white/80 drop-shadow" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ============================================================= */}
          {/* SECCIÓN 5: PACKS DE EMOJIS DE CHAT                           */}
          {/* ============================================================= */}
          <div className="space-y-2 pt-1 pb-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-game game-title uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                Packs de Reacciones Emoji
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {SPECIAL_EMOJIS.map((emo) => {
                const unlocked = ownedIds.includes(emo.id);

                return (
                  <div
                    key={emo.id}
                    onClick={() =>
                      handleInspect({
                        id: emo.id,
                        type: "emoji",
                        title: emo.title,
                        description: emo.description,
                        rarity: emo.rarity,
                        emoji: emo.emoji,
                        sourceHint: "Cofre de Plata, Oro o Mágico",
                      })
                    }
                    className={`clash-slot p-3 flex items-center gap-3 cursor-pointer ${
                      unlocked ? "clash-slot-especial" : "clash-slot-locked"
                    }`}
                  >
                    <span className="text-3xl drop-shadow">{emo.emoji}</span>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="text-xs font-game text-white truncate leading-tight">
                        {emo.title.replace("Pack Emojis: ", "")}
                      </div>
                      <div className="text-[10px] text-white/50 truncate mt-0.5">
                        {unlocked ? "✓ Desbloqueado" : "En Cofres"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </main>
      )}

      {/* =================================================================== */}
      {/* TAB 2: AJUSTES (CONFIGURACIÓN DE CUENTA Y PREFERENCIAS)              */}
      {/* =================================================================== */}
      {activeTab === "ajustes" && (
        <main className="flex-1 mx-auto w-full max-w-md px-5 space-y-3 relative z-10 animate-fade-in">
          <div className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-xl backdrop-blur-md">
            {/* Nombre */}
            <section className="mb-6">
              <div className="flex items-center gap-3">
                <label className="relative flex-1">
                  <span className="absolute -top-2 left-4 bg-[color:var(--brand-navy-deep)] px-1 text-[11px] text-[color:var(--brand-cyan)] font-semibold">
                    Nombre
                  </span>
                  <input
                    type="text"
                    value={settings.name}
                    maxLength={30}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Tu nombre..."
                    className="h-12 w-full rounded-2xl border border-white/20 bg-black/20 px-4 text-base text-white outline-none focus:border-[color:var(--brand-cyan)] transition-colors"
                  />
                </label>
                <button
                  type="button"
                  onClick={saveName}
                  aria-label="Guardar nombre"
                  className="grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--brand-cyan)]/20 text-[color:var(--brand-cyan)] border border-[color:var(--brand-cyan)]/30 transition hover:bg-[color:var(--brand-cyan)]/30 active:scale-95 shadow-md"
                >
                  <Save className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-1 pr-16 text-right text-xs text-white/40">
                {settings.name.length}/30
              </div>
            </section>

            {/* Account Info Section */}
            <section className="mb-6 rounded-2xl p-4 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900/40 border border-cyan-400/30 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center font-bold text-sm shrink-0 border border-cyan-400/30">
                  {currentUser?.email ? <Mail className="w-5 h-5" /> : "👤"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                    {currentUser?.email ? "Cuenta Oficial Sincronizada" : "Modo Invitado"}
                  </div>
                  <div className="text-sm font-bold text-white truncate">
                    {currentUser?.email || "Sin correo vinculado"}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-white/70 pt-2 border-t border-white/10">
                <span>Estado de cuenta:</span>
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  {isVip ? "⭐ Rango VIP Activo" : "Estándar"}
                </span>
              </div>
            </section>

            {/* VIP Section */}
            <section className="mb-2 rounded-2xl p-4 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-400/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                    <Crown className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-amber-300 uppercase tracking-wide">
                      {isVip ? "Membresía VIP Activa" : "Membresía VIP"}
                    </div>
                    <div className="text-[11px] text-white/60">
                      {isVip ? "Acceso completo a salas VIP" : "$99 MXN / mes • Cancela cuando quieras"}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-white/80 leading-relaxed mb-3">
                {isVip
                  ? "Tienes habilitado el panel administrativo para crear y programar salas VIP con rondas, premios y pre-registro."
                  : "Desbloquea el panel para crear y programar torneos con rondas personalizadas, premios y lista de invitados."}
              </p>

              {isVip ? (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/crear-sala-vip" })}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
                  >
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    Ir al Panel de Salas VIP
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVipModal(true)}
                    className="w-full py-1 text-[11px] text-amber-300/80 hover:text-amber-300 font-bold text-center underline decoration-amber-400/40"
                  >
                    Ver beneficios y detalles de membresía
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowVipModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
                >
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  Suscribirme a VIP ($99 MXN)
                </button>
              )}
            </section>
          </div>

          {/* Preferencias de Sonido y Voz */}
          <div className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-xl backdrop-blur-md">
            <RowToggle
              title="Audio"
              subtitle="Grita el nombre de las cartas"
              value={settings.audio}
              onChange={(v) => update("audio", v)}
            />

            <div className="h-px bg-white/10 w-full my-2" />

            <RowSelect
              title="Voz del gritón"
              subtitle={voiceLabel}
              right={<span className="text-3xl drop-shadow-md">{voiceEmoji}</span>}
              onClick={() => {
                const order: Settings["voice"][] = ["mujer", "hombre", "nino"];
                const idx = order.indexOf(settings.voice);
                const nextVoice = order[(idx + 1) % order.length];

                const isUnlocked =
                  localStorage.getItem(`garza:unlocked:voice:${nextVoice}`) === "true" ||
                  nextVoice === "mujer";
                if (!isUnlocked) {
                  if (onNavigateTienda) onNavigateTienda();
                } else {
                  update("voice", nextVoice);
                }
              }}
            />

            <div className="h-px bg-white/10 w-full my-2" />

            <RowToggle
              title="Efectos de sonido"
              value={settings.sfx}
              onChange={(v) => update("sfx", v)}
            />

            <div className="h-px bg-white/10 w-full my-2" />

            <RowToggle
              title="Vibración"
              value={settings.vibration}
              onChange={(v) => update("vibration", v)}
            />
          </div>

          {/* Baraja y Juego */}
          <div className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-xl backdrop-blur-md">
            <RowSelect
              title="Estilo de Baraja"
              subtitle="Cartas clásicas o modernas"
              right={
                <div
                  className="grid h-12 w-9 place-items-center rounded-md text-xl shadow-md border border-white/20"
                  style={{
                    background:
                      "linear-gradient(180deg, #FFE68A 0%, #F6C13B 45%, #E9E9E9 46%, #E9E9E9 100%)",
                  }}
                >
                  🐓
                </div>
              }
              onClick={() => {
                const nextStyle = settings.deckStyle === "clasica" ? "moderna" : "clasica";
                const isUnlocked =
                  localStorage.getItem(`garza:unlocked:deck:${nextStyle}`) === "true" ||
                  nextStyle === "clasica";
                if (!isUnlocked) {
                  if (onNavigateTienda) onNavigateTienda();
                } else {
                  update("deckStyle", nextStyle);
                }
              }}
            />

            <div className="h-px bg-white/10 w-full my-2" />

            <RowToggle
              title="Confetti"
              subtitle="Efecto visual al ganar"
              value={settings.confetti}
              onChange={(v) => update("confetti", v)}
            />

            <div className="h-px bg-white/10 w-full my-2" />

            <RowToggle
              title="Modo clásico"
              subtitle="Solo permite mesas de 4x4"
              value={settings.classicMode}
              onChange={(v) => update("classicMode", v)}
            />

            <div className="h-px bg-white/10 w-full my-2" />

            <section className="flex items-center justify-between py-3">
              <span className="text-sm font-bold text-white/90">Vista de Tablas</span>
              <button
                type="button"
                onClick={() =>
                  update("tableView", settings.tableView === "rejilla" ? "lista" : "rejilla")
                }
                className="inline-flex items-center gap-2 text-sm text-[color:var(--brand-cyan)] bg-[color:var(--brand-cyan)]/10 px-3 py-1.5 rounded-lg font-semibold"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="capitalize">{settings.tableView}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </section>

          </div>

          {/* Legal, Privacidad y Derechos de Autor */}
          <div className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-xl backdrop-blur-md space-y-1">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
              <Scale className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                Marco Legal y Transparencia
              </span>
            </div>

            <RowSelect
              title="Aviso de Privacidad (LFPDPPP)"
              subtitle="Tratamiento y protección de tus datos"
              right={<ShieldCheck className="w-5 h-5 text-cyan-300" />}
              onClick={() => setLegalModalTab("privacidad")}
            />

            <div className="h-px bg-white/10 w-full my-1" />

            <RowSelect
              title="Términos y Condiciones de Uso"
              subtitle="Reglas comunitarias y de servicio"
              right={<FileText className="w-5 h-5 text-white/60" />}
              onClick={() => setLegalModalTab("terminos")}
            />

            <div className="h-px bg-white/10 w-full my-1" />

            <RowSelect
              title="Derechos de Autor y Folclore"
              subtitle="Disclaimer de marcas tradicionales"
              right={<Copyright className="w-5 h-5 text-amber-300" />}
              onClick={() => setLegalModalTab("copyright")}
            />

            <div className="h-px bg-white/10 w-full my-1" />

            <RowSelect
              title="Aviso de Moneda Virtual"
              subtitle="Juego social sin apuestas reales"
              right={<Coins className="w-5 h-5 text-yellow-400" />}
              onClick={() => setLegalModalTab("monedas")}
            />
          </div>

          {/* Acciones de Cuenta */}
          <div className="flex flex-col gap-2.5 pt-2">
            {/* Cerrar sesión */}
            <button
              type="button"
              onClick={() => {
                logoutUser();
                window.location.href = "/";
              }}
              className="w-full bg-white/10 hover:bg-white/15 text-white/90 border border-white/15 rounded-2xl py-3.5 font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>

            {/* Eliminar cuenta y datos (Requisito Play Store / App Store) */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/25 rounded-2xl py-3 font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar mi cuenta y borrar datos</span>
            </button>
          </div>

          {/* Footer de Derechos Reservados */}
          <div className="pt-4 pb-24 text-center space-y-1">
            <p className="text-xs text-white/40">
              © 2025 - 2026 Lotería La Garza. Todos los derechos reservados.
            </p>
            <p className="text-[10px] text-white/30">
              Hecho con orgullo y tradición en México • Versión 1.0.0
            </p>
          </div>
        </main>
      )}

      {/* Modal de Aviso Legal */}
      <LegalNoticeModal
        open={Boolean(legalModalTab)}
        initialTab={legalModalTab || "privacidad"}
        onClose={() => setLegalModalTab(null)}
      />

      {/* Modal de Confirmación para Eliminar Cuenta */}
      {showDeleteConfirm && (
        <div
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-slate-950 border border-red-500/40 shadow-2xl p-6 text-center text-white animate-pop-in relative"
          >
            <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-white mb-1.5">
              ¿Eliminar cuenta definitivamente?
            </h3>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Esta acción es <strong>irreversible</strong>. Se eliminará tu cuenta en la nube, tu nombre de jugador, todas tus monedas acumuladas, barajas desbloqueadas y estadísticas de juego.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteUserAccount(currentUser?.email);
                    window.location.href = "/";
                  } catch {
                    setIsDeleting(false);
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs transition shadow-lg shadow-red-950/60 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? "Eliminando cuenta..." : "Sí, eliminar mi cuenta y datos"}</span>
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 active:scale-95 font-bold text-xs transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* CLASH ROYALE INSPECT & PREVIEW MODAL                                */}
      {/* =================================================================== */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-400/50 shadow-2xl p-5 flex flex-col items-center text-center animate-pop-in">
            {/* Close Button */}
            <button
              onClick={() => setInspectItem(null)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Rarity Ribbon */}
            <span
              className={`text-[10px] font-game uppercase tracking-widest px-3 py-1 rounded-full mb-3 border shadow-sm ${
                inspectItem.rarity === "legendaria"
                  ? "bg-pink-500/20 border-pink-400 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.6)]"
                  : inspectItem.rarity === "epica"
                  ? "bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.5)]"
                  : inspectItem.rarity === "especial"
                  ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                  : "bg-slate-700/40 border-slate-500 text-slate-300"
              }`}
            >
              {inspectItem.rarity.toUpperCase()}
            </span>

            {/* Showcase Stage */}
            <div className="my-2 relative flex items-center justify-center">
              {/* Deck Stage */}
              {inspectItem.type === "deck" && inspectItem.deckConfig && (() => {
                const inspectedCard = getThemedCard(deckInspectCardNum, inspectItem.deckConfig.id);
                return (
                  <div className="relative flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playSfx("pop");
                          setDeckInspectCardNum((prev) => (prev <= 1 ? 54 : prev - 1));
                        }}
                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition active:scale-95 shadow-lg"
                        title="Carta anterior"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <div className="relative group flex flex-col items-center">
                        <div
                          className="absolute inset-0 rounded-2xl blur-xl opacity-60 pointer-events-none"
                          style={{ background: inspectItem.deckConfig.accentColor }}
                        />
                        <img
                          src={inspectedCard?.image || inspectItem.deckConfig.sampleCardImage}
                          alt={inspectedCard?.name || inspectItem.deckConfig.name}
                          decoding="async"
                          onError={(e) => {
                            if (inspectedCard?.fallbackImage && e.currentTarget.src !== inspectedCard.fallbackImage) {
                              e.currentTarget.src = inspectedCard.fallbackImage;
                            }
                          }}
                          className="w-32 sm:w-36 aspect-[2/3] object-cover rounded-xl border-2 shadow-2xl relative z-10 transition-transform group-hover:scale-105"
                          style={{ borderColor: inspectItem.deckConfig.accentColor }}
                        />
                        <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 border border-white/20 z-20">
                          <span className="text-[11px] font-game text-amber-300">
                            #{deckInspectCardNum} {inspectedCard?.name || `Carta ${deckInspectCardNum}`}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playSfx("pop");
                          setDeckInspectCardNum((prev) => (prev >= 54 ? 1 : prev + 1));
                        }}
                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition active:scale-95 shadow-lg"
                        title="Siguiente carta"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-white/60">
                      Usa las flechas para explorar las 54 cartas de la baraja
                    </p>
                  </div>
                );
              })()}

              {/* Wallpaper Stage */}
              {inspectItem.type === "wallpaper" && inspectItem.wallpaperConfig && (
                <div
                  className={`w-64 h-36 rounded-2xl bg-gradient-to-br ${inspectItem.wallpaperConfig.previewGradient} border-2 flex flex-col items-center justify-center p-3 shadow-2xl relative overflow-hidden`}
                  style={{ borderColor: inspectItem.wallpaperConfig.accentColor }}
                >
                  {inspectItem.wallpaperConfig.backgroundImage ? (
                    <img
                      src={inspectItem.wallpaperConfig.backgroundImage}
                      alt={inspectItem.wallpaperConfig.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <Layers
                      className="w-14 h-14 drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                      style={{ color: inspectItem.wallpaperConfig.accentColor }}
                    />
                  )}
                  <span className="text-[10px] font-game text-white/90 uppercase tracking-widest mt-auto px-2.5 py-0.5 rounded-full bg-black/70 border border-white/20 relative z-10">
                    {inspectItem.wallpaperConfig.subtitle}
                  </span>
                </div>
              )}

              {/* Sticker / Emote Stage */}
              {inspectItem.type === "sticker" && (
                <div
                  onClick={triggerStickerReaction}
                  className={`w-32 h-32 rounded-3xl bg-white/10 border-2 border-white/20 flex items-center justify-center p-3 shadow-2xl cursor-pointer select-none transition-transform ${
                    previewStickerBounce ? "animate-chest-reaction scale-125" : "hover:scale-105"
                  }`}
                >
                  {inspectItem.image ? (
                    <img
                      src={inspectItem.image}
                      alt={inspectItem.title}
                      className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                    />
                  ) : (
                    <span className="text-6xl drop-shadow">{inspectItem.emoji}</span>
                  )}
                </div>
              )}

              {/* Marker Token Stage */}
              {inspectItem.type === "marker" && (
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-amber-400/50 flex items-center justify-center p-3 shadow-2xl">
                  {inspectItem.image ? (
                    <img
                      src={inspectItem.image}
                      alt={inspectItem.title}
                      className="w-16 h-16 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] animate-pop-in"
                    />
                  ) : (
                    <span className="text-5xl drop-shadow">{inspectItem.emoji}</span>
                  )}
                </div>
              )}

              {/* Emoji Pack Stage */}
              {inspectItem.type === "emoji" && (
                <div className="w-28 h-28 rounded-3xl bg-white/10 border-2 border-white/20 flex items-center justify-center p-3 shadow-2xl">
                  <span className="text-6xl drop-shadow">{inspectItem.emoji}</span>
                </div>
              )}
            </div>

            {/* Title & Lore */}
            <h3 className="text-lg font-game game-title text-white mt-1 leading-tight">
              {inspectItem.title}
            </h3>
            <p className="text-xs text-white/70 max-w-[280px] leading-relaxed mt-1">
              {inspectItem.description}
            </p>

            {/* Source / Unlock Status */}
            <div className="my-3 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/60">
              {ownedIds.includes(inspectItem.id) ||
              inspectItem.id === "wp_clasico" ||
              inspectItem.id === "marker_frijol" ||
              inspectItem.id === "marker_ficha" ||
              inspectItem.id === "deck_clasica" ? (
                <span className="text-emerald-300 font-bold flex items-center gap-1 justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" /> En tu colección
                </span>
              ) : (
                <span className="flex items-center gap-1 justify-center">
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>{inspectItem.sourceHint || "Disponible en Cofres"}</span>
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2 pt-1">
              {/* Deck Action */}
              {inspectItem.type === "deck" && inspectItem.deckConfig && (
                <>
                  {equippedDeck.id === inspectItem.deckConfig.id ? (
                    <div className="py-2.5 px-4 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-game text-xs flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Baraja Activa en Todas tus Partidas</span>
                    </div>
                  ) : isDeckSkinUnlocked(inspectItem.deckConfig.id) ? (
                    <button
                      onClick={() => inspectItem.deckConfig && handleEquipDeck(inspectItem.deckConfig)}
                      className="btn-clash-green py-2.5 px-6 rounded-full text-xs font-game tracking-wide shadow-xl active:translate-y-[2px]"
                    >
                      <span>Equipar Baraja</span>
                    </button>
                  ) : (
                    onNavigateTienda && (
                      <button
                        onClick={() => {
                          setInspectItem(null);
                          onNavigateTienda();
                        }}
                        className="btn-clash-yellow py-2.5 px-6 rounded-full text-xs font-game tracking-wide shadow-xl flex items-center justify-center gap-1.5 active:translate-y-[2px]"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Ir al Cofre de Temporada</span>
                      </button>
                    )
                  )}
                </>
              )}

              {/* Wallpaper Action */}
              {inspectItem.type === "wallpaper" && inspectItem.wallpaperConfig && (
                <>
                  {equippedWp.id === inspectItem.wallpaperConfig.id ? (
                    <div className="py-2.5 px-4 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-game text-xs flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Actualmente Equipado en Partidas</span>
                    </div>
                  ) : isWallpaperUnlocked(inspectItem.wallpaperConfig.id) ? (
                    <button
                      onClick={() => inspectItem.wallpaperConfig && handleEquipWallpaper(inspectItem.wallpaperConfig)}
                      className="btn-clash-green py-2.5 px-6 rounded-full text-xs font-game tracking-wide shadow-xl active:translate-y-[2px]"
                    >
                      <span>Equipar Tapete</span>
                    </button>
                  ) : (
                    onNavigateTienda && (
                      <button
                        onClick={() => {
                          setInspectItem(null);
                          onNavigateTienda();
                        }}
                        className="btn-clash-yellow py-2.5 px-6 rounded-full text-xs font-game tracking-wide shadow-xl flex items-center justify-center gap-1.5 active:translate-y-[2px]"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Ir a Buscar en Cofres</span>
                      </button>
                    )
                  )}
                </>
              )}

              {/* Marker Action */}
              {inspectItem.type === "marker" && inspectItem.markerData && (
                <>
                  {equippedMarkerState.id === inspectItem.markerData.id ? (
                    <div className="py-2.5 px-4 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-game text-xs flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>En Uso en tus Tablas</span>
                    </div>
                  ) : ownedIds.includes(inspectItem.markerData.id) ||
                    inspectItem.markerData.id === "marker_frijol" ||
                    inspectItem.markerData.id === "marker_ficha" ? (
                    <button
                      onClick={() => inspectItem.markerData && handleEquipMarker(inspectItem.markerData)}
                      className="btn-clash-green py-2.5 px-6 rounded-full text-xs font-game tracking-wide shadow-xl active:translate-y-[2px]"
                    >
                      <span>Usar este Marcador</span>
                    </button>
                  ) : (
                    onNavigateTienda && (
                      <button
                        onClick={() => {
                          setInspectItem(null);
                          onNavigateTienda();
                        }}
                        className="btn-clash-yellow py-2.5 px-6 rounded-full text-xs font-game tracking-wide shadow-xl flex items-center justify-center gap-1.5 active:translate-y-[2px]"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Conseguir en Cofres</span>
                      </button>
                    )
                  )}
                </>
              )}

              {/* Sticker Action */}
              {inspectItem.type === "sticker" && (
                <>
                  <button
                    onClick={triggerStickerReaction}
                    className="btn-clash-yellow py-2 px-5 rounded-full text-xs font-game tracking-wide shadow-md flex items-center justify-center gap-1.5 active:translate-y-[2px]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Probar Reacción</span>
                  </button>
                  <p className="text-[11px] text-white/60 mt-1">
                    Úsalo en partidas tocando el botón de Stickers en el chat de juego.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vip Subscription Modal */}
      <VipSubscriptionModal
        open={showVipModal}
        onClose={() => setShowVipModal(false)}
        onSuccess={() => {
          setIsVip(true);
          setShowVipModal(false);
          navigate({ to: "/crear-sala-vip" });
        }}
      />
    </div>
  );
}

function RowToggle({
  title,
  subtitle,
  value,
  onChange,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <section className="flex items-center gap-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-white/90">{title}</div>
        {subtitle && (
          <div className="mt-0.5 text-xs text-white/50 leading-tight">{subtitle}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors border border-white/10 shadow-inner ${
          value ? "bg-[color:var(--brand-cyan)]" : "bg-black/40"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all ${
            value ? "left-6" : "left-1 opacity-60"
          }`}
        />
      </button>
    </section>
  );
}

function RowSelect({
  title,
  subtitle,
  right,
  onClick,
}: {
  title: string;
  subtitle?: string;
  right: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 py-3 text-left transition active:scale-[0.98] group"
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">
          {title}
        </div>
        {subtitle && (
          <div className="mt-0.5 text-xs text-white/50 leading-tight">{subtitle}</div>
        )}
      </div>
      <div className="shrink-0">{right}</div>
    </button>
  );
}
