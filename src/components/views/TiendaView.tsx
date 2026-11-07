import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Gift,
  Crown,
  Zap,
  Image as ImageIcon,
  Star,
  Sparkles,
  Calendar,
  Users,
  Trophy,
  Clock,
  Package,
  Flame,
  Check,
  RotateCcw,
} from "lucide-react";
import { CoinAnimation } from "@/components/CoinAnimation";
import { VipSubscriptionModal } from "@/components/VipSubscriptionModal";
import { ChestOpeningModal } from "@/components/ChestOpeningModal";
import { EmailAuthModal } from "@/components/EmailAuthModal";
import { Capacitor } from "@capacitor/core";
import {
  purchaseCoins,
  getCoinsOffering,
  PRODUCT_IDS,
  COINS_BY_PRODUCT,
  restorePurchases,
} from "@/lib/purchases";
import { getCurrentUser, encodeEmailKey } from "@/lib/auth";
import type { PurchasesPackage } from "@revenuecat/purchases-capacitor";
import {
  CHESTS,
  openChest,
  getFreeChestCooldown,
  markFreeChestOpened,
  getChestInventory,
  consumeChestFromInventory,
  type ChestConfig,
  type RewardItem,
  type ChestInventory,
} from "@/lib/chests";
import { DECK_SKINS, equipDeckSkin, getEquippedDeckSkin } from "@/lib/deckSkins";
import { useNavigate } from "@tanstack/react-router";

