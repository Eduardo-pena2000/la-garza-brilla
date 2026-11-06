import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, Trophy, Clock, Check, Crown, Zap, Flame, Gift, Coins, Package } from "lucide-react";
import { CoinAnimation } from "@/components/CoinAnimation";
import { ChestParticlesCanvas, type ChestParticlesHandle } from "@/components/ChestParticlesCanvas";
import { recordLootClaim } from "@/lib/loot";
import type { RewardItem } from "@/lib/chests";

import { CHESTS, openChest, addChestToInventory, type ChestId } from "@/lib/chests";

export interface RoulettePrize {
  id: string;
  type: "coins" | "chest" | "sticker" | "marker" | "card" | "emoji";
  label: string;
  sub: string;
  amount?: number;
  image: string;
  openImage?: string;
  chestId?: string;
}

export const ROULETTE_PRIZES: RoulettePrize[] = [
  // Slice 0: 100 Monedas
  { id: "p_100", type: "coins", label: "100 Monedas", sub: "Oro de la Suerte", amount: 100, image: "/images/imoneda.png" },
  // Slice 1: Cofre Madera
  { id: "chest_wooden", type: "chest", label: "Cofre de Madera", sub: "Cofre Diario con Botín", image: "/chests/chest_wooden_closed.png", openImage: "/chests/chest_wooden_open.png", chestId: "madera" },
  // Slice 2: 200 Monedas
  { id: "p_200", type: "coins", label: "200 Monedas", sub: "Oro de la Suerte", amount: 200, image: "/images/imoneda.png" },
  // Slice 3: Sticker Victoria
  { id: "stk_garza_victoria", type: "sticker", label: "Sticker Victoria", sub: "Coleccionable para Chat", image: "/stickers/63.png" },
  // Slice 4: 350 Monedas
  { id: "p_350", type: "coins", label: "350 Monedas", sub: "Premio de Fortuna", amount: 350, image: "/images/imoneda.png" },
  // Slice 5: Frijol Mágico
  { id: "marker_frijol", type: "marker", label: "Frijol de la Suerte", sub: "Marcador de Cartas", image: "/markers/ifrijol.png" },
  // Slice 6: 500 Monedas
  { id: "p_500", type: "coins", label: "500 Monedas", sub: "¡Gran Premio de Oro!", amount: 500, image: "/images/imoneda.png" },
  // Slice 7: Pack Emojis
  { id: "emoji_suerte", type: "emoji", label: "Pack Emojis Suerte", sub: "Reacciones para el Chat", image: "/stickers/29.png" },
  // Slice 8: 750 Monedas
  { id: "p_750", type: "coins", label: "750 Monedas", sub: "¡Excelente Botín de Oro!", amount: 750, image: "/images/imoneda.png" },
  // Slice 9: Sticker Diablito
  { id: "stk_diablo_fuego", type: "sticker", label: "Sticker Diablito", sub: "Sticker Travieso", image: "/stickers/71.png" },
  // Slice 10: Cofre Plata
  { id: "chest_silver", type: "chest", label: "Cofre de Plata", sub: "Cofre con Buen Botín", image: "/chests/chest_silver_closed.png", openImage: "/chests/chest_silver_open.png", chestId: "plata" },
  // Slice 11: 1,200 Monedas (Premio Mayor de la Ruleta)
  { id: "p_1200", type: "coins", label: "1,200 Monedas", sub: "★ ¡PREMIO MAYOR DE ORO! ★", amount: 1200, image: "/images/imoneda.png" },
];

const SPIN_COST = 150;
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getRouletteCooldown(): { canSpinFree: boolean; remainingMs: number } {
  try {
    const raw = localStorage.getItem("garza:roulette_cooldown");
    if (!raw) return { canSpinFree: true, remainingMs: 0 };
    const last = parseInt(raw, 10);
    const now = Date.now();
    const diff = now - last;
    if (diff >= COOLDOWN_MS) {
      return { canSpinFree: true, remainingMs: 0 };
    }
    return { canSpinFree: false, remainingMs: COOLDOWN_MS - diff };
  } catch {
    return { canSpinFree: true, remainingMs: 0 };
  }
}

