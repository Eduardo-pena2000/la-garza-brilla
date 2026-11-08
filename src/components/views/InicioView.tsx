import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { 
  Plus, Star, ChevronRight, Layers, Pointer, Users, Coins, Crown, Sparkles, 
  Calendar, Trophy, LayoutGrid, Lock, Globe, Flame, Package, X, AlertCircle, 
  ShoppingCart, Check, Zap, Clock, ShieldCheck, Gift 
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import cardsFan from "@/assets/cards-fan.png";
import trophy from "@/assets/trophy.png";
import featureJoin from "@/assets/feature-join.png";
import featureDecks from "@/assets/feature-decks.png";
import featureShop from "@/assets/feature-shop.png";
import colMuertos from "@/assets/col-muertos.jpg";
import { VipSubscriptionModal } from "@/components/VipSubscriptionModal";
import { JoinTableSelectionModal } from "@/components/JoinTableSelectionModal";
import { CoinAnimation } from "@/components/CoinAnimation";
import { ChestOpeningModal } from "@/components/ChestOpeningModal";
import { DailyRouletteModal, getRouletteCooldown } from "@/components/DailyRouletteModal";
import { CHESTS, openChest, type ChestConfig, type RewardItem } from "@/lib/chests";

export function InicioView({ 
  onNavigateTienda, 
  onNavigateTablas,
  onOpenSidebar,
  onOpenPlayModal
}: { 
  onNavigateTienda: () => void; 
  onNavigateTablas: () => void; 
  onOpenSidebar: () => void;
  onOpenPlayModal?: () => void;
}) {
  const navigate = useNavigate();
  const [name, setName] = useState("Invitado");
  const [coins, setCoins] = useState(500);
  const [isVIP, setIsVIP] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [showRouletteModal, setShowRouletteModal] = useState(false);
  const [rouletteCooldown, setRouletteCooldown] = useState({ canSpinFree: true, remainingMs: 0 });
  const [isTutorial, setIsTutorial] = useState(false);
  const [publicMesas, setPublicMesas] = useState<any[]>([]);
  const [pendingJoinMesa, setPendingJoinMesa] = useState<any>(null);

  // Password Modal State for Locked Mesas
  const [selectedLockedMesa, setSelectedLockedMesa] = useState<any>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Seasonal Clash Royale Offers State
  const [selectedPromoOffer, setSelectedPromoOffer] = useState<any>(null);
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState<string>("");
  const [activeChest, setActiveChest] = useState<ChestConfig | null>(null);
  const [chestRewards, setChestRewards] = useState<RewardItem[]>([]);

  useEffect(() => {
    const mesasRef = ref(database, "mesas");
    const unsubscribe = onValue(mesasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const now = Date.now();
        const communityList = Object.values(data).filter((m: any) => {
          if (!m || m.status === "terminada") return false;
          // Ignorar partidas inactivas/abandonadas mayores a 3 horas o sin jugadores
          if (m.createdAt && now - m.createdAt > 3 * 3600 * 1000) return false;
          if (!m.players || Object.keys(m.players).length === 0) return false;
          // Torneos y salas VIP quedan excluidos de las mesas públicas
          if (m.isVip || m.mode === "VIP" || m.isScheduled) return false;
          // Debe estar en espera (abierta) o en juego
          return m.status === "abierta" || m.status === "en-juego";
        });

        // Ordenar por popularidad y cupos disponibles
        const ranked = communityList.sort((a: any, b: any) => {
          const aPlayers = a.players ? Object.keys(a.players).length : 0;
          const bPlayers = b.players ? Object.keys(b.players).length : 0;
          const aMax = a.maxPlayers || 4;
          const bMax = b.maxPlayers || 4;

          const aFull = aPlayers >= aMax;
          const bFull = bPlayers >= bMax;

          // Primero mesas con lugares disponibles
          if (!aFull && bFull) return -1;
          if (aFull && !bFull) return 1;

          // Primero mesas en espera (abierta) antes que en juego
          if (a.status === "abierta" && b.status !== "abierta") return -1;
          if (b.status === "abierta" && a.status !== "abierta") return 1;

          // Más jugadores activos primero (más populares)
          if (bPlayers !== aPlayers) return bPlayers - aPlayers;

          // Más recientes
          return (b.createdAt || 0) - (a.createdAt || 0);
        });

        setPublicMesas(ranked.slice(0, 8));
      } else {
        setPublicMesas([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadState = () => {
      try {
        const stored = localStorage.getItem("garza:name");
        if (stored) setName(stored);

        const storedCoins = localStorage.getItem("garza:coins");
        if (storedCoins) setCoins(parseInt(storedCoins, 10));
        else localStorage.setItem("garza:coins", "0");

        const storedVIP = localStorage.getItem("garza:vip");
        setIsVIP(storedVIP === "true");
        
        const storedTablas = localStorage.getItem("garza:tablas");
        if (!storedTablas || JSON.parse(storedTablas).length === 0) {
          setIsTutorial(true);
        } else {
          setIsTutorial(false);
        }
      } catch {
        /* ignore */
      }
    };
    
    loadState();
    window.addEventListener("garza:tablas-updated", loadState);
    window.addEventListener("garza:vip-updated", loadState);
    window.addEventListener("garza:coins-updated", loadState);
    return () => {
      window.removeEventListener("garza:tablas-updated", loadState);
      window.removeEventListener("garza:vip-updated", loadState);
      window.removeEventListener("garza:coins-updated", loadState);
    };
  }, []);

  // Timer for Daily Roulette cooldown
  useEffect(() => {
    setRouletteCooldown(getRouletteCooldown());
    const t = setInterval(() => {
      setRouletteCooldown(getRouletteCooldown());
    }, 1000);
    return () => clearInterval(t);
  }, [showRouletteModal]);

  const features = [
    { img: null, title: "Crear mesa", desc: "Inicia tu propia partida", onClick: () => navigate({ to: "/abrir-mesa" }) },
    { img: featureJoin, title: "Unirse a mesa", desc: "Entra a una mesa con código", onClick: () => navigate({ to: "/unirse" }) },
    { img: featureDecks, title: "Mis barajas", desc: "Administra tus barajas", onClick: onNavigateTablas },
    { img: featureShop, title: "Tienda", desc: "Compra monedas, barajas y más", onClick: onNavigateTienda },
  ];

  // Reclamar recompensas de cofre abierto en el menú de inicio
  const handleClaimRewards = (rewards: RewardItem[]) => {
    let addedCoins = 0;
    let owned: string[] = [];
    try {
      const raw = localStorage.getItem("garza:owned");
      if (raw) owned = JSON.parse(raw);
    } catch {}

    rewards.forEach((r) => {
      if (r.type === "coins" && r.amount) {
        addedCoins += r.amount;
      } else if (r.id && !owned.includes(r.id)) {
        owned.push(r.id);
      }
    });

    if (addedCoins > 0) {
      const current = parseInt(localStorage.getItem("garza:coins") || "0", 10);
      const updated = current + addedCoins;
      setCoins(updated);
      localStorage.setItem("garza:coins", updated.toString());
      window.dispatchEvent(new Event("garza:coins-updated"));
    }

    localStorage.setItem("garza:owned", JSON.stringify(owned));
    setActiveChest(null);
    setChestRewards([]);
  };

  // Compra directa de oferta de temporada
  const handleBuyPromoOffer = (promo: any) => {
    if (!promo.isCoins) {
      if (promo.type === "vip") {
        setSelectedPromoOffer(null);
        setShowVipModal(true);
        return;
      }
      setSelectedPromoOffer(null);
      onNavigateTienda();
      return;
    }

    if (coins < promo.price) {
      return;
    }

    const updatedCoins = coins - promo.price;
    setCoins(updatedCoins);
    localStorage.setItem("garza:coins", updatedCoins.toString());
    window.dispatchEvent(new Event("garza:coins-updated"));

    if (promo.type === "chest") {
      const chestConfig = CHESTS.find((c) => c.id === promo.chestId) || CHESTS[2];
      const generated = openChest(chestConfig);
      setSelectedPromoOffer(null);
      setActiveChest(chestConfig);
      setChestRewards(generated);
      return;
    }

    let owned: string[] = [];
    try {
      const raw = localStorage.getItem("garza:owned");
      if (raw) owned = JSON.parse(raw);
    } catch {}

    if (promo.type === "deck") {
      if (!owned.includes("deck_muertos")) owned.push("deck_muertos");
      setPurchaseSuccessMessage("¡Colección Catrinas & Calaveras desbloqueada!");
    } else if (promo.type === "stickers") {
      if (!owned.includes("stickers_halloween")) owned.push("stickers_halloween");
      setPurchaseSuccessMessage("¡Pack de Stickers de Terror desbloqueado!");
    } else if (promo.type === "skin") {
      if (!owned.includes("skin_cempasuchil")) owned.push("skin_cempasuchil");
      setPurchaseSuccessMessage("¡Dorso Cempasúchil Dorado desbloqueado!");
    } else if (promo.type === "mini_bundle") {
      const bonus = updatedCoins + 300;
      setCoins(bonus);
      localStorage.setItem("garza:coins", bonus.toString());
      window.dispatchEvent(new Event("garza:coins-updated"));
      if (!owned.includes("sticker_calabaza")) owned.push("sticker_calabaza");
      setPurchaseSuccessMessage("¡Mini Lote reclamado! +300 Monedas y Sticker Calabaza.");
    }

    localStorage.setItem("garza:owned", JSON.stringify(owned));
    setSelectedPromoOffer(null);
    setTimeout(() => setPurchaseSuccessMessage(""), 4000);
  };

  // Ofertas de la Tienda y Especial de Temporada
  const seasonalStorePromos = [
    {
      id: "promo-halloween-chest",
      type: "chest",
      chestId: "magico",
      title: "Cofre de Ultratumba",
      subtitle: "Especial de Halloween",
      desc: "Probabilidad x2 de legendarias y botín místico",
      price: 1200,
      isCoins: true,
      badge: "🎃 TEMPORADA",
      badgeColor: "bg-purple-500/25 text-purple-300 border-purple-400/40",
      image: "/chests/chest_magical.jpg",
      glowColor: "rgba(168, 85, 247, 0.5)",
      content: [
        { label: "Monedas de Oro", value: "1,200 - 3,000 Monedas", sub: "Garantizadas al instante", icon: "coins" },
        { label: "Cartas de Lotería", value: "5 Cartas Aseguradas", sub: "2 de rareza Épica o superior", icon: "cards" },
        { label: "Especial Halloween", value: "x2 Probabilidad Legendaria", sub: "Mayor probabilidad de cartas míticas", icon: "sparkles" },
        { label: "Bonus de Temporada", value: "Stickers de Terror", sub: "La Llorona, Fantasma y Calabaza", icon: "gift" },
      ],
    },
    {
      id: "promo-gold-chest",
      type: "chest",
      chestId: "oro",
      title: "Cofre de Oro Imperial",
      subtitle: "Botín Seguro de Monedas",
      desc: "Monedas gigantes y cartas especiales garantizadas",
      price: 800,
      isCoins: true,
      badge: "⭐ POPULAR",
      badgeColor: "bg-amber-500/25 text-amber-300 border-amber-400/40",
      image: "/chests/chest_gold.jpg",
      glowColor: "rgba(245, 158, 11, 0.5)",
      content: [
        { label: "Monedas de Oro", value: "1,000 - 2,500 Monedas", sub: "Botín gigante asegurado", icon: "coins" },
        { label: "Cartas de Lotería", value: "4 Cartas Aseguradas", sub: "1 Carta Especial garantizada", icon: "cards" },
        { label: "Cosméticos", value: "Marcador Frijol de Oro", sub: "Skin especial para marcar en juego", icon: "sparkles" },
      ],
    },
    {
      id: "promo-legendary-chest",
      type: "chest",
      chestId: "legendario",
      title: "Gran Cofre de La Garza",
      subtitle: "Cofre Supremo Legendario",
      desc: "¡Carta dorada legendaria 100% asegurada!",
      price: 2500,
      isCoins: true,
      badge: "👑 LEGENDARIO",
      badgeColor: "bg-cyan-500/25 text-cyan-300 border-cyan-400/40",
      image: "/chests/chest_magical.jpg",
      glowColor: "rgba(6, 182, 212, 0.6)",
      content: [
        { label: "Monedas de Oro", value: "6,000 - 15,000 Monedas", sub: "La mayor fortuna en monedas del juego", icon: "coins" },
        { label: "Carta Legendaria", value: "¡1 Legendaria 100% Garantizada!", sub: "Una carta dorada mística para tus barajas", icon: "sparkles" },
        { label: "Cartas de Lotería", value: "6 Cartas de Lotería", sub: "Selección de las cartas más codiciadas", icon: "cards" },
        { label: "Insignia de Perfil", value: "Corona Real Exclusiva", sub: "Distintivo legendario en salas y chat", icon: "crown" },
      ],
    },
    {
      id: "promo-muertos-deck",
      type: "deck",
      title: "Calaveras & Catrinas",
      subtitle: "Baraja Día de Muertos",
      desc: "16 cartas tradicionales en ultra alta definición",
      price: 350,
      isCoins: true,
      badge: "💀 LIMITADA",
      badgeColor: "bg-orange-500/25 text-orange-300 border-orange-400/40",
      image: colMuertos,
      glowColor: "rgba(249, 115, 22, 0.5)",
      content: [
        { label: "Baraja Completa", value: "16 Cartas Ilustradas HD", sub: "Catrinas, calacas y flores tradicionales", icon: "cards" },
        { label: "Marco Festivo", value: "Dorado con Cempasúchil", sub: "Estilo visual conmemorativo", icon: "sparkles" },
        { label: "Uso Permanente", value: "Desbloqueo Ilimitado", sub: "Úsala en todas tus mesas públicas y privadas", icon: "gift" },
      ],
    },
    {
      id: "promo-vip-pass",
      type: "vip",
      title: "Pase VIP La Garza",
      subtitle: "Membresía Mensual",
      desc: "Salas VIP privadas, torneos programados y 0 anuncios",
      price: "$99 MXN",
      isCoins: false,
      badge: "👑 VIP PASS",
      badgeColor: "bg-yellow-400/25 text-yellow-300 border-yellow-400/50",
      iconComponent: Crown,
      glowColor: "rgba(251, 191, 36, 0.5)",
      content: [
        { label: "Salas VIP Privadas", value: "Panel Administrativo de Salas", sub: "Programa día y hora, define rondas con premios", icon: "crown" },
        { label: "Sin Anuncios", value: "100% Libre de Publicidad", sub: "Juega sin interrupciones ni pausas", icon: "sparkles" },
        { label: "Monedas de Regalo", value: "+2,000 Monedas de Oro", sub: "Acreditadas inmediatamente en tu cuenta", icon: "coins" },
      ],
    },
  ];

  function handleMesaClick(mesa: any) {
    if (mesa.locked) {
      setSelectedLockedMesa(mesa);
      setPasswordInput("");
      setPasswordError("");
    } else {
      setPendingJoinMesa(mesa);
    }
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLockedMesa) return;

    if (passwordInput.trim() === selectedLockedMesa.password) {
      const target = selectedLockedMesa;
      setSelectedLockedMesa(null);
      setPendingJoinMesa(target);
    } else {
      setPasswordError("Contraseña incorrecta");
    }
  }

  return (
    <div className="flex flex-col mx-auto h-full w-full max-w-md pb-36 pt-5 overflow-x-hidden relative scroll-touch-y">
      {/* Overlay para el tutorial */}
      {isTutorial && (
        <div 
          onClick={onNavigateTablas}
          className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm cursor-pointer transition-opacity animate-fade-in"
          title="Toca para ir a crear tu primera baraja"
        />
      )}

      {/* Top bar */}
      <header className="flex items-center justify-between px-4 relative z-10 shrink-0 gap-2">
        {/* TOP LEFT: Ruleta Diaria de la Suerte */}
        <button
          onClick={() => setShowRouletteModal(true)}
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-900/70 via-amber-900/50 to-black/80 border-2 border-amber-400/70 shadow-[0_4px_15px_rgba(245,158,11,0.35)] hover:scale-105 active:scale-95 transition-all group cursor-pointer"
        >
          <div className="w-6 h-6 shrink-0 relative flex items-center justify-center animate-spin-slow">
            <img src="/roulette/wheel_disc.png" alt="Ruleta" className="w-full h-full object-contain drop-shadow" />
          </div>
          <span className="font-game text-xs text-amber-300 uppercase tracking-wider group-hover:text-yellow-200">
            Ruleta
          </span>
          {rouletteCooldown.canSpinFree ? (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-game uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse">
              ¡GRATIS!
            </span>
          ) : (
            <span className="text-[10px] font-mono text-white/50 flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
            </span>
          )}
        </button>

        {/* TOP RIGHT: Monedas + Perfil con Marco de Videojuego y Corona VIP */}
        <div className="flex items-center gap-2.5">
          {/* Coins indicator */}
          <div className="surface-card flex items-center gap-1.5 rounded-full py-1 pr-1 pl-2.5 border border-amber-400/30 bg-black/40 shadow-inner">
            <CoinAnimation className="w-5 h-5 drop-shadow" />
            <span className="font-game text-sm text-[color:var(--brand-gold)] font-bold tracking-wide">
              {coins.toLocaleString()}
            </span>
            <button
              onClick={onNavigateTienda}
              className="btn-gold flex size-6 items-center justify-center rounded-full cursor-pointer hover:scale-110 active:scale-95 transition shadow-sm"
              title="Comprar monedas"
            >
              <Plus className="size-3.5 stroke-[3]" />
            </button>
          </div>

          {/* Perfil con Marco de Videojuego y Corona VIP */}
          <button
            onClick={onOpenSidebar}
            className="relative flex items-center justify-center group active:scale-95 transition cursor-pointer"
            title="Ver Perfil"
          >
            {/* Corona VIP flotante en la parte superior del marco si es VIP */}
            {isVIP && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce-gentle">
                <Crown className="w-5 h-5 text-amber-300 fill-amber-400 drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]" />
              </div>
            )}

            {/* Marco de Videojuego 3D para el Avatar */}
            <div
              className={`w-10 h-10 rounded-full p-[2.5px] shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex items-center justify-center relative overflow-hidden transition-all ${
                isVIP
                  ? "bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 shadow-[0_0_15px_rgba(251,191,36,0.5)] ring-2 ring-amber-400/50"
                  : "bg-gradient-to-b from-slate-300 via-slate-500 to-slate-800 ring-2 ring-black/60"
              }`}
            >
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white border border-white/20">
                <span className="font-game text-sm uppercase text-amber-300 drop-shadow">
                  {(name || "G")[0].toUpperCase()}
                </span>
              </div>
            </div>
          </button>
        </div>
      </header>

      {/* Logo */}
      <div className="relative mx-auto -mt-6 flex w-36 items-center justify-center z-10 shrink-0">
        <img
          src="/logo-garza.png?v=6"
          alt="Logo Lotería La Garza"
          width={1920}
          height={1920}
          className="relative w-36 h-36 object-contain"
        />
      </div>

      {/* Hero */}
      <section className="relative px-4 z-10 shrink-0 mt-4">
        <img
          src={cardsFan}
          alt="Cartas de lotería"
          width={912}
          height={800}
          loading="lazy"
          className="pointer-events-none absolute -top-12 -right-2 w-56 drop-shadow-[0_12px_28px_rgba(0,0,0,0.5)]"
        />
        <h1 className="relative text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <span className="truncate max-w-[220px]">¡Hola, {name}!</span> <span aria-hidden className="shrink-0">👋</span>
        </h1>
        <p className="relative mt-2 max-w-[9rem] text-lg leading-tight text-muted-foreground">
          ¿Listo para cantar una partida?
        </p>

        {isTutorial && (
          <button
            type="button"
            onClick={onNavigateTablas}
            className="btn-gold relative mt-6 mb-4 flex w-full sm:w-[75%] items-center justify-center gap-3 rounded-full py-4 text-base sm:text-lg font-black tracking-wide hover:scale-105 active:scale-95 transition z-50 shadow-[0_0_35px_rgba(255,215,0,0.5)] border-2 border-amber-300 animate-pop-in touch-manipulation cursor-pointer"
          >
            <Layers className="size-6" />
            CREAR MI PRIMERA BARAJA
          </button>
        )}
        
        {!isTutorial && (
          <button 
            onClick={onOpenPlayModal}
            className="btn-gold relative mt-6 mb-4 flex w-[68%] items-center justify-center gap-3 rounded-full py-4 text-xl font-extrabold tracking-wide hover:scale-105 active:scale-95 transition"
          >
            <Layers className="size-6" />
            JUGAR AHORA
          </button>
        )}
      </section>

      {/* Features */}
      <section className={`mt-4 grid grid-cols-4 gap-2 px-4 relative shrink-0 ${isTutorial ? "z-50" : "z-20"}`}>
        {features.map((f) => {
          const isTarget = isTutorial && f.title === "Mis barajas";
          return (
            <div key={f.title} className={`relative ${isTarget ? "z-50" : ""}`}>
              {isTarget && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce flex flex-col items-center gap-1 pointer-events-none">
                  <div className="bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)] text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap">
                    Toca aquí
                  </div>
                  <Pointer className="w-8 h-8 text-[color:var(--brand-cyan)] drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] rotate-180" />
                </div>
              )}
              <button
                type="button"
                onClick={f.onClick}
                className={`surface-card flex flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center w-full h-full touch-manipulation cursor-pointer ${
                  isTarget ? "ring-4 ring-[color:var(--brand-cyan)] scale-105 shadow-[0_0_25px_rgba(0,255,255,0.6)] animate-pulse" : ""
                } ${isTutorial && !isTarget ? "opacity-30 pointer-events-none" : "hover:scale-105 active:scale-95 transition"}`}
              >
                {f.img ? (
                  <img
                    src={f.img}
                    alt=""
                    width={512}
                    height={512}
                    loading="lazy"
                    className="size-14 object-contain"
                  />
                ) : (
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-white">
                    <Plus className="size-8" />
                  </span>
                )}
                <span className="text-[11px] font-bold leading-tight">{f.title}</span>
              </button>
            </div>
          );
        })}
      </section>

      {/* VIP Administrative Room Highlight Banner */}
      <section className={`mx-4 mt-4 relative z-10 shrink-0 ${isTutorial ? "opacity-30 pointer-events-none" : ""}`}>
        <div 
          onClick={() => {
            navigate({ to: "/crear-sala-vip" });
          }}
          className="relative rounded-3xl p-4 bg-gradient-to-r from-[#211746] via-[#161033] to-[#2c1a11] border-2 border-amber-400/40 shadow-[0_8px_25px_rgba(245,158,11,0.2)] cursor-pointer hover:border-amber-400 transition-all active:scale-[0.98] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg ring-2 ring-amber-400/50 shrink-0 bg-gradient-to-br from-[#2a174d] to-[#120826] flex items-center justify-center p-0.5">
              <img 
                src="/images/icon-vip.png" 
                alt="VIP Corona Real" 
                className="w-full h-full object-contain scale-110 drop-shadow-[0_4px_12px_rgba(245,158,11,0.6)]"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  {isVIP ? "Panel de Anfitrión" : "Membresía Mensual"}
                </span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              <h3 className="text-base font-black text-white leading-tight mt-0.5 truncate">
                Crear Salas VIP & Torneos
              </h3>
              <p className="text-[11px] text-white/70 leading-snug mt-0.5 line-clamp-2">
                Programa día y hora, define rondas con premios y registra a tus invitados.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-300 shrink-0" />
          </div>
        </div>
      </section>

      {/* Tournament */}
      <section className={`surface-card mx-4 mt-4 flex items-center gap-2 rounded-3xl p-3 relative z-10 shrink-0 ${isTutorial ? "opacity-30 pointer-events-none" : ""}`}>
        <img
          src={trophy}
          alt="Trofeo del torneo"
          width={96}
          height={96}
          decoding="async"
          onError={(e) => {
            if (e.currentTarget.src !== "/images/trophy.png") {
              e.currentTarget.src = "/images/trophy.png";
            }
          }}
          className="size-24 shrink-0 object-contain"
        />
        <div className="min-w-0 flex-1 text-center">
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-[10px] font-bold tracking-wide text-white">
            TORNEO DE ESTA SEMANA
          </span>
          <p className="mt-1 text-lg font-extrabold">GRAN PREMIO</p>
          <p className="text-3xl leading-none font-extrabold text-[color:var(--gold)]">
            $5,000 <span className="text-sm">MXN</span>
          </p>
        </div>
        <div className="w-[5.5rem] shrink-0 text-center">
          <div className="rounded-2xl bg-secondary px-2 py-2">
            <p className="text-[10px] font-bold text-[color:var(--secondary-foreground)]">TERMINA EN</p>
            <p className="text-sm font-bold text-[color:var(--gold)]">2d 14h</p>
          </div>
          <button className="btn-gold mt-2 w-full rounded-full py-1.5 text-xs font-bold hover:scale-105 active:scale-95 transition">
            Participar
          </button>
        </div>
      </section>

      {/* Public Mesas (Comunitarias: con o sin contraseña, sin VIPs) */}
      <section className={`mt-5 relative z-10 shrink-0 mb-6 ${isTutorial ? "opacity-30 pointer-events-none" : ""}`}>
        <div className="flex items-center justify-between px-4 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-1.5">
              <span>Mesas activas</span>
            </h2>
            <span className="text-[10px] font-bold text-white/50 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              Comunidad
            </span>
          </div>
          <button 
            onClick={() => navigate({ to: "/unirse" })}
            className="flex items-center gap-1 text-sm text-amber-300 hover:text-white transition font-medium"
          >
            Ver todas <ChevronRight className="size-4" />
          </button>
        </div>
        
        {publicMesas.length > 0 ? (
          <div className="flex overflow-x-auto gap-3 px-4 pb-4 hide-scrollbar snap-x scroll-touch-x">
            {publicMesas.map((m) => {
              const playersCount = m.players ? Object.keys(m.players).length : 0;
              const isLocked = Boolean(m.locked);
              const isFull = playersCount >= (m.maxPlayers || 4);

              return (
                <button
                  key={m.id}
                  onClick={() => handleMesaClick(m)}
                  className="surface-card flex flex-col gap-2 rounded-2xl p-3 text-left transition active:scale-95 w-52 shrink-0 snap-start shadow-[var(--shadow-card)] border border-white/10 relative hover:border-amber-400/40"
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="text-sm font-black text-white leading-tight truncate flex-1">
                      {m.name}
                    </span>
                    {isLocked ? (
                      <span className="flex items-center gap-1 text-[9px] font-black text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/40 shrink-0">
                        <Lock className="w-2.5 h-2.5" /> Clave
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                        <Globe className="w-2.5 h-2.5" /> Libre
                      </span>
                    )}
                  </div>

                  {/* Host & Mode */}
                  <div className="flex flex-col gap-0.5 text-[10px] text-white/60">
                    <span>Host: <strong className="text-white/80">{m.host}</strong></span>
                    <span>Modo: {m.mode || "Llenas"} ({m.size || "4x4"})</span>
                  </div>

                  {/* Limit & In-Game Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="flex items-center gap-1 rounded-full bg-white/10 border border-white/10 px-2 py-0.5 text-[9px] font-black text-white/90">
                      <LayoutGrid className="size-2.5 text-amber-300" /> Límite: {m.perPlayer || 2} {m.perPlayer === 1 ? "tabla" : "tablas"}
                    </span>
                    {m.status === "en-juego" ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 text-[8px] font-bold text-emerald-300">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> En juego
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 px-1.5 py-0.5 text-[8px] font-bold text-cyan-300">
                        En espera
                      </span>
                    )}
                  </div>

                  {/* Cost & Players Count */}
                  <div className="mt-2 flex items-center justify-between w-full pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1 text-[11px] font-black text-amber-300">
                      <Coins className="size-3" /> {m.cost || 0} c/u
                    </span>
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      isFull ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-white/10 text-white/80"
                    }`}>
                      <Users className="size-2.5" /> {playersCount}/{m.maxPlayers || 4} {isFull ? "(Llena)" : ""}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-3 px-4">
            <div className="surface-card rounded-2xl p-4 text-center border border-white/5 border-dashed">
              <p className="text-sm font-bold text-white/60">No hay mesas públicas en este momento</p>
              <p className="text-xs text-white/40 mt-1">¡Crea tu propia partida e invita a la comunidad!</p>
            </div>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* SECTION: DESTACADOS DE LA TIENDA & COFRES                */}
      {/* ======================================================== */}
      <section className={`mt-2 relative z-10 shrink-0 pb-12 ${isTutorial ? "opacity-30 pointer-events-none" : ""}`}>
        {/* Toast Notificación de Desbloqueo */}
        {purchaseSuccessMessage && (
          <div className="mx-4 mb-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/25 to-teal-500/25 border border-emerald-400/50 text-emerald-200 text-xs font-black flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pop-in">
            <Sparkles className="w-4 h-4 text-emerald-300 shrink-0 animate-spin" />
            <span className="flex-1">{purchaseSuccessMessage}</span>
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between px-4 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-400/40 shadow-[0_0_12px_rgba(249,115,22,0.25)]">
              <Flame className="w-4 h-4 fill-current text-orange-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">
                  Especial de Temporada
                </span>
                <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-purple-500/20 border border-purple-400/40 text-[9px] font-bold text-purple-300">
                  Halloween 🎃
                </span>
              </div>
              <h2 className="text-base font-black text-white leading-tight">
                Destacados de la Tienda
              </h2>
            </div>
          </div>
          <button 
            onClick={onNavigateTienda}
            className="flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-white transition bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 active:scale-95"
          >
            <span>Ver tienda</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        {/* Horizontal Carousel (Cards grandes donde la imagen del cofre abarca todo el card) */}
        <div className="flex gap-3.5 overflow-x-auto px-4 snap-x scroll-touch-x pb-3 pt-1 hide-scrollbar">
          {seasonalStorePromos.map((promo) => (
            <div
              key={promo.id}
              onClick={() => setSelectedPromoOffer(promo)}
              className="relative w-56 shrink-0 rounded-3xl p-3 border-2 border-white/10 bg-gradient-to-b from-[#1c1335] via-[#130b24] to-[#090514] shadow-xl snap-start cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-95 flex flex-col justify-between overflow-hidden group hover:border-amber-400/50"
            >
              {/* Contenedor grande donde la imagen del cofre abarca todo el card */}
              <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                {/* Floating Top Badge */}
                <div className="absolute top-2.5 left-2.5 z-20">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-amber-300 border border-amber-400/40 shadow-lg">
                    {promo.badge}
                  </span>
                </div>

                {promo.image ? (
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : promo.iconComponent ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-400/25 via-yellow-600/30 to-black/60">
                    <Crown className="w-16 h-16 text-amber-300 fill-current animate-pulse drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
                    <span className="text-xs font-black text-amber-300 tracking-widest uppercase mt-2">
                      MEMBRESÍA VIP
                    </span>
                  </div>
                ) : null}

                {/* Sombreado inferior de la imagen */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
              </div>

              {/* Title & Desc */}
              <div className="my-2.5 px-0.5">
                <h4 className="text-sm font-black text-white leading-tight truncate">
                  {promo.title}
                </h4>
                <p className="text-[11px] text-white/60 line-clamp-1 mt-0.5">
                  {promo.desc}
                </p>
              </div>

              {/* Price & Action Button */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1 font-black text-sm text-amber-300">
                  {promo.isCoins ? (
                    <>
                      <CoinAnimation className="w-4 h-4" />
                      <span>{promo.price.toLocaleString()}</span>
                    </>
                  ) : (
                    <span>{promo.price}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 px-3 py-1 rounded-full shadow-md flex items-center gap-1 group-hover:brightness-110 transition">
                  {promo.type === "chest" ? "Abrir" : "Ver"} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal de Contenido del Cofre e Interacción de Apertura */}
      {selectedPromoOffer && typeof document !== "undefined" && createPortal(
        <div 
          onClick={() => setSelectedPromoOffer(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[color:var(--brand-navy-deep)] w-full max-w-sm rounded-3xl p-5 ring-2 ring-amber-400/50 shadow-2xl animate-pop-in border border-white/20 relative overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Ambient Background Aura */}
            <div 
              className="absolute -top-20 -right-20 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-40"
              style={{ background: selectedPromoOffer.glowColor }}
            />

            {/* Close Button */}
            <button 
              type="button"
              onClick={() => setSelectedPromoOffer(null)}
              className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition active:scale-95 touch-manipulation cursor-pointer z-20"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Badge & Title */}
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                {selectedPromoOffer.badge}
              </span>
              <span className="text-[11px] font-black text-white/70 uppercase tracking-wider">
                {selectedPromoOffer.type === "chest" ? "Contenido del Cofre" : "Detalles de la Oferta"}
              </span>
            </div>

            {/* Large Chest Showcase */}
            <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-black/40 border border-white/10 my-2 flex items-center justify-center shrink-0">
              <div 
                className="absolute inset-0 opacity-50 blur-xl pointer-events-none"
                style={{ background: `radial-gradient(circle, ${selectedPromoOffer.glowColor} 0%, transparent 70%)` }}
              />

              {selectedPromoOffer.image ? (
                <img
                  src={selectedPromoOffer.image}
                  alt={selectedPromoOffer.title}
                  className="w-full h-full object-cover animate-pulse"
                />
              ) : selectedPromoOffer.iconComponent ? (
                <selectedPromoOffer.iconComponent className="w-20 h-20 text-amber-300 fill-current drop-shadow-[0_0_25px_rgba(251,191,36,0.7)] animate-pulse" />
              ) : null}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Chest Name & Subtitle */}
            <div className="text-center my-1 relative z-10 shrink-0">
              <h3 className="text-lg font-black text-white leading-tight">
                {selectedPromoOffer.title}
              </h3>
              <p className="text-xs text-amber-300 font-bold mt-0.5">
                {selectedPromoOffer.subtitle || selectedPromoOffer.desc}
              </p>
            </div>

            {/* Contenido Garantizado del Cofre */}
            <div className="my-2.5 relative z-10 flex-1 overflow-y-auto pr-1 space-y-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-white/50 px-1">
                {selectedPromoOffer.type === "chest" ? "¿Qué contiene este cofre?" : "Beneficios incluidos:"}
              </p>
              
              <div className="space-y-1.5 bg-black/35 rounded-2xl p-2.5 border border-white/10">
                {selectedPromoOffer.content?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
                      {item.icon === "coins" ? (
                        <Coins className="w-4 h-4 text-amber-300" />
                      ) : item.icon === "cards" ? (
                        <Layers className="w-4 h-4 text-cyan-300" />
                      ) : item.icon === "sparkles" ? (
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                      ) : item.icon === "crown" ? (
                        <Crown className="w-4 h-4 text-amber-300" />
                      ) : (
                        <Gift className="w-4 h-4 text-pink-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-white leading-tight truncate">{item.value}</p>
                      <p className="text-[10px] text-white/60 truncate">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button: Abrir Cofre / Desbloquear */}
            <div className="mt-2 pt-3 border-t border-white/10 relative z-10 shrink-0">
              {selectedPromoOffer.type === "chest" ? (
                coins >= selectedPromoOffer.price ? (
                  <button
                    type="button"
                    onClick={() => handleBuyPromoOffer(selectedPromoOffer)}
                    className="w-full py-4 rounded-2xl font-black text-sm shadow-[0_5px_20px_rgba(251,191,36,0.4)] active:translate-y-0.5 transition-all bg-gradient-to-t from-amber-500 via-amber-400 to-yellow-300 border-b-4 border-amber-600 text-slate-950 flex items-center justify-center gap-2 cursor-pointer touch-manipulation hover:brightness-105"
                  >
                    <Package className="w-5 h-5 fill-current" />
                    <span>¡Abrir Cofre ({selectedPromoOffer.price.toLocaleString()} Monedas)!</span>
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="text-center text-xs font-bold text-red-300 bg-red-500/10 py-2 rounded-xl border border-red-500/20">
                      Te faltan {(selectedPromoOffer.price - coins).toLocaleString()} monedas para abrir este cofre
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPromoOffer(null);
                        onNavigateTienda();
                      }}
                      className="w-full py-3.5 rounded-2xl font-black text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Coins className="w-4 h-4 text-amber-300" />
                      <span>Conseguir Monedas en la Tienda</span>
                    </button>
                  </div>
                )
              ) : selectedPromoOffer.type === "vip" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPromoOffer(null);
                    setShowVipModal(true);
                  }}
                  className="w-full py-4 rounded-2xl font-black text-sm shadow-[0_5px_20px_rgba(251,191,36,0.4)] active:translate-y-0.5 transition-all bg-gradient-to-t from-amber-500 via-amber-400 to-yellow-300 border-b-4 border-amber-600 text-slate-950 flex items-center justify-center gap-2 cursor-pointer touch-manipulation hover:brightness-105"
                >
                  <Crown className="w-5 h-5 fill-current" />
                  <span>Suscribirme por {selectedPromoOffer.price} / mes</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleBuyPromoOffer(selectedPromoOffer)}
                  className="w-full py-4 rounded-2xl font-black text-sm shadow-[0_5px_20px_rgba(251,191,36,0.4)] active:translate-y-0.5 transition-all bg-gradient-to-t from-amber-500 via-amber-400 to-yellow-300 border-b-4 border-amber-600 text-slate-950 flex items-center justify-center gap-2 cursor-pointer touch-manipulation hover:brightness-105"
                >
                  <Gift className="w-5 h-5" />
                  <span>Desbloquear por {selectedPromoOffer.price} Monedas</span>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Chest Opening Animation Modal (cuando se compra un cofre en Inicio) */}
      <ChestOpeningModal
        open={Boolean(activeChest)}
        chest={activeChest}
        rewards={chestRewards}
        onClose={() => setActiveChest(null)}
        onClaim={handleClaimRewards}
      />

      {/* Password Modal for Locked Tables */}
      {selectedLockedMesa && typeof document !== "undefined" && createPortal(
        <div 
          onClick={() => setSelectedLockedMesa(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[color:var(--brand-navy-deep)] w-full max-w-sm rounded-3xl p-6 ring-1 ring-white/10 shadow-2xl animate-pop-in border border-white/20 relative"
          >
            <button 
              type="button"
              onClick={() => setSelectedLockedMesa(null)}
              className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition active:scale-95 touch-manipulation cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center mx-auto mb-4 border border-amber-400/30">
              <Lock className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-black text-white text-center mb-1">Mesa Privada</h2>
            <p className="text-white/60 text-center text-sm mb-6">Ingresa la contraseña para entrar a <strong>{selectedLockedMesa.name}</strong></p>
            
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Contraseña..."
                autoFocus
                className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-4 text-center text-xl font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
              />
              
              {passwordError && (
                <div className="flex items-center justify-center gap-1.5 text-red-400 text-sm font-bold bg-red-500/10 py-2 rounded-lg animate-shake">
                  <AlertCircle className="w-4 h-4" />
                  {passwordError}
                </div>
              )}
              
              <button
                type="submit"
                disabled={passwordInput.trim().length === 0}
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_5px_15px_rgba(255,215,0,0.3)] disabled:opacity-50 disabled:pointer-events-none mt-2 touch-manipulation cursor-pointer"
              >
                Entrar a la mesa
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* VIP Subscription Modal */}
      <VipSubscriptionModal
        open={showVipModal}
        onClose={() => setShowVipModal(false)}
        onSuccess={() => {
          setIsVIP(true);
          setShowVipModal(false);
          navigate({ to: "/crear-sala-vip" });
        }}
      />

      {/* Join Table Selection Modal */}
      <JoinTableSelectionModal
        open={Boolean(pendingJoinMesa)}
        mesa={pendingJoinMesa}
        onClose={() => setPendingJoinMesa(null)}
      />

      {/* Daily Fortune Roulette Modal */}
      <DailyRouletteModal
        open={showRouletteModal}
        onClose={() => setShowRouletteModal(false)}
        coins={coins}
        onNavigateTienda={onNavigateTienda}
      />
    </div>
  );
}