export function TiendaView({ onBack }: { onBack?: () => void }) {
  const navigate = useNavigate();
  const [coins, setCoins] = useState(0);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [isVip, setIsVip] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);

  // IAP state
  const [coinsPackages, setCoinsPackages] = useState<PurchasesPackage[]>([]);
  const [buyingPackageId, setBuyingPackageId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [iapError, setIapError] = useState<string | null>(null);
  const [iapSuccess, setIapSuccess] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPackageToBuy, setPendingPackageToBuy] = useState<{ productId: string; pkg?: PurchasesPackage } | null>(null);

  // Chest System State
  const [activeChest, setActiveChest] = useState<ChestConfig | null>(null);
  const [chestRewards, setChestRewards] = useState<RewardItem[]>([]);
  const [freeCooldown, setFreeCooldown] = useState({ canOpen: true, remainingMs: 0 });
  const [equippedDeckId, setEquippedDeckId] = useState<string>("deck_clasica");
  const [chestInventory, setChestInventory] = useState<ChestInventory>({
    madera: 0,
    plata: 0,
    oro: 0,
    magico: 0,
    legendario: 0,
    temporada: 0,
  });

  useEffect(() => {
    const loadData = () => {
      try {
        const storedCoins = localStorage.getItem("garza:coins");
        if (storedCoins) setCoins(parseInt(storedCoins, 10));
        else {
          localStorage.setItem("garza:coins", "500");
          setCoins(500);
        }

        const storedItems = localStorage.getItem("garza:owned");
        if (storedItems) setOwnedItems(JSON.parse(storedItems));

        const storedVip = localStorage.getItem("garza:vip");
        setIsVip(storedVip === "true");

        setEquippedDeckId(getEquippedDeckSkin().id);
        setChestInventory(getChestInventory());
      } catch {
        /* ignore */
      }
    };

    loadData();
    window.addEventListener("garza:coins-updated", loadData);
    window.addEventListener("garza:vip-updated", loadData);
    window.addEventListener("garza:deck-updated", loadData);
    window.addEventListener("garza:chest-inventory-updated", loadData);
    return () => {
      window.removeEventListener("garza:coins-updated", loadData);
      window.removeEventListener("garza:vip-updated", loadData);
      window.removeEventListener("garza:deck-updated", loadData);
      window.removeEventListener("garza:chest-inventory-updated", loadData);
    };
  }, []);

  // Timer for Free Chest cooldown
  useEffect(() => {
    setFreeCooldown(getFreeChestCooldown());
    const timer = setInterval(() => {
      setFreeCooldown(getFreeChestCooldown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cargar paquetes de monedas reales desde la tienda
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      getCoinsOffering().then((pkgs) => {
        if (pkgs.length > 0) setCoinsPackages(pkgs);
      });
    }
  }, []);

  const getUserId = () => {
    const user = getCurrentUser();
    return user?.email ? encodeEmailKey(user.email) : "guest";
  };

  const handleBuyCoinsPackage = async (productId: string, pkg?: PurchasesPackage) => {
    const user = getCurrentUser();
    if (!user || !user.email) {
      // Requisito: para comprar monedas se debe iniciar sesión obligatoriamente
      setPendingPackageToBuy({ productId, pkg });
      setShowAuthModal(true);
      return;
    }

    if (buyingPackageId) return; // evitar doble tap
    setBuyingPackageId(productId);
    setIapError(null);
    setIapSuccess(null);
    try {
      const target = pkg ?? (coinsPackages.find((p) => p.identifier === productId || p.product?.identifier === productId) ?? ({ identifier: productId } as PurchasesPackage));
      const result = await purchaseCoins(getUserId(), target);
      if (result.success) {
        const added = result.coinsAdded ? result.coinsAdded.toLocaleString() : "";
        setIapSuccess(`¡Listo! Se acreditaron +${added} monedas.`);
        setTimeout(() => setIapSuccess(null), 4000);
      } else if (!result.cancelled) {
        setIapError(result.error ?? "No se pudo completar la compra.");
      }
    } catch {
      setIapError("Error inesperado. Intenta de nuevo.");
    } finally {
      setBuyingPackageId(null);
    }
  };

  const handleRestoreCoins = async () => {
    setRestoring(true);
    setIapError(null);
    setIapSuccess(null);
    try {
      const restored = await restorePurchases(getUserId());
      if (restored) {
        setIapSuccess("¡Compras restauradas con éxito!");
        setTimeout(() => setIapSuccess(null), 4000);
      } else {
        setIapError("No se encontraron compras anteriores para restaurar.");
      }
    } catch {
      setIapError("Error al restaurar compras.");
    } finally {
      setRestoring(false);
    }
  };

  const formatRemaining = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOpenChest = (chest: ChestConfig) => {
    const hasInInventory = (chestInventory[chest.id] || 0) > 0;

    if (hasInInventory) {
      // Consume 1 cofre de nuestro inventario sin gastar monedas
      consumeChestFromInventory(chest.id);
      setChestInventory(getChestInventory());
    } else if (chest.isFree) {
      if (!freeCooldown.canOpen) return;
      markFreeChestOpened();
      setFreeCooldown(getFreeChestCooldown());
    } else {
      if (coins < chest.price) return;
      const nextCoins = coins - chest.price;
      setCoins(nextCoins);
      localStorage.setItem("garza:coins", nextCoins.toString());
      window.dispatchEvent(new Event("garza:coins-updated"));
    }

    const generated = openChest(chest);
    setActiveChest(chest);
    setChestRewards(generated);
  };

  const handleClaimRewards = (rewards: RewardItem[]) => {
    let addedCoins = 0;
    const newOwned = [...ownedItems];

    rewards.forEach((r) => {
      if (r.type === "coins" && r.amount) {
        addedCoins += r.amount;
      } else if (r.id && !newOwned.includes(r.id)) {
        newOwned.push(r.id);
      }
    });

    if (addedCoins > 0) {
      const finalCoins = coins + addedCoins;
      setCoins(finalCoins);
      localStorage.setItem("garza:coins", finalCoins.toString());
      window.dispatchEvent(new Event("garza:coins-updated"));
    }

    setOwnedItems(newOwned);
    localStorage.setItem("garza:owned", JSON.stringify(newOwned));
  };

  const handleBuyDeck = (deckId: string, price: number) => {
    if (coins < price) return;
    const nextCoins = coins - price;
    setCoins(nextCoins);
    localStorage.setItem("garza:coins", nextCoins.toString());

    const nextOwned = [...ownedItems];
    if (!nextOwned.includes(deckId)) {
      nextOwned.push(deckId);
      setOwnedItems(nextOwned);
      localStorage.setItem("garza:owned", JSON.stringify(nextOwned));
    }

    equipDeckSkin(deckId);
    setEquippedDeckId(deckId);

    window.dispatchEvent(new Event("garza:coins-updated"));
    window.dispatchEvent(new Event("garza:deck-updated"));
    window.dispatchEvent(new Event("garza:loot-updated"));
  };

  const handleEquipDeck = (deckId: string) => {
    equipDeckSkin(deckId);
    setEquippedDeckId(deckId);
    window.dispatchEvent(new Event("garza:deck-updated"));
  };


  const freeChest = CHESTS.find((c) => c.isFree) || CHESTS[0];
  const paidChests = CHESTS.filter((c) => !c.isFree);

  return (
    <div className="flex flex-col h-full font-sans relative overflow-x-hidden text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[color:var(--brand-cyan)]/20 to-transparent pointer-events-none" />

      {/* Header Fijo */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-[color:var(--brand-navy-deep)]/90 backdrop-blur-md border-b border-white/10 shadow-lg">
        {onBack ? (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl bg-white/5 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-7 h-7 text-white" />
          </button>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3.5 py-1.5 rounded-full shadow-inner ml-auto">
          <CoinAnimation className="w-5 h-5 drop-shadow" />
          <span className="font-extrabold text-sm text-[color:var(--brand-gold)] tracking-wide">
            {coins.toLocaleString()}
          </span>
        </div>
      </header>

      {/* Main Content con Scroll */}
      <main className="flex-1 px-4 pb-36 pt-4 space-y-7 max-w-md mx-auto w-full scroll-touch-y">
        {/* ======================================================== */}
        {/* SECTION: SISTEMA DE COFRES CLASH ROYALE */}
        {/* ======================================================== */}
        <section className="animate-slide-up-soft">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-current text-amber-400" /> Cofres de la Suerte
                </span>
                <h2 className="text-lg font-black text-white leading-tight">
                  Abre y Colecciona
                </h2>
              </div>
            </div>
          </div>

          {/* Banner de Inventario de Cofres Disponibles (ganados en Ruleta u otros eventos) */}
          {(() => {
            const totalOwnedChests = Object.values(chestInventory).reduce((acc, c) => acc + (c || 0), 0);
            if (totalOwnedChests <= 0) return null;
            return (
              <div className="mb-4 rounded-3xl p-4 bg-gradient-to-r from-emerald-950 via-[#0e2c22] to-[#12221b] border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.35)] flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
                    <Package className="w-6 h-6 animate-bounce-gentle text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-game uppercase tracking-wider text-emerald-400 flex items-center gap-1 font-black">
                      <Sparkles className="w-3 h-3 fill-current" /> ¡Tienes {totalOwnedChests} cofre{totalOwnedChests > 1 ? "s" : ""} listo{totalOwnedChests > 1 ? "s" : ""}!
                    </span>
                    <h3 className="text-sm font-game text-white leading-tight mt-0.5 truncate">
                      {Object.entries(chestInventory)
                        .filter(([_, count]) => count > 0)
                        .map(([id, count]) => `${count} ${CHESTS.find((c) => c.id === id)?.name || id}`)
                        .join(" • ")}
                    </h3>
                    <p className="text-[10px] text-emerald-200/80 font-medium">Pulsa en tus cofres abajo para abrirlos gratis sin monedas</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Featured: Cofre Diario Gratis */}
          {(() => {
            const freeOwned = chestInventory[freeChest.id] || 0;
            const canOpenFree = freeCooldown.canOpen || freeOwned > 0;

            return (
              <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/50 bg-gradient-to-br from-[#23153c] via-[#1a0f30] to-[#120824] p-4 shadow-xl mb-4 group">
                <div className="absolute top-0 right-0 w-44 h-44 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between mb-2 relative z-10">
                  <span className="px-3 py-1 rounded-full bg-amber-400/20 border-2 border-amber-400/50 text-amber-300 text-xs font-game uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" /> {freeChest.badge}
                  </span>
                  {freeOwned > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-game text-[10px] uppercase font-black shadow-[0_0_10px_rgba(16,185,129,0.7)]">
                      ¡Tienes {freeOwned} extra!
                    </span>
                  ) : (
                    <span className="text-xs text-white/60 font-game uppercase tracking-wider">
                      Cada 4 horas
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 relative z-10 my-2">
                  <div className="w-24 h-24 shrink-0 group-hover:scale-105 transition-transform duration-300 relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
                    <img
                      src={freeChest.image}
                      alt={freeChest.name}
                      className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-game game-title text-white leading-tight truncate">
                      {freeChest.name}
                    </h3>
                    <p className="text-xs text-amber-200/80 font-semibold mt-0.5">
                      {freeChest.subtitle}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-black/60 text-xs font-game text-amber-300 border border-amber-400/30">
                        150 - 400 Monedas
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-black/60 text-xs font-game text-cyan-300 border border-cyan-400/30">
                        1 Carta Lotería
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div suppressHydrationWarning className="mt-3 flex justify-center">
                  {canOpenFree ? (
                    <button
                      onClick={() => handleOpenChest(freeChest)}
                      className="btn-clash-yellow px-5 py-2 rounded-full text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider font-game max-w-[150px] mx-auto active:translate-y-[2px]"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>{freeOwned > 0 ? `¡ABRIR (${freeOwned})!` : "¡ABRIR!"}</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-4 py-1.5 rounded-full font-game text-[11px] bg-white/5 border border-white/10 text-white/50 inline-flex items-center justify-center gap-1 cursor-not-allowed uppercase tracking-wider max-w-[140px] mx-auto"
                    >
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{formatRemaining(freeCooldown.remainingMs)}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Grid of Paid Chests (Plata, Oro, Mágico, Legendario) */}
          <div className="grid grid-cols-2 gap-3">
            {paidChests.map((chest) => {
              const ownedCount = chestInventory[chest.id] || 0;
              const canAfford = coins >= chest.price || ownedCount > 0;
              const isLegendary = chest.rarity === "legendaria";
              const isEpic = chest.rarity === "epica";

              return (
                <div
                  key={chest.id}
                  className={`relative rounded-3xl p-3.5 border-2 flex flex-col justify-between overflow-hidden shadow-xl transition-all group ${
                    ownedCount > 0
                      ? "bg-gradient-to-br from-[#133026] via-[#10241e] to-[#0a1614] border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)] ring-2 ring-emerald-400/40"
                      : isLegendary
                      ? "bg-gradient-to-br from-[#24133d] via-[#1b0c36] to-[#0c1630] border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]"
                      : isEpic
                      ? "bg-gradient-to-br from-[#260f33] via-[#1a082b] to-[#0f041d] border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.25)]"
                      : "surface-card border-amber-400/40 bg-gradient-to-b from-[#1b1431] to-[#0e091e]"
                  }`}
                >
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-2">
                    {ownedCount > 0 ? (
                      <span className="text-[10px] font-game uppercase tracking-wider px-2.5 py-0.5 rounded-full border-2 bg-emerald-500 text-slate-950 border-emerald-300 font-black shadow-[0_0_10px_rgba(16,185,129,0.8)]">
                        ¡TIENES {ownedCount}!
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-game uppercase tracking-wider px-2.5 py-0.5 rounded-full border-2 ${
                          isLegendary
                            ? "bg-gradient-to-r from-amber-400 to-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                            : isEpic
                            ? "bg-fuchsia-500/30 text-fuchsia-200 border-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.5)]"
                            : "bg-amber-400/20 text-amber-300 border-amber-400/50"
                        }`}
                      >
                        {chest.badge}
                      </span>
                    )}
                    <span className="text-[11px] text-amber-200/80 font-game uppercase tracking-wide">
                      {chest.totalCards} cartas
                    </span>
                  </div>

                  {/* 3D Chest Artwork (floating, with glow) */}
                  <div className="w-full aspect-square my-1 relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div
                      className="absolute inset-2 rounded-full blur-2xl opacity-40 pointer-events-none"
                      style={{ background: ownedCount > 0 ? "rgba(16, 185, 129, 0.6)" : chest.glowColor }}
                    />
                    <img
                      src={chest.image}
                      alt={chest.name}
                      className="w-full h-full object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.85)] select-none"
                    />
                  </div>

                  {/* Title & Perks */}
                  <div className="my-2 text-center">
                    <h4 className="text-base font-game game-title text-white leading-tight truncate">
                      {chest.name}
                    </h4>
                    <p className="text-[10px] text-white/60 line-clamp-1 mt-0.5 font-medium">
                      {chest.subtitle}
                    </p>
                    <div className="mt-1 text-xs font-game text-amber-300 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-current text-amber-400" />
                      <span>{chest.minCoins.toLocaleString()} - {chest.maxCoins.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Purchase Button: Real 3D Video Game Button */}
                  <div className="flex justify-center mt-1">
                    {ownedCount > 0 ? (
                      <button
                        onClick={() => handleOpenChest(chest)}
                        className="btn-clash-green px-4 py-1.5 rounded-full font-game text-[11px] inline-flex items-center justify-center gap-1 uppercase tracking-wide transition-all shadow-[0_0_15px_rgba(34,197,94,0.6)] cursor-pointer active:translate-y-[2px] max-w-[130px]"
                      >
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        <span>¡ABRIR ({ownedCount})!</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenChest(chest)}
                        disabled={!canAfford}
                        className={`px-4 py-1.5 rounded-full font-game text-[11px] inline-flex items-center justify-center gap-1 uppercase tracking-wide transition-all max-w-[100px] ${
                          canAfford
                            ? isLegendary
                              ? "btn-clash-yellow ring-2 ring-cyan-300 cursor-pointer active:translate-y-[2px]"
                              : isEpic
                              ? "btn-clash-purple cursor-pointer active:translate-y-[2px]"
                              : "btn-clash-green cursor-pointer active:translate-y-[2px]"
                            : "bg-white/10 text-white/30 border border-white/10 cursor-not-allowed opacity-50"
                        }`}
                      >
                        <CoinAnimation className="w-3.5 h-3.5 drop-shadow-sm" />
                        <span>{chest.price.toLocaleString()}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION: BARAJAS TEMÁTICAS EXCLUSIVAS */}
        {/* ======================================================== */}
        <section className="animate-slide-up-soft">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center border border-pink-400/30">
                <Sparkles className="w-4 h-4 text-pink-300" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1">
                  🐾 Ediciones Míticas
                </span>
                <h2 className="text-lg font-black text-white leading-tight">
                  Barajas de la Suerte
                </h2>
              </div>
            </div>
            <span className="text-[11px] font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              54 Cartas
            </span>
          </div>

          <div className="space-y-3.5">
            {[
              {
                id: "deck_michis",
                title: "Baraja Michis & Gatos",
                subtitle: "Edición Mítica Felina",
                desc: "54 cartas completas de lotería con adorables michis traviesos ilustrados en arte tradicional de grabado mexicano.",
                price: 3500,
                badge: "MICHIS 🐱",
                accent: "from-[#28113b] via-[#1d0b2e] to-[#140621]",
                border: "border-pink-500/40 hover:border-pink-400",
                badgeBg: "bg-pink-500/20 text-pink-300 border-pink-400/50",
                previewImages: ["/cards/michis/02.jpg", "/cards/michis/01.jpg", "/cards/michis/14.jpg"],
                glow: "rgba(236, 72, 153, 0.25)",
              },
              {
                id: "deck_lomitos",
                title: "Baraja Lomitos & Perros",
                subtitle: "Edición Mítica Canina",
                desc: "54 cartas de leales perritos y alegres guardianes para cantar ¡Lotería! con la bendición de los mejores amigos.",
                price: 3500,
                badge: "LOMITOS 🐶",
                accent: "from-[#2b190f] via-[#201109] to-[#150a04]",
                border: "border-orange-500/40 hover:border-orange-400",
                badgeBg: "bg-orange-500/20 text-orange-300 border-orange-400/50",
                previewImages: ["/cards/lomitos/02.jpg", "/cards/lomitos/01.jpg", "/cards/lomitos/14.jpg"],
                glow: "rgba(249, 115, 22, 0.25)",
              },
            ].map((deck) => {
              const isOwned = ownedItems.includes(deck.id);
              const isEquipped = equippedDeckId === deck.id;
              const canAfford = coins >= deck.price;

              return (
                <div
                  key={deck.id}
                  className={`relative rounded-3xl p-4 border-2 bg-gradient-to-br ${deck.accent} ${deck.border} shadow-xl transition-all overflow-hidden`}
                  style={{ boxShadow: `0 8px 25px ${deck.glow}` }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="min-w-0 flex-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-game uppercase tracking-wider border ${deck.badgeBg}`}>
                        {deck.badge}
                      </span>
                      <h3 className="text-base font-black text-white mt-1 leading-tight">
                        {deck.title}
                      </h3>
                      <p className="text-[11px] text-amber-200/80 font-medium truncate">
                        {deck.subtitle}
                      </p>
                    </div>

                    {/* Miniature Cards Preview Fan */}
                    <div className="flex items-center -space-x-3 shrink-0 pt-1">
                      {deck.previewImages.map((img, i) => (
                        <div
                          key={i}
                          className="w-10 h-14 rounded-lg overflow-hidden border border-white/30 shadow-md bg-black/60 transform transition-transform hover:scale-110"
                          style={{
                            transform: `rotate(${(i - 1) * 8}deg) translateY(${i === 1 ? -2 : 0}px)`,
                            zIndex: i === 1 ? 2 : 1,
                          }}
                        >
                          <img src={img} alt="Carta" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed mb-3">
                    {deck.desc}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-[11px] font-bold text-white/60">
                      {isOwned ? "En tu colección" : "Baraja permanente"}
                    </span>

                    {isOwned ? (
                      isEquipped ? (
                        <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-black flex items-center gap-1.5 shadow-sm">
                          <Check className="w-3.5 h-3.5" />
                          <span>EQUIPADA</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEquipDeck(deck.id)}
                          className="btn-clash-yellow px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-game cursor-pointer active:translate-y-[2px]"
                        >
                          EQUIPAR
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => handleBuyDeck(deck.id, deck.price)}
                        disabled={!canAfford}
                        className={`px-4 py-1.5 rounded-full font-game text-xs inline-flex items-center justify-center gap-1.5 uppercase tracking-wide transition-all ${
                          canAfford
                            ? "btn-clash-green ring-2 ring-emerald-300 cursor-pointer active:translate-y-[2px]"
                            : "bg-white/10 text-white/30 border border-white/10 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <CoinAnimation className="w-4 h-4 drop-shadow-sm" />
                        <span>{deck.price.toLocaleString()}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION: Membresía Mensual VIP */}
        {/* ======================================================== */}
        <section className="animate-slide-up-soft">
          <div className="relative rounded-3xl overflow-hidden ring-2 ring-amber-400 shadow-[0_10px_35px_rgba(245,158,11,0.35)] bg-gradient-to-br from-[#1c133a] via-[#120c29] to-[#26150a] border-t border-amber-300 p-5">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                <Crown className="w-3 h-3 fill-current" /> SUSCRIPCIÓN MENSUAL
              </span>
              <span className="text-sm font-black text-amber-300">
                $99 MXN <span className="text-[10px] font-normal text-white/60">/ mes</span>
              </span>
            </div>

            <div className="relative z-10 mb-4">
              <h3 className="font-black text-2xl text-white drop-shadow leading-tight">
                Membresía VIP La Garza
              </h3>
              <p className="text-xs text-amber-100/80 mt-1 font-medium leading-relaxed">
                El beneficio estelar: accede al <strong>Panel Administrativo de Salas VIP</strong> para crear eventos programados, registrar invitados y definir rondas con premios.
              </p>
            </div>

            {/* Perks grid */}
            <div className="grid grid-cols-2 gap-2 my-3 relative z-10 text-[11px]">
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2 border border-white/5">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-white/90">Programar día y hora</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2 border border-white/5">
                <Users className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-semibold text-white/90">Registro e invitados</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2 border border-white/5">
                <Trophy className="w-4 h-4 text-yellow-300 shrink-0" />
                <span className="font-semibold text-white/90">Rondas con premios</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2 border border-white/5">
                <Sparkles className="w-4 h-4 text-fuchsia-400 shrink-0" />
                <span className="font-semibold text-white/90">+2,000 monedas</span>
              </div>
            </div>

            {isVip ? (
              <div className="space-y-2 mt-4 relative z-10 flex flex-col items-center">
                <div className="py-1 px-3.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-game text-center flex items-center justify-center gap-1.5 uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 fill-current" /> Tu Membresía VIP está Activa
                </div>
                <button
                  onClick={() => navigate({ to: "/crear-sala-vip" })}
                  className="btn-clash-yellow px-5 py-2 rounded-full text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider max-w-[160px] active:translate-y-[2px]"
                >
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  <span>SALAS VIP</span>
                </button>
              </div>
            ) : (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setShowVipModal(true)}
                  className="btn-clash-yellow px-5 py-2 rounded-full text-xs inline-flex items-center justify-center gap-1.5 relative z-10 cursor-pointer uppercase tracking-wider max-w-[160px] active:translate-y-[2px]"
                >
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  <span>SUSCRIBIRSE</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION: Paquetes de Monedas */}
        {/* ======================================================== */}
        <section className="animate-slide-up-soft">
          <h2 className="flex items-center justify-center gap-2 text-sm font-black text-white/50 mb-4 tracking-[0.2em] uppercase">
            <span className="h-px w-8 bg-white/20" />
            Monedas
            <span className="h-px w-8 bg-white/20" />
          </h2>

          {!getCurrentUser()?.email && (
            <div className="mb-3 p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-center animate-fade-in">
              <p className="text-[11px] text-amber-200 font-medium">
                💡 Inicia sesión con tu cuenta para comprar monedas y guardar tus premios en la nube.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                productId: PRODUCT_IDS.COINS_500,
                coins: 500,
                price: "$0.99",
                bonus: null,
                gradient: "from-green-500/20 to-emerald-700/40",
                ring: "ring-emerald-500/50",
              },
              {
                productId: PRODUCT_IDS.COINS_1200,
                coins: 1200,
                price: "$1.99",
                bonus: "¡15% Extra!",
                gradient: "from-blue-500/20 to-indigo-700/40",
                ring: "ring-indigo-500/50",
              },
              {
                productId: PRODUCT_IDS.COINS_2500,
                coins: 2500,
                price: "$3.99",
                bonus: "¡25% Extra!",
                gradient: "from-purple-500/20 to-fuchsia-700/40",
                ring: "ring-fuchsia-500/50",
              },
              {
                productId: PRODUCT_IDS.COINS_6500,
                coins: 6500,
                price: "$9.99",
                bonus: "¡Mejor Valor!",
                gradient: "from-yellow-400/20 to-amber-700/40",
                ring: "ring-[color:var(--brand-gold)] shadow-[0_0_20px_rgba(255,215,0,0.3)]",
              },
            ].map((pack, idx) => {
              // Si ya cargamos paquetes reales de la tienda, usar su precio
              const nativePkg = coinsPackages.find(
                (p) => p.identifier === pack.productId || p.product?.identifier === pack.productId
              );
              const displayPrice = nativePkg ? nativePkg.product.priceString : pack.price;
              const isBuying = buyingPackageId === pack.productId;

              return (
                <button
                  key={idx}
                  disabled={!!buyingPackageId || restoring}
                  onClick={() => handleBuyCoinsPackage(pack.productId, nativePkg)}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-3xl bg-gradient-to-br ${pack.gradient} ring-1 ${pack.ring} border-t-2 border-white/20 active:scale-95 transition-transform overflow-hidden group disabled:opacity-60`}
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {pack.bonus && (
                    <span className="absolute top-0 left-0 w-full bg-red-600 text-[9px] font-black uppercase tracking-wider py-0.5 shadow-md z-10">
                      {pack.bonus}
                    </span>
                  )}
                  <CoinAnimation
                    className={`w-12 h-12 mt-2 drop-shadow-xl ${
                      pack.coins > 2000 ? "animate-pulse" : ""
                    }`}
                  />
                  <span className="font-black text-xl text-white drop-shadow-md mt-1">
                    {pack.coins.toLocaleString()}
                  </span>
                  <span className="mt-2 bg-white text-black font-extrabold text-sm px-4 py-1.5 rounded-full shadow-lg">
                    {isBuying ? "..." : displayPrice}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mensajes de estado IAP */}
          {iapSuccess && (
            <p className="text-center text-xs text-emerald-400 font-bold mt-3 px-4 animate-fade-in">
              {iapSuccess}
            </p>
          )}
          {iapError && (
            <p className="text-center text-xs text-red-400 font-semibold mt-3 px-4">{iapError}</p>
          )}

          {/* Restaurar compras */}
          <button
            type="button"
            onClick={handleRestoreCoins}
            disabled={!!buyingPackageId || restoring}
            className="w-full mt-3 py-2 text-xs text-white/40 hover:text-white/70 transition flex items-center justify-center gap-1.5 disabled:opacity-30"
          >
            <RotateCcw className="w-3 h-3" />
            {restoring ? "Restaurando..." : "Restaurar compras anteriores"}
          </button>

          {/* Aviso legal */}
          <p className="text-center text-[10px] text-white/25 leading-relaxed px-4 mt-1">
            Las monedas son moneda virtual. No tienen valor en dinero real ni pueden canjearse por efectivo.
          </p>
        </section>

      </main>

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

      {/* Clash Royale Chest Opening Modal */}
      <ChestOpeningModal
        open={Boolean(activeChest)}
        chest={activeChest}
        rewards={chestRewards}
        onClose={() => setActiveChest(null)}
        onClaim={handleClaimRewards}
      />

      {/* Modal de inicio de sesión obligatorio para compras */}
      <EmailAuthModal
        open={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingPackageToBuy(null);
        }}
        onSuccess={() => {
          setShowAuthModal(false);
          if (pendingPackageToBuy) {
            const { productId, pkg } = pendingPackageToBuy;
            setPendingPackageToBuy(null);
            handleBuyCoinsPackage(productId, pkg);
          }
        }}
      />
    </div>
  );
}
