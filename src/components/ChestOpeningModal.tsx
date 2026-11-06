import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, Check, ChevronRight, Trophy, Star, Crown, Zap, Flame } from "lucide-react";
import { CoinAnimation } from "@/components/CoinAnimation";
import { ChestParticlesCanvas, type ChestParticlesHandle } from "@/components/ChestParticlesCanvas";
import type { ChestConfig, RewardItem, Rarity } from "@/lib/chests";
import { recordLootClaim } from "@/lib/loot";

// Procedural Web Audio API sound synthesizer for immediate, punchy game audio
class ProceduralChestAudio {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    try {
      if (!this.ctx && typeof window !== "undefined") {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Heavy lock crack / latch snap
  playCrack() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.08);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(3.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch {}
  }

  // Cinematic sub-bass impact boom
  playBoom() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(36, now + 0.45);

      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }

  // Shimmering celestial reward chime
  playChime(pitchMultiplier = 1) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq * pitchMultiplier, now + i * 0.035);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.2, now + i * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.035 + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.035);
        osc.stop(now + i * 0.035 + 0.35);
      });
    } catch {}
  }

  // Legendary / Final victory fanfare chord
  playFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const chord = [392.0, 523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.18, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.75);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.8);
      });
    } catch {}
  }
}

const soundSynth = new ProceduralChestAudio();

// Audio trigger helper with safe fallback
function playOpeningSound(name: "pop" | "sacar" | "winner") {
  try {
    const audio = new Audio(`/audio/effects/${name}.mp3`);
    audio.volume = 0.6;
    audio.play().catch(() => {});
  } catch {}
}

// 4-point golden sparkle star
function DestelloStar({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
    </svg>
  );
}

// Clash Royale Mathematical Sunburst God Rays (Rayitos)
function SunburstRays({
  color = "#fbbf24",
  rays = 20,
  className = "",
}: {
  color?: string;
  rays?: number;
  className?: string;
}) {
  const angleStep = 360 / rays;
  const safeColor = color.startsWith("#") || color.startsWith("rgb") ? color : "#fbbf24";

  return (
    <svg viewBox="-250 -250 500 500" className={`w-full h-full ${className}`}>
      <defs>
        <radialGradient
          id={`sunburstGrad-${safeColor.replace(/[^a-zA-Z0-9]/g, "")}`}
          cx="0"
          cy="0"
          r="250"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={safeColor} stopOpacity="0.85" />
          <stop offset="35%" stopColor={safeColor} stopOpacity="0.45" />
          <stop offset="75%" stopColor={safeColor} stopOpacity="0.12" />
          <stop offset="100%" stopColor={safeColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: rays }).map((_, i) => {
        const start = (i * angleStep * Math.PI) / 180;
        const end = ((i * angleStep + angleStep / 2) * Math.PI) / 180;
        const r = 260;
        const x1 = Math.cos(start) * r;
        const y1 = Math.sin(start) * r;
        const x2 = Math.cos(end) * r;
        const y2 = Math.sin(end) * r;
        return (
          <path
            key={i}
            d={`M 0 0 L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`}
            fill={`url(#sunburstGrad-${safeColor.replace(/[^a-zA-Z0-9]/g, "")})`}
          />
        );
      })}
    </svg>
  );
}

interface ChestOpeningModalProps {
  open: boolean;
  chest: ChestConfig | null;
  rewards: RewardItem[];
  onClose: () => void;
  onClaim: (rewards: RewardItem[]) => void;
}

