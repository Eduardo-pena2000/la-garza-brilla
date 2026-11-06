import { useState, useEffect, useMemo } from "react";
import { Crown, Calendar, Clock, X, ChevronRight, Sparkles, Trophy, Minus, Maximize2, ShieldCheck } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

interface ScheduledMatch {
  id: string;
  name: string;
  isVip?: boolean;
  scheduledDate: string;
  scheduledTime: string;
  targetTimestamp: number;
  roundsCount?: number;
  totalPrize?: string;
  host?: string;
  isHost?: boolean;
  registeredPlayerName?: string;
}

export function FloatingMatchCountdown() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<ScheduledMatch[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = sessionStorage.getItem("garza:dismissed_countdowns");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("garza:countdown_minimized") === "true";
  });
  const [now, setNow] = useState(Date.now());

  // Update clock every second for live real-time countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to Firebase mesas to find registered upcoming matches
  useEffect(() => {
    const userName = (typeof window !== "undefined" ? localStorage.getItem("garza:name") || "" : "").trim();
    const mesasRef = ref(database, "mesas");

    const unsubscribe = onValue(mesasRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setMatches([]);
        return;
      }

      const activeList: ScheduledMatch[] = [];

      Object.values(data).forEach((m: any) => {
        if (!m || (m.status !== "programada" && !m.isScheduled) || !m.scheduledDate) return;

        // Parse date and time (formats supported: YYYY-MM-DD or DD/MM/YYYY)
        const timeStr = m.scheduledTime || "12:00";
        const dateStr = m.scheduledDate; // "YYYY-MM-DD"
        let target = new Date(`${dateStr}T${timeStr}:00`).getTime();

        // Fallback parsing if date has slashes
        if (isNaN(target) && typeof dateStr === "string" && dateStr.includes("/")) {
          const parts = dateStr.split("/");
          if (parts.length === 3) {
            target = new Date(`${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}T${timeStr}:00`).getTime();
          }
        }

        // Must be in the future or started within the last 30 minutes
        if (isNaN(target) || target < Date.now() - 30 * 60 * 1000) return;

        // Check if current user is registered for this match
        const lowerName = userName.toLowerCase();
        const isHost = Boolean(m.host && lowerName && m.host.toLowerCase() === lowerName);
        const isPlayer = Boolean(
          m.players &&
          lowerName &&
          Object.keys(m.players).some((k) => k.toLowerCase() === lowerName)
        );
        const registeredFound =
          m.registeredPlayers &&
          Array.isArray(m.registeredPlayers) &&
          lowerName &&
          m.registeredPlayers.find((p: any) => {
            const pName = typeof p === "string" ? p : p?.name;
            return pName && pName.trim().toLowerCase() === lowerName;
          });

        const isRegistered = Boolean(registeredFound);

        // Check local storage records (if created or visited from this device)
        const isLocalHost = typeof window !== "undefined" && localStorage.getItem(`garza:host:${m.id}`) === "true";
        const isLocalRegistered = typeof window !== "undefined" && localStorage.getItem(`garza:registered:${m.id}`) === "true";

        // If user has a name and matches registration OR device participated in this room
        if (isHost || isPlayer || isRegistered || isLocalHost || isLocalRegistered) {
          // Calculate prize sum or display text
          let prizeText = "";
          if (m.rounds && Array.isArray(m.rounds) && m.rounds.length > 0) {
            const firstPrize = m.rounds[0]?.prize;
            if (firstPrize) prizeText = firstPrize;
          }

          activeList.push({
            id: m.id,
            name: m.name || "Partida Programada",
            isVip: Boolean(m.isVip),
            scheduledDate: dateStr,
            scheduledTime: timeStr,
            targetTimestamp: target,
            roundsCount: m.rounds?.length || 1,
            totalPrize: prizeText,
            host: m.host,
            isHost: isHost || isLocalHost,
            registeredPlayerName: typeof registeredFound === "object" ? registeredFound?.name : userName,
          });
        }
      });

      // Sort by soonest match
      activeList.sort((a, b) => a.targetTimestamp - b.targetTimestamp);
      setMatches(activeList);
    });

    return () => unsubscribe();
  }, []);

  // Pick the soonest match that hasn't been dismissed by the user
  const currentMatch = useMemo(() => {
    return matches.find((m) => !dismissedIds.includes(m.id)) || null;
  }, [matches, dismissedIds]);

  // Don't show if no upcoming match
  if (!currentMatch) return null;

  // Don't show if user is actively in the game board of any match (don't obstruct cards)
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  if (pathname.includes("/jugar")) return null;

  // If already in the lobby of THIS scheduled match, the main screen already has the full info
  if (pathname.includes(`/mesa/${currentMatch.id}`) && !pathname.includes("/jugar")) {
    return null;
  }

  // Calculate live remaining time
  const diff = Math.max(0, currentMatch.targetTimestamp - now);
  const isStarted = diff === 0;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = [...dismissedIds, currentMatch.id];
    setDismissedIds(updated);
    try {
      sessionStorage.setItem("garza:dismissed_countdowns", JSON.stringify(updated));
    } catch {}
  };

  const handleToggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("garza:countdown_minimized", next ? "true" : "false");
      } catch {}
      return next;
    });
  };

  const handleOpenLobby = () => {
    navigate({ to: "/mesa/$id", params: { id: currentMatch.id } });
  };

  // Format date display (e.g., "Vie, 30 Oct • 20:00")
  const formattedDate = (() => {
    try {
      const [year, month, day] = currentMatch.scheduledDate.split("-");
      if (year && month && day) {
        const d = new Date(Number(year), Number(month) - 1, Number(day));
        const dayName = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][d.getDay()] || "";
        const monthName = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][d.getMonth()] || "";
        return `${dayName}, ${day} ${monthName} • ${currentMatch.scheduledTime} hrs`;
      }
    } catch {}
    return `${currentMatch.scheduledDate} • ${currentMatch.scheduledTime} hrs`;
  })();

  // MINIMIZED VIEW: Sleek glowing golden pill
  if (isMinimized) {
    return (
      <aside
        aria-label="Contador de partida programada minimizado"
        onClick={handleToggleMinimize}
        className="fixed bottom-20 right-3 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1c123d] via-[#24154e] to-[#160b33] px-3.5 py-2 border-2 border-amber-400 text-amber-300 shadow-[0_4px_25px_rgba(245,158,11,0.55)] cursor-pointer active:scale-95 hover:scale-105 transition-all backdrop-blur-md"
      >
        <Crown className="w-4 h-4 fill-amber-300 text-amber-300 animate-pulse shrink-0" />
        <div className="flex flex-col">
          <span className="text-[9px] uppercase font-black text-amber-400 tracking-wider leading-none">
            {isStarted ? "¡EN VIVO!" : "TU PARTIDA"}
          </span>
          <span className="font-mono text-xs font-black tracking-wider text-white leading-tight">
            {isStarted ? (
              <span className="text-emerald-400 animate-pulse">¡Comenzó!</span>
            ) : (
              <>
                {days > 0 ? `${days}d ` : ""}
                {pad(hours)}:{pad(minutes)}:
                <span className="text-amber-300 font-extrabold">{pad(seconds)}</span>
              </>
            )}
          </span>
        </div>

        <button
          onClick={handleToggleMinimize}
          className="ml-1 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition"
          title="Expandir contador"
        >
          <Maximize2 className="w-3 h-3" />
        </button>

        <button
          onClick={handleDismiss}
          className="p-1 rounded-full bg-white/10 hover:bg-red-500/30 text-white/70 hover:text-white transition"
          title="Cerrar contador"
        >
          <X className="w-3 h-3" />
        </button>
      </aside>
    );
  }

  // EXPANDED VIEW: Rich, eye-catching luxury card with live countdown
  return (
    <aside
      aria-label="Contador de partida programada"
      onClick={handleOpenLobby}
      className="fixed bottom-20 right-3 z-40 w-[calc(100vw-24px)] max-w-[320px] rounded-3xl bg-gradient-to-b from-[#1e1342]/95 via-[#130b2e]/95 to-[#0a051c]/95 border-2 border-amber-400/80 p-3.5 text-white shadow-[0_12px_45px_rgba(245,158,11,0.4)] backdrop-blur-xl cursor-pointer hover:border-amber-300 active:scale-[0.99] transition-all animate-slide-up-soft"
    >
      {/* Decorative ambient gold glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/25 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
            <Crown className="w-3 h-3 fill-current" />
            {currentMatch.isVip ? "TORNEO VIP" : "PARTIDA"}
          </span>

          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {currentMatch.isHost ? "Tu Sala" : "¡Registrado!"}
          </span>
        </div>

        {/* Window controls (Minimize & Close) */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleMinimize}
            className="p-1 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition active:scale-90"
            title="Minimizar a botón flotante"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full bg-white/10 text-white/70 hover:text-red-400 hover:bg-white/20 transition active:scale-90"
            title="Cerrar contador"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Room Name & Schedule */}
      <div className="relative z-10 mb-2.5">
        <h4 className="text-sm font-black text-white truncate leading-tight tracking-tight">
          {currentMatch.name}
        </h4>
        <div className="text-[11px] text-amber-200/90 flex items-center gap-1.5 mt-0.5 font-medium">
          <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{formattedDate}</span>
        </div>
      </div>

      {/* Live Real-Time Digital Countdown */}
      {isStarted ? (
        <div className="relative z-10 my-2 rounded-2xl bg-gradient-to-r from-emerald-500/30 via-teal-500/25 to-emerald-500/30 border border-emerald-400/60 p-2.5 text-center">
          <span className="text-xs font-black uppercase text-emerald-300 tracking-wider block animate-pulse">
            ¡La partida ya está lista!
          </span>
          <span className="text-[11px] text-white/90 font-bold">
            Toca aquí para entrar a la sala ahora
          </span>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-4 gap-1.5 my-2">
          {/* Days */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-black/50 border border-amber-400/35 py-1.5 px-1 shadow-inner">
            <span className="font-mono text-base font-black text-amber-300 leading-none">
              {pad(days)}
            </span>
            <span className="text-[8px] font-extrabold uppercase text-white/60 tracking-wider mt-1">
              Días
            </span>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-black/50 border border-amber-400/35 py-1.5 px-1 shadow-inner">
            <span className="font-mono text-base font-black text-amber-300 leading-none">
              {pad(hours)}
            </span>
            <span className="text-[8px] font-extrabold uppercase text-white/60 tracking-wider mt-1">
              Horas
            </span>
          </div>

          {/* Minutes */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-black/50 border border-amber-400/35 py-1.5 px-1 shadow-inner">
            <span className="font-mono text-base font-black text-amber-300 leading-none">
              {pad(minutes)}
            </span>
            <span className="text-[8px] font-extrabold uppercase text-white/60 tracking-wider mt-1">
              Min
            </span>
          </div>

          {/* Seconds (pulsing live) */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-black/60 border-2 border-amber-400/70 py-1.5 px-1 shadow-[0_0_12px_rgba(245,158,11,0.35)]">
            <span className="font-mono text-base font-black text-yellow-300 leading-none animate-pulse">
              {pad(seconds)}
            </span>
            <span className="text-[8px] font-extrabold uppercase text-amber-400/80 tracking-wider mt-1">
              Seg
            </span>
          </div>
        </div>
      )}

      {/* Prize / Rounds pill if available */}
      {currentMatch.totalPrize && (
        <div className="relative z-10 flex items-center justify-between px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 mb-2 text-[10px]">
          <span className="text-white/60 font-medium flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400" />
            {currentMatch.roundsCount} {currentMatch.roundsCount === 1 ? "Ronda" : "Rondas"}
          </span>
          <span className="text-amber-300 font-black">
            Premio: {currentMatch.totalPrize}
          </span>
        </div>
      )}

      {/* Footer CTA */}
      <div className="relative z-10 flex items-center justify-between pt-1.5 border-t border-white/10 text-[11px] text-amber-300 font-bold group">
        <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          <Clock className="w-3 h-3" />
          Toca para entrar al Lobby
        </span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </aside>
  );
}