export function markRouletteFreeUsed(): void {
  try {
    localStorage.setItem("garza:roulette_cooldown", Date.now().toString());
  } catch {}
}

interface DailyRouletteModalProps {
  open: boolean;
  onClose: () => void;
  coins: number;
  onNavigateTienda?: () => void;
}

export function DailyRouletteModal({ open, onClose, coins, onNavigateTienda }: DailyRouletteModalProps) {
  const [cooldown, setCooldown] = useState({ canSpinFree: true, remainingMs: 0 });
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [needleTick, setNeedleTick] = useState(0);
  const [winningPrize, setWinningPrize] = useState<RoulettePrize | null>(null);
  const [flashKey, setFlashKey] = useState(0);

  const particlesRef = useRef<ChestParticlesHandle>(null);
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);

  // Update countdown every second
  useEffect(() => {
    if (!open) return;
    setCooldown(getRouletteCooldown());
    const t = setInterval(() => {
      setCooldown(getRouletteCooldown());
    }, 1000);
    return () => clearInterval(t);
  }, [open]);

  // Needle oscillation tick during spin
  useEffect(() => {
    if (!isSpinning) {
      setNeedleTick(0);
      return;
    }
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setNeedleTick(count % 2 === 0 ? -12 : 8);
      try {
        if (!tickAudioRef.current) {
          tickAudioRef.current = new Audio("/audio/effects/pop.mp3");
          tickAudioRef.current.volume = 0.25;
        }
        tickAudioRef.current.currentTime = 0;
        tickAudioRef.current.play().catch(() => {});
      } catch {}
    }, 110);
    return () => clearInterval(interval);
  }, [isSpinning]);

  if (!open || typeof document === "undefined") return null;

  const formatTimer = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  const handleSpin = (isFree: boolean) => {
    if (isSpinning) return;

    if (!isFree) {
      if (coins < SPIN_COST) return;
      const nextCoins = coins - SPIN_COST;
      localStorage.setItem("garza:coins", nextCoins.toString());
      window.dispatchEvent(new Event("garza:coins-updated"));
    } else {
      markRouletteFreeUsed();
      setCooldown(getRouletteCooldown());
    }

    setIsSpinning(true);
    setWinningPrize(null);

    // Pick random prize from 12 slices
    const prizeIdx = Math.floor(Math.random() * ROULETTE_PRIZES.length);
    const selected = ROULETTE_PRIZES[prizeIdx];

    // Slices are at 30 deg each: center of slice i = i * 30 + 15
    // Top needle is at 270 deg (or -90 deg)
    // To land slice i at top needle: target = 255 - i * 30
    const sliceAngle = 360 / ROULETTE_PRIZES.length;
    const targetSliceMod = (255 - prizeIdx * sliceAngle + 360) % 360;
    const currentMod = rotation % 360;
    const diff = (targetSliceMod - currentMod + 360) % 360;
    const extraSpins = 360 * 6; // 6 full revolutions
    const finalRot = rotation + extraSpins + diff;

    setRotation(finalRot);

    // When spin completes (4.5s)
    setTimeout(() => {
      setIsSpinning(false);
      setNeedleTick(0);
      setWinningPrize(selected);
      setFlashKey((k) => k + 1);

      try {
        const audio = new Audio("/audio/effects/winner.mp3");
        audio.volume = 0.7;
        audio.play().catch(() => {});
        navigator.vibrate?.([80, 40, 140]);
      } catch {}

      particlesRef.current?.celebrate(90);
    }, 4500);
  };

  const handleClaim = () => {
    if (!winningPrize) return;

    if (winningPrize.type === "coins" && winningPrize.amount) {
      const cur = parseInt(localStorage.getItem("garza:coins") || "500", 10);
      const updated = cur + winningPrize.amount;
      localStorage.setItem("garza:coins", updated.toString());
      window.dispatchEvent(new Event("garza:coins-updated"));

      recordLootClaim(
        [
          {
            id: `coins_${Date.now()}`,
            type: "coins",
            title: `${winningPrize.amount} Monedas`,
            description: "Premio de la Ruleta Diaria",
            amount: winningPrize.amount,
            rarity: "comun",
            emoji: "🪙",
          },
        ],
        "Ruleta Diaria"
      );
    } else if (winningPrize.type === "chest" && winningPrize.chestId) {
      // Guardar el cofre en el inventario de la Tienda para que el jugador lo abra gratis
      addChestToInventory(winningPrize.chestId as ChestId, 1);
      recordLootClaim(
        [
          {
            id: `chest_${winningPrize.chestId}_${Date.now()}`,
            type: "coins",
            title: winningPrize.label,
            description: "¡Guardado en tu inventario de la Tienda!",
            rarity: "comun",
            emoji: "📦",
          },
        ],
        `Ruleta: ${winningPrize.label}`
      );
    } else {
      let owned: string[] = [];
      try {
        const raw = localStorage.getItem("garza:owned");
        if (raw) owned = JSON.parse(raw);
      } catch {}
      if (!owned.includes(winningPrize.id)) {
        owned.push(winningPrize.id);
        localStorage.setItem("garza:owned", JSON.stringify(owned));
      }

      recordLootClaim(
        [
          {
            id: winningPrize.id,
            type: winningPrize.type === "marker" ? "marker" : "sticker",
            title: winningPrize.label,
            description: winningPrize.sub,
            rarity: "especial",
            image: winningPrize.image,
            emoji: "🎁",
          },
        ],
        "Ruleta Diaria"
      );
    }

    setWinningPrize(null);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-[#060812]/98 backdrop-blur-2xl select-none overflow-hidden text-white font-sans p-4">
      {/* 60 FPS Canvas Particle Physics Engine */}
      <ChestParticlesCanvas ref={particlesRef} />

      {/* Screen Flash on Win */}
      {flashKey > 0 && (
        <div
          key={`flash-${flashKey}`}
          className="pointer-events-none absolute inset-0 z-50 bg-white animate-screen-flash"
        />
      )}

      {/* Top Header */}
      <div className="w-full max-w-md flex items-center justify-between pt-2 px-2 relative z-30">
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/75 border border-amber-400/50 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-xs font-game text-amber-300 uppercase tracking-wider">
            Recompensas Diarias
          </span>
        </div>

        <button
          onClick={onClose}
          disabled={isSpinning}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition active:scale-95 border border-white/15 backdrop-blur-md shadow-md disabled:opacity-30 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Title & Subtitle */}
      <div className="text-center relative z-20 mt-0.5">
        <h2 className="text-2xl sm:text-3xl font-game game-title-gold tracking-wide">
          RULETA DE LA SUERTE
        </h2>
        <p className="text-[11px] sm:text-xs text-amber-200/80 font-bold uppercase tracking-wider mt-0.5">
          {cooldown.canSpinFree
            ? "¡TIENES 1 TIRO GRATIS DISPONIBLE!"
            : `Próximo tiro gratis en: ${formatTimer(cooldown.remainingMs)}`}
        </p>
      </div>

      {/* ======================================================== */}
      {/* 3D VIDEO GAME FORTUNE WHEEL (Real 3D Artwork Disc + Bezel + Needle) */}
      {/* ======================================================== */}
      <div className="relative my-auto flex items-center justify-center w-72 h-72 sm:w-84 sm:h-84 z-20">
        {/* Glowing background aura */}
        <div className="absolute w-76 h-76 sm:w-88 sm:h-88 rounded-full blur-3xl opacity-75 bg-amber-500/35 animate-pulse pointer-events-none" />

        {/* 1. ROTATING 3D WHEEL DISC */}
        <div
          className="w-full h-full relative flex items-center justify-center select-none"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: isSpinning ? "4.5s" : "0s",
            transitionTimingFunction: "cubic-bezier(0.12, 0.95, 0.2, 1)",
          }}
        >
          <img
            src="/roulette/wheel_disc.png"
            alt="Ruleta de la Suerte"
            className="w-full h-full object-contain pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* 2. STATIC 3D GOLDEN BEZEL WITH GLOWING CASINO STUDS */}
        <img
          src="/roulette/wheel_bezel.png"
          alt="Marco Dorado de Ruleta"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)] z-25"
        />

        {/* 3. STATIC 3D GOLDEN CENTER HUB WITH RUBY GEM */}
        <img
          src="/roulette/wheel_center.png"
          alt="Eje Central Dorado"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 object-contain pointer-events-none drop-shadow-[0_6px_16px_rgba(0,0,0,0.85)] z-30"
        />

        {/* 4. 3D GOLDEN TICKER NEEDLE (With physical wobble when spinning) */}
        <div
          className="absolute -top-5 left-1/2 -translate-x-1/2 z-35 pointer-events-none transition-transform duration-75 origin-top"
          style={{
            transform: `translateX(-50%) rotate(${needleTick}deg)`,
          }}
        >
          <img
            src="/roulette/wheel_needle.png"
            alt="Aguja de la Ruleta"
            className="w-10 h-14 sm:w-12 sm:h-16 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* ACTION BUTTONS & REWARDS MODAL (Short, Compact, Centered) */}
      {/* ======================================================== */}
      <div className="w-full max-w-md pb-4 px-2 relative z-30 flex flex-col items-center">
        {winningPrize ? (
          <div className="flex flex-col items-center animate-reward-emerge bg-black/85 border-2 border-amber-400/80 rounded-3xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.95)] backdrop-blur-xl w-full max-w-[250px] mx-auto">
            <span className="text-[10px] font-game uppercase tracking-widest text-amber-400">
              ★ ¡PREMIO GANADO! ★
            </span>
            
            {/* Real 3D prize graphic */}
            <div className="w-20 h-20 my-1 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-amber-400/25 rounded-full blur-xl pointer-events-none" />
              <img
                src={winningPrize.image}
                alt={winningPrize.label}
                className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] animate-bounce-gentle"
              />
            </div>

            <h3 className="text-lg font-game game-title-gold text-white text-center leading-tight">
              {winningPrize.label}
            </h3>
            <p className="text-[11px] text-amber-200/80 font-bold mb-3 text-center">
              {winningPrize.type === "chest"
                ? "¡Se guardó en tu Tienda para abrirlo gratis!"
                : winningPrize.sub}
            </p>

            {winningPrize.type === "chest" ? (
              <div className="flex flex-col gap-2 w-full mt-1">
                <button
                  onClick={() => {
                    handleClaim();
                    if (onNavigateTienda) {
                      onClose();
                      onNavigateTienda();
                    }
                  }}
                  className="btn-clash-green px-4 py-2 rounded-full text-xs font-game inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xl w-full active:translate-y-[2px]"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>¡IR A LA TIENDA A ABRIRLO!</span>
                </button>
                <button
                  onClick={handleClaim}
                  className="btn-clash-yellow px-5 py-1.5 rounded-full text-xs font-game inline-flex items-center justify-center gap-1 cursor-pointer max-w-[120px] mx-auto active:translate-y-[2px]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>¡LISTO!</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleClaim}
                className="btn-clash-yellow px-6 py-2 rounded-full text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xl max-w-[140px] mx-auto active:translate-y-[2px]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>¡LISTO!</span>
              </button>
            )}
          </div>
        ) : cooldown.canSpinFree ? (
          <button
            onClick={() => handleSpin(true)}
            disabled={isSpinning}
            className="btn-clash-green px-6 py-2.5 rounded-full text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xl max-w-[140px] mx-auto active:translate-y-[2px] disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>{isSpinning ? "GIRANDO..." : "¡GIRAR!"}</span>
            <Sparkles className="w-3.5 h-3.5 fill-current" />
          </button>
        ) : (
          <div className="flex flex-col items-center gap-1.5 w-full">
            <button
              onClick={() => handleSpin(false)}
              disabled={isSpinning || coins < SPIN_COST}
              className="btn-clash-yellow px-5 py-2 rounded-full text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xl max-w-[150px] mx-auto active:translate-y-[2px] disabled:opacity-50"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>
                {isSpinning
                  ? "GIRANDO..."
                  : coins >= SPIN_COST
                  ? `GIRAR (${SPIN_COST})`
                  : `SIN MONEDAS`}
              </span>
            </button>
            <p className="text-center text-[10px] text-white/50 font-medium">
              Tiro gratis en {formatTimer(cooldown.remainingMs)}
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