export function ChestOpeningModal({
  open,
  chest,
  rewards,
  onClose,
  onClaim,
}: ChestOpeningModalProps) {
  const [phase, setPhase] = useState<"idle" | "opening" | "revealing" | "summary">("idle");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [cameraShake, setCameraShake] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);
  const [chestReacting, setChestReacting] = useState(false);
  const [counterPunch, setCounterPunch] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [animatedCoins, setAnimatedCoins] = useState(0);

  // 3D Interactive Tilt on hover/pointer
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const particlesRef = useRef<ChestParticlesHandle>(null);
  const chestRef = useRef<HTMLDivElement>(null);

  // Reset state whenever opened
  useEffect(() => {
    if (open && chest) {
      setPhase("idle");
      setCurrentIdx(0);
      setIsShaking(false);
      setCameraShake(false);
      setShowShockwave(false);
      setChestReacting(false);
      setCounterPunch(false);
      setFlashKey(0);
      setAnimatedCoins(0);
      setTilt({ x: 0, y: 0 });
    }
  }, [open, chest]);

  const currentReward: RewardItem | undefined = rewards[currentIdx];

  // Animated coin ticker
  useEffect(() => {
    if (!open || !chest) return;
    if (phase === "revealing" && currentReward?.type === "coins" && currentReward.amount) {
      let start = 0;
      const target = currentReward.amount;
      const step = Math.ceil(target / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) {
          setAnimatedCoins(target);
          clearInterval(timer);
        } else {
          setAnimatedCoins(start);
        }
      }, 25);
      return () => clearInterval(timer);
    }
  }, [open, chest, phase, currentIdx, currentReward]);

  if (!open || !chest || rewards.length === 0) return null;
  if (typeof document === "undefined") return null;

  const remainingCount = rewards.length - currentIdx;
  const isLegendary = currentReward?.rarity === "legendaria";
  const isEpic = currentReward?.rarity === "epica";
  const isSpecial = currentReward?.rarity === "especial";

  // Ray & glow color based on revealed card or chest
  const getRayColor = () => {
    if (phase === "revealing" && currentReward) {
      if (currentReward.rarity === "legendaria") return "#06b6d4";
      if (currentReward.rarity === "epica") return "#d946ef";
      if (currentReward.rarity === "especial") return "#f59e0b";
      return "#e2e8f0";
    }
    if (chest.id === "legendario") return "#06b6d4";
    if (chest.id === "magico") return "#d946ef";
    if (chest.id === "oro") return "#fbbf24";
    return "#f59e0b";
  };

  const rayColor = getRayColor();

  // Pointer movement tracking for 3D perspective tilt
  const handlePointerMove = (e: React.PointerEvent) => {
    if (phase !== "idle" || isShaking) return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    setTilt({
      x: -dy * 10,
      y: dx * 12,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // First Tap: Anticipation wobble & crack -> Explosive 3D pop open!
  const handleChestTap = () => {
    if (phase !== "idle") return;

    setIsShaking(true);
    setCameraShake(true);
    soundSynth.playCrack();
    playOpeningSound("sacar");

    try {
      navigator.vibrate?.([60, 40, 100]);
    } catch {}

    // Anticipation shake (450ms), then DETONATION!
    setTimeout(() => {
      setIsShaking(false);
      setCameraShake(false);
      setPhase("opening");
      setFlashKey((prev) => prev + 1);
      setShowShockwave(true);
      soundSynth.playBoom();
      soundSynth.playChime(1.2);
      playOpeningSound("pop");

      // Spawn 60 FPS burst of particles from the chest center
      const rect = chestRef.current?.getBoundingClientRect();
      const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
      particlesRef.current?.burst(cx, cy, 50, rayColor);
    }, 450);

    // Transition to revealing cards (Chest remains in scene, cards shoot out)
    setTimeout(() => {
      setPhase("revealing");
      setCurrentIdx(0);
      setFlashKey((prev) => prev + 1);
      setCounterPunch(true);
      setTimeout(() => setCounterPunch(false), 300);

      // Card launch spark burst from the open chest
      particlesRef.current?.burst(window.innerWidth / 2, window.innerHeight * 0.72, 35, rayColor);
    }, 900);
  };

  // Tap anywhere to advance to next reward (Chest recoil bounce + Card shoots out)
  const handleAdvance = () => {
    if (phase !== "revealing") return;

    try {
      navigator.vibrate?.([30]);
    } catch {}

    // Recoil the open chest
    setChestReacting(true);
    setTimeout(() => setChestReacting(false), 350);

    // Punch the counter badge
    setCounterPunch(true);
    setTimeout(() => setCounterPunch(false), 250);

    // Screen micro-flash
    setFlashKey((prev) => prev + 1);

    // Sparks erupt from chest mouth
    particlesRef.current?.burst(window.innerWidth / 2, window.innerHeight * 0.68, 30, rayColor);

    if (currentIdx < rewards.length - 1) {
      soundSynth.playChime(1 + (currentIdx + 1) * 0.1);
      playOpeningSound("pop");
      setCurrentIdx((prev) => prev + 1);
    } else {
      soundSynth.playFanfare();
      playOpeningSound("winner");
      setPhase("summary");
      particlesRef.current?.celebrate(100);
    }
  };

  // Final claim button
  const handleFinalClaim = () => {
    try {
      recordLootClaim(rewards, chest?.name || "Cofre");
    } catch {}
    onClaim(rewards);
    onClose();
  };

  const getRarityBadge = (rarity: Rarity) => {
    switch (rarity) {
      case "legendaria":
        return {
          label: "¡LEGENDARIA!",
          bg: "bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-400 text-slate-950 font-black",
          border: "border-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.8)]",
          glow: "animate-rainbow-glow",
        };
      case "epica":
        return {
          label: "ÉPICA",
          bg: "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-black",
          border: "border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.6)]",
          glow: "drop-shadow-[0_0_15px_rgba(217,70,239,0.7)]",
        };
      case "especial":
        return {
          label: "ESPECIAL",
          bg: "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black",
          border: "border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]",
          glow: "drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]",
        };
      default:
        return {
          label: "COMÚN",
          bg: "bg-slate-700 text-slate-200 font-bold",
          border: "border-slate-500 shadow-sm",
          glow: "",
        };
    }
  };

  // Total coins collected across rewards
  const totalCoins = rewards.reduce((sum, r) => (r.type === "coins" && r.amount ? sum + r.amount : sum), 0);

  return createPortal(
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={phase === "revealing" ? handleAdvance : undefined}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between bg-[#060812]/98 backdrop-blur-2xl select-none overflow-hidden text-white font-sans ${
        cameraShake ? "animate-camera-shake" : ""
      }`}
    >
      {/* 60 FPS Canvas Particle Physics Engine */}
      <ChestParticlesCanvas ref={particlesRef} />

      {/* Full-screen Flash Trigger (Clash Royale POP!) */}
      {flashKey > 0 && (
        <div
          key={`flash-${flashKey}`}
          className="pointer-events-none absolute inset-0 z-50 bg-white animate-screen-flash"
        />
      )}

      {/* ======================================================== */}
      {/* BACKGROUND SUNBURST GOD RAYS (Continuous 360 Spin) */}
      {/* ======================================================== */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {/* Layer 1: Clockwise outer sunburst rays */}
        <div className="w-[850px] h-[850px] sm:w-[1100px] sm:h-[1100px] animate-sunburst opacity-50 shrink-0">
          <SunburstRays color={rayColor} rays={20} />
        </div>

        {/* Layer 2: Counter-clockwise inner radiant rays */}
        <div className="absolute w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] animate-sunburst-reverse opacity-40 shrink-0">
          <SunburstRays color={rayColor} rays={16} />
        </div>

        {/* Radial color aura */}
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-60 animate-pulse-halo"
          style={{ background: rayColor }}
        />
      </div>

      {/* ======================================================== */}
      {/* FLOATING DESTELLOS / SPARKLES (Estrellitas brillantes) */}
      {/* ======================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <DestelloStar
          className="absolute text-amber-300 w-6 h-6 animate-destello drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
          style={{ top: "14%", left: "16%", animationDelay: "0s" }}
        />
        <DestelloStar
          className="absolute text-yellow-200 w-8 h-8 animate-destello drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]"
          style={{ top: "22%", right: "14%", animationDelay: "0.6s" }}
        />
        <DestelloStar
          className="absolute text-cyan-300 w-5 h-5 animate-destello drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          style={{ top: "42%", left: "8%", animationDelay: "1.2s" }}
        />
        <DestelloStar
          className="absolute text-amber-400 w-7 h-7 animate-destello drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]"
          style={{ top: "54%", right: "10%", animationDelay: "0.3s" }}
        />
        <DestelloStar
          className="absolute text-fuchsia-300 w-5 h-5 animate-destello drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]"
          style={{ top: "70%", left: "14%", animationDelay: "0.9s" }}
        />
      </div>

      {/* ======================================================== */}
      {/* PERSISTENT TOP BAR */}
      {/* ======================================================== */}
      <div className="w-full max-w-md pt-5 px-5 flex items-center justify-between relative z-30">
        {/* Chest Name / Badge Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/75 border-2 border-amber-400/50 text-xs font-game backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
          <span className="text-white drop-shadow uppercase tracking-wider">{chest.name}</span>
        </div>

        {/* Counter Badge or Status */}
        {phase === "revealing" && (
          <div
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 text-xs font-game shadow-[0_4px_15px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all ${
              counterPunch ? "scale-125" : "scale-100"
            } ${
              remainingCount === 1
                ? "bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 border-amber-300 text-white animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.9)]"
                : "bg-gradient-to-r from-amber-500/40 to-yellow-500/40 border-amber-400/60 text-amber-300"
            }`}
          >
            <span className="text-lg leading-none font-game">{remainingCount}</span>
            <span className="text-[11px] uppercase tracking-wider">
              {remainingCount === 1 ? "¡ÚLTIMA CARTA!" : "restantes"}
            </span>
          </div>
        )}

        {/* Close Button (only when idle or summary) */}
        {(phase === "idle" || phase === "summary") && (
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition active:scale-95 border border-white/15 backdrop-blur-md shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* STAGE: ONE UNIFIED LIVING ARENA */}
      {/* ======================================================== */}
      <div className="flex-1 w-full max-w-md flex flex-col items-center justify-between py-4 px-6 relative z-20">
        {/* -------------------------------------------------------- */}
        {/* UPPER PORTION: Header in Idle OR Floating Reward in Revealing */}
        {/* -------------------------------------------------------- */}
        {(phase === "idle" || phase === "opening") && (
          <div className="text-center animate-slide-up-soft mt-1">
            <span className="px-4 py-1.5 rounded-full text-xs font-game uppercase tracking-widest bg-amber-400/25 border-2 border-amber-400/60 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.5)]">
              {chest.badge}
            </span>
            <h2 className="text-3xl font-game game-title mt-2.5 text-white tracking-wide">
              {chest.name}
            </h2>
            <p className="text-xs text-amber-200/80 mt-1 font-semibold uppercase tracking-wider">
              {chest.totalCards} Recompensas en su interior
            </p>
          </div>
        )}

        {/* REVEALING: The Reward emerges and floats freely above the chest */}
        {phase === "revealing" && currentReward && (
          <div
            key={`reward-${currentIdx}`}
            className="flex flex-col items-center animate-reward-emerge relative z-30 pt-1"
          >
            {/* Rarity Ribbon Pill */}
            {(() => {
              const badge = getRarityBadge(currentReward.rarity);
              return (
                <div
                  className={`px-5 py-1.5 rounded-full text-xs font-game uppercase tracking-widest mb-3 border-2 shadow-[0_4px_15px_rgba(0,0,0,0.8)] ${badge.bg} ${badge.border} ${badge.glow}`}
                >
                  {badge.label}
                </div>
              );
            })()}

            {/* COIN REWARD: Giant 3D Golden Coin + Glowing Ticker */}
            {currentReward.type === "coins" && (
              <div className="flex flex-col items-center my-2">
                <CoinAnimation className="w-28 h-28 sm:w-32 sm:h-32 drop-shadow-[0_15px_35px_rgba(255,215,0,0.7)] animate-bounce-gentle" />
                <div className="mt-2 text-5xl sm:text-6xl font-game game-title-gold tracking-tight">
                  +{animatedCoins.toLocaleString()}
                </div>
                <span className="text-sm font-game uppercase text-amber-300 tracking-widest mt-1 drop-shadow">
                  Monedas de Oro
                </span>
              </div>
            )}

            {/* LOTERÍA CARD REWARD: Floating authentic card with holographic sheen */}
            {currentReward.type === "card" && currentReward.image && (
              <div className="flex flex-col items-center my-1">
                <div
                  className={`w-36 sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.95)] relative bg-black/40 border-2 transition-all ${
                    isLegendary
                      ? "border-cyan-300 shadow-[0_0_35px_rgba(6,182,212,0.7)]"
                      : isEpic
                      ? "border-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.6)]"
                      : isSpecial
                      ? "border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)]"
                      : "border-white/30"
                  }`}
                >
                  <img
                    src={currentReward.image}
                    alt={currentReward.title}
                    className="w-full h-full object-cover select-none"
                  />
                  {/* Holographic foil sweep across the card */}
                  <div className="pointer-events-none absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-45 animate-shimmer" />
                </div>
                <h3 className="text-2xl font-game game-title text-white leading-tight mt-2.5">
                  {currentReward.title}
                </h3>
                <p className="text-xs text-white/80 font-bold uppercase tracking-wider mt-0.5">
                  {currentReward.description}
                </p>
              </div>
            )}

            {/* WALLPAPER / STICKER / EMOJI / MARKER / TITLE REWARD */}
            {currentReward.type !== "coins" && currentReward.type !== "card" && (
              <div className="flex flex-col items-center my-2">
                <div
                  className={`w-28 h-28 rounded-3xl bg-white/10 border-2 flex items-center justify-center mb-2.5 shadow-[0_15px_30px_rgba(0,0,0,0.8)] backdrop-blur-md relative overflow-hidden p-3 ${
                    isLegendary
                      ? "border-cyan-300 shadow-[0_0_35px_rgba(6,182,212,0.7)]"
                      : isEpic
                      ? "border-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.6)]"
                      : isSpecial
                      ? "border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)]"
                      : "border-white/30"
                  }`}
                >
                  {currentReward.image ? (
                    <img
                      src={currentReward.image}
                      alt={currentReward.title}
                      className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] animate-pop-in"
                    />
                  ) : (
                    <span className="text-6xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]">
                      {currentReward.emoji || "🎁"}
                    </span>
                  )}
                  {currentReward.type === "wallpaper" && (
                    <span className="absolute bottom-1 px-2.5 py-0.5 rounded-full bg-black/80 border border-amber-400/50 text-[9px] font-game text-amber-300 uppercase tracking-wider">
                      Tapete de Mesa
                    </span>
                  )}
                  {currentReward.type === "deck" && (
                    <span className="absolute bottom-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 border border-yellow-200 text-[9px] font-game text-slate-950 uppercase tracking-wider shadow-md">
                      Baraja Completa
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-game game-title text-white leading-tight text-center">
                  {currentReward.title}
                </h3>
                <p className="text-xs text-white/80 font-bold uppercase tracking-wider mt-1 max-w-[240px] text-center">
                  {currentReward.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SUMMARY: Showcase of All Won Cards and Rewards */}
        {/* ======================================================== */}
        {phase === "summary" && (
          <div className="flex-1 w-full max-w-md flex flex-col items-center justify-between py-3 animate-fade-in relative z-30">
            {/* Header Ribbon */}
            <div className="text-center mt-1 flex flex-col items-center animate-slide-up-soft">
              <span className="px-4 py-1 rounded-full text-xs font-game uppercase tracking-widest bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 inline-flex items-center gap-1.5 shadow-[0_0_20px_rgba(251,191,36,0.7)] border-2 border-yellow-100">
                <Trophy className="w-4 h-4 fill-current" /> ¡COFRE DESBLOQUEADO!
              </span>
              <h2 className="text-3xl font-game game-title-gold mt-2 tracking-wide">
                Tus Recompensas
              </h2>
            </div>

            {/* Showcase Stage */}
            <div className="w-full flex-1 my-auto flex flex-col items-center justify-center gap-4 py-3">
              {/* 1. Golden Coins Banner (Prominent, Gleaming) */}
              {totalCoins > 0 && (
                <div className="flex items-center gap-2.5 px-5 py-2 rounded-full bg-black/80 border-2 border-amber-400/80 shadow-[0_8px_25px_rgba(251,191,36,0.35)] backdrop-blur-md animate-pop-in">
                  <CoinAnimation className="w-7 h-7 drop-shadow-[0_4px_10px_rgba(255,215,0,0.8)]" />
                  <span className="text-xl sm:text-2xl font-game game-title-gold tracking-tight">
                    +{totalCoins.toLocaleString()}
                  </span>
                  <span className="text-xs font-game uppercase text-amber-300 tracking-wider">
                    Monedas
                  </span>
                </div>
              )}

              {/* 2. Heroic Cards & Items Showcase */}
              <div className="flex items-center justify-center gap-3.5 flex-wrap max-w-sm px-2 animate-fade-in">
                {rewards
                  .filter((r) => r.type !== "coins")
                  .map((item, idx) => {
                    const badge = getRarityBadge(item.rarity);
                    const isLegendary = item.rarity === "legendaria";
                    const isEpic = item.rarity === "epica";
                    const isSpecial = item.rarity === "especial";

                    if (item.type === "card" && item.image) {
                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center group animate-pop-in"
                          style={{ animationDelay: `${idx * 0.15}s` }}
                        >
                          <span
                            className={`text-[9px] font-game uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5 border shadow-sm ${badge.bg} ${badge.border}`}
                          >
                            {badge.label}
                          </span>

                          {/* 3D Lotería Card with Holographic Sheen */}
                          <div
                            className={`w-24 sm:w-28 aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.9)] relative bg-black/60 border-2 transition-transform duration-300 group-hover:scale-105 ${
                              isLegendary
                                ? "border-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.8)]"
                                : isEpic
                                ? "border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.7)]"
                                : isSpecial
                                ? "border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                                : "border-white/30"
                            }`}
                          >
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover select-none"
                            />
                            <div className="pointer-events-none absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-45 animate-shimmer" />
                          </div>

                          <span className="text-xs font-game text-white mt-1.5 tracking-wide max-w-[100px] truncate text-center drop-shadow">
                            {item.title}
                          </span>
                        </div>
                      );
                    }

                    // Sticker / Marker / Title Showcase
                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center group animate-pop-in"
                        style={{ animationDelay: `${idx * 0.15}s` }}
                      >
                        <span
                          className={`text-[9px] font-game uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5 border shadow-sm ${badge.bg} ${badge.border}`}
                        >
                          {badge.label}
                        </span>

                        <div className="w-24 sm:w-28 aspect-[3/4] rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-950 border-2 border-amber-400/50 shadow-[0_15px_30px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center p-2 backdrop-blur-md relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                          <div className="absolute inset-0 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-14 h-14 object-contain drop-shadow"
                            />
                          ) : (
                            <span className="text-4xl drop-shadow">{item.emoji || "🎁"}</span>
                          )}
                          <span className="text-[10px] font-game text-amber-200/90 mt-2 text-center line-clamp-2 leading-tight">
                            {item.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Bottom Claim Action: Compact, Short Button */}
            <div className="mt-2 w-full flex justify-center pb-2">
              <button
                onClick={handleFinalClaim}
                className="btn-clash-yellow px-6 py-2.5 rounded-full text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xl max-w-[150px] mx-auto active:translate-y-[2px]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>¡LISTO!</span>
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* LOWER PORTION: The Living 3D Chest (ONLY WHEN NOT IN SUMMARY!) */}
        {/* -------------------------------------------------------- */}
        {phase !== "summary" && (
          <div
            ref={chestRef}
            onClick={phase === "idle" ? handleChestTap : undefined}
            className={`relative flex flex-col items-center justify-center transition-all duration-500 ${
              phase === "idle" ? "my-auto cursor-pointer" : "-mb-3"
            }`}
          >
            {/* Contact Ground Shadow (breathing with chest hover) */}
            <div
              className={`absolute -bottom-2 w-48 sm:w-56 h-6 rounded-full bg-black/60 blur-md pointer-events-none transition-all duration-300 ${
                isShaking
                  ? "scale-125 opacity-90"
                  : phase === "idle"
                  ? "animate-chest-ground-shadow"
                  : "scale-90 opacity-40"
              }`}
            />

            {/* Glowing Aura directly behind / inside the chest */}
            <div
              className="absolute w-72 h-72 rounded-full blur-3xl opacity-75 animate-pulse-halo pointer-events-none"
              style={{ background: chest.glowColor }}
            />

            {/* Expanding Shockwave Ring upon burst */}
            {showShockwave && (
              <div
                key={`shockwave-${flashKey}`}
                className="absolute w-64 h-64 rounded-full border-4 pointer-events-none animate-shockwave"
                style={{
                  borderColor: rayColor,
                  boxShadow: `0 0 35px ${rayColor}`,
                }}
              />
            )}

            {/* Light pillar ascending from the open chest */}
            {phase !== "idle" && (
              <div
                className="absolute -top-20 w-36 h-48 pointer-events-none animate-pulse"
                style={{
                  background: `linear-gradient(to top, ${rayColor}88 0%, ${rayColor}22 65%, transparent 100%)`,
                  filter: "blur(14px)",
                  clipPath: "polygon(15% 100%, 85% 100%, 100% 0%, 0% 0%)",
                }}
              />
            )}

            {/* 3D Chest Model / Sprite with Perspective & Tilt */}
            <div
              className={`relative flex items-center justify-center transition-transform duration-300 select-none ${
                phase === "idle"
                  ? isShaking
                    ? "animate-chest-shake w-72 h-72 sm:w-80 sm:h-80"
                    : "animate-chest-idle w-72 h-72 sm:w-80 sm:h-80"
                  : phase === "opening"
                  ? "animate-chest-open-burst w-72 h-72 sm:w-80 sm:h-80"
                  : chestReacting
                  ? "animate-chest-reaction w-60 h-60 sm:w-68 sm:h-68"
                  : "w-60 h-60 sm:w-68 sm:h-68"
              }`}
              style={
                phase === "idle" && !isShaking
                  ? {
                      transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                      transition: "transform 0.12s ease-out",
                    }
                  : undefined
              }
            >
              <img
                src={phase === "idle" ? chest.image : (chest.openImage || chest.image)}
                alt={chest.name}
                className="w-full h-full object-contain pointer-events-none select-none"
                style={{
                  filter: `drop-shadow(0 0 24px ${chest.glowColor}) drop-shadow(0 14px 28px rgba(0,0,0,0.45))`,
                }}
              />

              {/* Pulsing Magic Seal / Keyhole Lens Flare (In Idle) */}
              {phase === "idle" && !isShaking && (
                <div className="absolute top-[56%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                  <div
                    className="w-10 h-10 rounded-full opacity-60 animate-ping pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${rayColor} 0%, transparent 70%)` }}
                  />
                  <DestelloStar className="w-8 h-8 text-amber-200 animate-lock-pulse drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                </div>
              )}

              {/* Light Seam Leak during anticipation shake */}
              {isShaking && (
                <div className="absolute top-[54%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-3 rounded-full pointer-events-none animate-pulse blur-xs"
                  style={{
                    background: `linear-gradient(90deg, transparent, #ffffff, ${rayColor}, #ffffff, transparent)`,
                    boxShadow: `0 0 25px 6px ${rayColor}`,
                  }}
                />
              )}
            </div>

            {/* Tap Prompt in Idle: Short, Compact Button */}
            {phase === "idle" && (
              <div className="mt-4 text-center animate-bounce-gentle flex flex-col items-center">
                <button
                  onClick={handleChestTap}
                  className="btn-clash-yellow px-6 py-2.5 rounded-full text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xl max-w-[150px] mx-auto active:translate-y-[2px]"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>¡ABRIR!</span>
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                </button>
                <p className="text-[11px] text-white/60 mt-1.5 font-medium tracking-wide">
                  Toca para romper el sello
                </p>
              </div>
            )}

            {/* Tap indicator in Revealing */}
            {phase === "revealing" && (
              <div className="absolute -top-1 px-4 py-1.5 rounded-full bg-black/85 border-2 border-amber-400/60 backdrop-blur-md text-xs font-game text-amber-300 flex items-center gap-1.5 animate-pulse shadow-xl pointer-events-none uppercase tracking-wider">
                <span>Toca para continuar</span>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
