import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { database } from "@/lib/firebase";
import { onValue, ref, update, remove, onDisconnect } from "firebase/database";
import {
  ArrowLeft,
  Users,
  Lock,
  LockOpen,
  Copy,
  Check,
  Play,
  Crown,
  LayoutGrid,
  Trophy,
  Zap,
  Sparkles,
  Timer,
  Share2,
  CircleDot,
  Plus,
  X,
  Calendar,
  Clock,
  Shield,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { getCard, DECK } from "@/lib/deck";
import { getCurrentUser } from "@/lib/auth";
import { getThemedCard } from "@/lib/deckSkins";
import { BrandBackground } from "@/components/BrandBackground";
import { MiniBoardIllustration } from "@/components/MiniBoardIllustration";
import { PapelPicado } from "@/components/Fiesta";

export const Route = createFileRoute("/mesa/$id/")({
  head: () => ({
    meta: [
      { title: "Mesa — Lotería La Garza" },
      { name: "description", content: "Detalles de la mesa creada en Lotería La Garza." },
    ],
  }),
  component: MesaPage,
});

type Size = "4x4" | "5x5";
type Mode = "normal" | "pozo" | "esquinas" | "sieteLoco" | "modoX";
type Status = "abierta" | "en-juego" | "terminada" | "programada";

interface Tabla {
  id: string;
  size: Size;
  cards: number[];
  createdAt: number;
}

interface Player {
  name: string;
  role: "host" | "guest" | "spectator";
  tablesCount?: number;
  ready?: boolean;
  status?: "active" | "disconnected" | "spectator";
  isVip?: boolean;
}

interface VipRound {
  id: string;
  roundNum: number;
  title: string;
  mode: Mode;
  prize: string;
}

interface RegisteredPlayer {
  id: string;
  name: string;
  status: "registrado" | "confirmado";
  addedAt: number;
}

interface Mesa {
  id: string;
  name: string;
  mode: Mode;
  size: Size;
  perPlayer: number;
  cost?: number;
  locked: boolean;
  password: string;
  tablaIds: string[];
  host: string;
  players: Record<string, Player>;
  status: Status;
  prizePool?: number;
  createdAt: number;
  isVip?: boolean;
  isScheduled?: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
  maxPlayers?: number;
  whitelistOnly?: boolean;
  registeredPlayers?: RegisteredPlayer[];
  rounds?: VipRound[];
  currentRound?: number;
  deck?: number[];
  drawnIdx?: number;
  winner?: any;
  serverPaused?: boolean;
}

const MESAS_KEY = "garza:mesas";
const TABLAS_KEY = "garza:tablas";

const MODE_META: Record<Mode, { label: string; hint: string; icon: React.ComponentType<{ className?: string }> }> = {
  normal: { label: "Normal", hint: "Línea, cuadro chico, 4 esquinas o llena", icon: Trophy },
  pozo: { label: "Pozo", hint: "Grupo al centro", icon: CircleDot },
  esquinas: { label: "4 Esquinas", hint: "Las cuatro esquinas", icon: LayoutGrid },
  sieteLoco: { label: "7 Loco", hint: "Patrón de 7 cartas", icon: Zap },
  modoX: { label: "Modo X", hint: "Forma una X", icon: X },
};

const STATUS_META: Record<Status, { label: string; color: string }> = {
  abierta: { label: "Abierta", color: "var(--brand-cyan)" },
  "en-juego": { label: "En juego", color: "var(--brand-gold)" },
  terminada: { label: "Terminada", color: "var(--brand-pink)" },
  programada: { label: "Programada", color: "#F59E0B" },
};

function loadTablas(): Tabla[] {
  try {
    const raw = localStorage.getItem(TABLAS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Tabla[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function randomCards(size: Size): number[] {
  const total = size === "4x4" ? 16 : 25;
  const pool = Array.from({ length: 54 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, total);
}

function shuffleCards(pool: number[]): number[] {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function MesaPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [tablas, setTablas] = useState<Tabla[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isChangingMode, setIsChangingMode] = useState(false);
  const [isChangingTablas, setIsChangingTablas] = useState(false);
  const [tempSelectedTablas, setTempSelectedTablas] = useState<string[]>([]);

  // Verificación de identidad: si entra por enlace sin cuenta ni nombre, redirigir a inicio
  const user = getCurrentUser();
  const storedName = typeof window !== "undefined" ? localStorage.getItem("garza:name") : null;
  const isSessionActive = typeof window !== "undefined" && sessionStorage.getItem("garza:session_active") === "true";
  const hasIdentity = Boolean(
    (user && user.email) ||
    (isSessionActive && storedName && storedName.trim().length > 0 && storedName !== "Jugador" && storedName !== "Invitado")
  );

  useEffect(() => {
    if (!hasIdentity) {
      navigate({
        to: "/",
        search: { redirect: `/mesa/${id}` },
      });
    }
  }, [hasIdentity, id, navigate]);

  const myName = (user?.name || storedName || "Jugador").trim();
  const playersList = Object.values(mesa?.players || {});
  const me = playersList.find((p) => p.name === myName);
  const isHostInLobby = Boolean(
    (typeof window !== "undefined" && (sessionStorage.getItem(`garza:host:${id}`) === "true" || localStorage.getItem(`garza:host:${id}`) === "true")) &&
    mesa?.host === myName
  );

  useEffect(() => {
    setTablas(loadTablas());

    const mesaRef = ref(database, `mesas/${id}`);
    const unsubscribe = onValue(mesaRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (!data.players) data.players = {};
        setMesa(data as Mesa);
      } else {
        setMesa(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  // Auto-redirect guests to game when started
  useEffect(() => {
    if (mesa?.status === "en-juego") {
      navigate({ to: "/mesa/$id/jugar", params: { id: mesa.id } });
    }
  }, [mesa?.status, mesa?.id, navigate]);

  // Register player in room
  useEffect(() => {
    if (mesa && myName && id) {
      const isGameAlreadyActive = Boolean(
        mesa.status === "en-juego" && (mesa.drawnIdx ?? -1) >= 0 && !mesa.winner
      );

      const playerRef = ref(database, `mesas/${id}/players/${myName}`);
      update(playerRef, {
        name: myName,
        role: isGameAlreadyActive ? "spectator" : (mesa.host === myName ? "host" : "guest"),
        status: isGameAlreadyActive ? "spectator" : "active",
      }).catch(() => { });

      if (!isGameAlreadyActive) {
        try {
          localStorage.setItem(`garza:registered:${id}`, "true");
          sessionStorage.setItem(`garza:registered:${id}`, "true");
        } catch { }
      }

      // En el lobby, si el jugador cierra la ventana antes de que inicie la partida, se limpia su lugar
      let discRef: any = null;
      let roomDiscRef: any = null;
      if (mesa.status === "abierta") {
        discRef = onDisconnect(playerRef);
        discRef.remove();
        if (isHostInLobby) {
          roomDiscRef = onDisconnect(ref(database, `mesas/${id}`));
          roomDiscRef.remove();
        }
      }

      return () => {
        if (discRef) discRef.cancel();
        if (roomDiscRef) roomDiscRef.cancel();
      };
    }
  }, [mesa?.id, myName, id, mesa?.host, mesa?.status, mesa?.drawnIdx, mesa?.winner, isHostInLobby]);

  // Cargar tablas del jugador sin inventar barajas si no existen
  useEffect(() => {
    if (!mesa) return;
    const currentTablas = loadTablas();
    const matching = currentTablas.filter((t) => t.size === mesa.size);
    setTablas(currentTablas);

    // Si tiene tablas pero aún no ha elegido con cuántas jugar, abrir selector
    const savedExisting = localStorage.getItem(`garza:selectedTablas:${id}`);
    if (!savedExisting && matching.length > 0) {
      setIsChangingTablas(true);
    }
  }, [mesa?.size, mesa?.perPlayer, id]);

  const mesaTablas = useMemo(() => {
    if (!mesa) return [];
    try {
      const saved = localStorage.getItem(`garza:selectedTablas:${id}`);
      if (saved) {
        const ids = JSON.parse(saved) as string[];
        const found = ids.map((tid) => tablas.find((t) => t.id === tid)).filter((t): t is Tabla => Boolean(t));
        if (found.length > 0) return found.slice(0, mesa.perPlayer || 2);
      }
    } catch { }

    const matching = tablas.filter((t) => t.size === mesa.size);
    if (matching.length > 0) {
      return matching.slice(0, mesa.perPlayer);
    }

    return (mesa.tablaIds || [])
      .map((tid) => tablas.find((t) => t.id === tid))
      .filter((t): t is Tabla => Boolean(t));
  }, [mesa, tablas, id]);

  // Check whitelist if enabled
  const isWhitelisted = useMemo(() => {
    if (!mesa?.whitelistOnly || isHostInLobby) return true;
    if (!mesa.registeredPlayers || mesa.registeredPlayers.length === 0) return true;
    return mesa.registeredPlayers.some(
      (p) => p.name.trim().toLowerCase() === myName.trim().toLowerCase()
    );
  }, [mesa?.whitelistOnly, mesa?.registeredPlayers, isHostInLobby, myName]);

  function copyCode() {
    if (!mesa) return;
    const code = mesa.id.slice(0, 6).toUpperCase();
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { }
  }

  async function startGame() {
    if (!mesa) return;
    if (mesaTablas.length === 0) {
      alert("Aún no tienes barajas creadas para jugar. Por favor crea al menos una baraja primero.");
      setIsChangingTablas(true);
      return;
    }
    try {
      const mesaRef = ref(database, `mesas/${id}`);
      const initialDeck = shuffleCards(DECK.map((c) => c.n));
      await update(mesaRef, {
        status: "en-juego",
        serverPaused: true,
        deck: initialDeck,
        drawnIdx: -1,
        winner: null,
      });
      navigate({ to: "/mesa/$id/jugar", params: { id: mesa.id } });
    } catch (e) {
      console.error(e);
    }
  }

  async function updateMode(newMode: Mode) {
    if (!mesa) return;
    try {
      await update(ref(database, `mesas/${id}`), { mode: newMode });
      setIsChangingMode(false);
    } catch (e) {
      console.error(e);
    }
  }

  async function saveSelectedTablas() {
    if (!mesa) return;
    if (tempSelectedTablas.length === 0 || tempSelectedTablas.length > mesa.perPlayer) {
      alert(`Debes seleccionar entre 1 y ${mesa.perPlayer} tablas.`);
      return;
    }
    try {
      localStorage.setItem(`garza:selectedTablas:${id}`, JSON.stringify(tempSelectedTablas));
      await update(ref(database, `mesas/${id}/players/${myName}`), {
        tablesCount: tempSelectedTablas.length,
        ready: true,
      });
      setIsChangingTablas(false);
    } catch (e) {
      console.error(e);
    }
  }

  function toggleTempTabla(tablaId: string) {
    if (!mesa) return;
    setTempSelectedTablas((prev) => {
      if (prev.includes(tablaId)) return prev.filter((x) => x !== tablaId);
      if (prev.length >= mesa.perPlayer) return [...prev.slice(1), tablaId];
      return [...prev, tablaId];
    });
  }

  function openTablasModal() {
    if (!mesa) return;
    try {
      const saved = localStorage.getItem(`garza:selectedTablas:${id}`);
      if (saved) {
        setTempSelectedTablas(JSON.parse(saved));
      } else {
        const matching = tablas.filter((t) => t.size === mesa.size);
        setTempSelectedTablas(matching.slice(0, Math.min(2, mesa.perPlayer)).map((t) => t.id));
      }
    } catch {
      setTempSelectedTablas([]);
    }
    setIsChangingTablas(true);
  }

  if (loading) {
    return (
      <BrandBackground>
        <div className="grid min-h-screen place-items-center text-white/70">Cargando…</div>
      </BrandBackground>
    );
  }

  if (!mesa) {
    return (
      <BrandBackground>
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <LayoutGrid className="h-7 w-7 text-white/70" />
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-white">Mesa no encontrada</h1>
          <p className="mt-2 text-sm text-white/70">Es posible que haya sido eliminada.</p>
          <Link
            to="/menu"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-bold text-white shadow-[var(--shadow-card)] ring-1 ring-white/25"
            style={{ background: "var(--gradient-brand)" }}
          >
            Volver al menú
          </Link>
        </div>
      </BrandBackground>
    );
  }

  const ModeIcon = MODE_META[mesa.mode]?.icon || Trophy;
  const status = STATUS_META[mesa.status] || { label: mesa.status, color: "var(--brand-cyan)" };
  const code = mesa.id.slice(0, 6).toUpperCase();

  function handleExitLobby() {
    if (isHostInLobby) {
      // Si el anfitrión sale del lobby, la partida desaparece por completo
      remove(ref(database, `mesas/${id}`)).catch(() => {});
    } else {
      remove(ref(database, `mesas/${id}/players/${myName}`)).catch(() => {});
    }
    try {
      localStorage.removeItem(`garza:host:${id}`);
      sessionStorage.removeItem(`garza:host:${id}`);
      localStorage.removeItem(`garza:registered:${id}`);
      sessionStorage.removeItem(`garza:registered:${id}`);
      localStorage.removeItem(`garza:selectedTablas:${id}`);
    } catch {}
    navigate({ to: "/menu" });
  }

  return (
    <BrandBackground>
      <PapelPicado count={7} />
      <header className="relative z-30 flex items-center justify-between gap-3 px-4 pt-16">
        <button
          type="button"
          aria-label="Volver"
          onClick={handleExitLobby}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-[color:var(--brand-gold)]/40 backdrop-blur transition hover:bg-white/20 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>

        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white ring-1 ring-[color:var(--brand-gold)]/40 backdrop-blur">
          <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: status.color }} />
          {mesa.isVip ? `👑 SALA VIP • ${status.label}` : status.label}
        </span>
        <div className="h-11 w-11" />
      </header>

      <main className="relative z-10 mx-auto w-full max-w-md px-5 pb-36 pt-4 space-y-4">
        {/* Header card */}
        <section
          className={`animate-slide-up-soft relative overflow-hidden rounded-3xl p-5 text-white shadow-[var(--shadow-card)] ring-1 ${mesa.isVip
              ? "bg-gradient-to-br from-[#241a45] via-[#1a1236] to-[#2d1b0a] border-2 border-amber-400/50 ring-amber-400/30 shadow-[0_10px_35px_rgba(245,158,11,0.25)]"
              : "ring-white/15"
            }`}
          style={mesa.isVip ? {} : { background: "var(--gradient-brand)" }}
        >
          {mesa.isVip && (
            <div className="absolute top-0 right-0 px-3 py-1 bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-bl-xl shadow-md flex items-center gap-1">
              <Crown className="w-3 h-3 fill-current" /> Evento VIP
            </div>
          )}

          <div className="flex items-start justify-between gap-3 pt-1">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] uppercase tracking-[0.22em] text-white/60">
                {mesa.isVip ? "Sala VIP" : "Mesa"}
              </span>
              <h1 className="mt-1 truncate text-2xl font-extrabold">{mesa.name}</h1>
              <div className="mt-2 flex items-center gap-2 text-xs text-white/75">
                <Crown className="h-3.5 w-3.5 text-[color:var(--brand-gold)]" />
                <span>Host: {mesa.host}</span>
              </div>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur shrink-0">
              <ModeIcon className="h-5 w-5 text-amber-300" />
            </div>
          </div>

          <div className={`mt-5 grid ${isHostInLobby ? "grid-cols-2" : "grid-cols-1"} gap-2 text-center`}>
            {isHostInLobby && (
              <button
                onClick={() => setIsChangingMode(true)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-2 py-3 ring-1 ring-white/15 backdrop-blur hover:bg-white/20 active:scale-95 transition-all text-sm font-bold text-white shadow-sm"
              >
                <Zap className="w-4 h-4 text-white/70" />
                Cambiar modo
              </button>
            )}
            <button
              onClick={openTablasModal}
              className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-2 py-3 ring-1 ring-white/15 backdrop-blur hover:bg-white/20 active:scale-95 transition-all text-sm font-bold text-white shadow-sm"
            >
              <LayoutGrid className="w-4 h-4 text-white/70" />
              Cambiar tablas ({mesaTablas.length}/{mesa.perPlayer})
            </button>
          </div>
        </section>

        {/* VIP 0-Ads Guarantee Pill for All Players */}
        {mesa.isVip && (
          <div className="rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-transparent border border-emerald-400/40 p-3.5 flex items-center gap-3 text-xs text-white shadow-md">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-black text-emerald-300 block text-[10px] uppercase tracking-wider">
                Garantía Sala VIP • 0 Anuncios
              </span>
              <span className="text-[11px] text-white/80">
                Esta sala es 100% libre de anuncios para ti y para todos los invitados.
              </span>
            </div>
          </div>
        )}

        {/* Scheduled Info Banner */}
        {mesa.isVip && mesa.isScheduled && mesa.scheduledDate && (
          <section className="rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-transparent border border-amber-400/40 p-4 shadow-lg text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                  Fecha y Hora Programada
                </span>
                <span className="text-sm font-bold text-white">
                  {mesa.scheduledDate} a las {mesa.scheduledTime} hrs
                </span>
              </div>
            </div>
          </section>
        )}

        {/* VIP Rounds and Prizes */}
        {mesa.isVip && mesa.rounds && mesa.rounds.length > 0 && (
          <section className="rounded-3xl bg-white/[0.04] p-4 border border-amber-400/30 shadow-lg text-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Trophy className="w-4 h-4" /> Rondas del Torneo ({mesa.rounds.length})
              </h2>
            </div>
            <div className="space-y-2">
              {mesa.rounds.map((r, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-[10px] shrink-0">
                      {r.roundNum || idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white leading-tight truncate">{r.title}</div>
                      <div className="text-[10px] text-white/50 capitalize">Modo: {r.mode}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-[10px] text-white/50 block font-semibold">Premio</span>
                    <span className="text-amber-300 font-black text-xs">{r.prize}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Whitelist / Invitation Status */}
        {mesa.isVip && mesa.whitelistOnly && (
          <section className="rounded-2xl bg-white/[0.04] p-3.5 border border-white/10 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-white/80 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" /> Control de Acceso
              </span>
              <span className="text-[10px] text-white/50">
                {mesa.registeredPlayers?.length || 0} pre-registrados
              </span>
            </div>
            {isWhitelisted ? (
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs mt-1">
                <Check className="w-4 h-4 shrink-0" />
                <span>Estás registrado en la lista de invitados VIP.</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs mt-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Esta sala es exclusiva para invitados pre-registrados por el anfitrión.</span>
              </div>
            )}
          </section>
        )}

        {/* Access Code */}
        <section className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
            {mesa.locked ? (
              <Lock className="h-4 w-4 text-[color:var(--brand-gold)]" />
            ) : (
              <LockOpen className="h-4 w-4 text-[color:var(--brand-cyan)]" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-white/50">
              {mesa.locked ? "Mesa privada" : "Mesa pública"}
            </div>
            <div className="font-mono text-lg font-extrabold tracking-[0.2em] text-white">{code}</div>
          </div>
          <button
            type="button"
            onClick={copyCode}
            className="grid h-11 w-11 place-items-center rounded-full bg-white/10 ring-1 ring-white/15 transition hover:bg-white/20 active:scale-95"
            aria-label="Copiar código"
          >
            {copied ? (
              <Check className="h-4 w-4 text-[color:var(--brand-cyan)]" />
            ) : (
              <Copy className="h-4 w-4 text-white/80" />
            )}
          </button>
        </section>

        {/* Invite friends */}
        <section>
          <button
            onClick={async () => {
              try {
                const inviteText = mesa.isVip
                  ? `¡Estás invitado a la Sala VIP "${mesa.name}" de Lotería La Garza!`
                  : `¡Únete a mi mesa de Lotería!`;
                if (navigator.share) {
                  await navigator.share({
                    title: mesa.name,
                    text: inviteText,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("¡Enlace copiado al portapapeles!");
                }
              } catch (e) { }
            }}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold py-3.5 rounded-2xl border border-white/20 shadow-lg active:scale-95 transition-all text-sm"
          >
            <Share2 className="w-4 h-4" /> Invitar amigos
          </button>
        </section>

        {/* Players List */}
        <section className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-white/70" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">
                Jugadores en la Sala
              </h2>
            </div>
            <span className="text-xs text-white/50 font-bold">
              {playersList.length}/{mesa.maxPlayers || 4}
            </span>
          </div>
          <div className="space-y-2">
            {playersList.map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--brand-cyan)] text-lg font-bold text-[color:var(--brand-navy-deep)]">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-1 flex-col truncate">
                  <span className="font-bold text-white truncate">{p.name}</span>
                  <span className="text-[11px] text-white/50">
                    {p.role === "host" ? "Anfitrión" : "Invitado"} {p.tablesCount ? `• ${p.tablesCount} tablas` : ""}
                  </span>
                </div>
                {p.role === "host" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-gold)/.2] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--brand-gold)] ring-1 ring-[color:var(--brand-gold)/.4]">
                    <Crown className="h-3 w-3" /> Anfitrión
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Tablas Preview */}
        <section className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-white/70" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">
                Tus tablas
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-300 font-bold">
                {mesaTablas.length} {mesaTablas.length === 1 ? "tabla" : "tablas"} (Límite: {mesa.perPlayer})
              </span>
              <button
                type="button"
                onClick={openTablasModal}
                className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg border border-white/15 transition active:scale-95"
              >
                Cambiar
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {mesaTablas.map((t, i) => (
              <div
                key={t.id}
                className="relative overflow-hidden rounded-2xl bg-white/5 p-3 ring-1 ring-white/10"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                    Tabla {i + 1}
                  </span>
                  <span className="text-[10px] text-white/40">{t.size}</span>
                </div>
                <TablaPreview cards={t.cards} size={t.size} />
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[oklch(0.10_0.09_262)/.90] px-5 pb-5 pt-3 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-md items-center gap-3">
          <button
            type="button"
            onClick={handleExitLobby}
            className="h-12 flex-1 rounded-full bg-white/10 text-sm font-semibold text-white/85 ring-1 ring-white/15 transition hover:bg-white/15 active:scale-[0.98]"
          >
            Menú
          </button>

          {isHostInLobby ? (
            <button
              type="button"
              onClick={startGame}
              className={`flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-full text-sm font-black text-white shadow-lg active:scale-[0.98] transition ${mesa.isVip
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                  : "bg-gradient-to-r from-[color:var(--brand-cyan)] to-blue-600 text-white"
                }`}
            >
              <Play className="h-4 w-4 fill-current" />
              {mesa.status === "programada" ? "Iniciar Evento VIP" : "Iniciar partida"}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-full text-xs font-bold text-white/50 bg-white/5 border border-white/10 cursor-not-allowed"
            >
              <Timer className="h-4 w-4 animate-spin text-amber-400" />
              {mesa.status === "programada" ? "En espera del anfitrión" : "Esperando inicio..."}
            </button>
          )}
        </div>
      </div>

      {/* Change Mode Modal */}
      {isChangingMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#140e2b] p-5 border border-white/20 text-white">
            <h3 className="text-base font-black text-white mb-3">Cambiar modo de juego</h3>
            <div className="space-y-2">
              {(["normal", "pozo", "esquinas", "sieteLoco", "modoX"] as Mode[]).map((m) => {
                const meta = MODE_META[m];
                return (
                  <button
                    key={m}
                    onClick={() => updateMode(m)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left text-xs font-bold transition ${mesa.mode === m
                        ? "bg-amber-400/20 border-amber-400 text-amber-300"
                        : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                      }`}
                  >
                    <span>{meta.label}</span>
                    <span className="text-[10px] text-white/50">{meta.hint}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setIsChangingMode(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-white/10 text-xs font-bold text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Change Tablas Modal */}
      {isChangingTablas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#140e2b] p-5 border border-white/20 text-white max-h-[85vh] flex flex-col shadow-2xl">
            {tablas.filter((t) => t.size === mesa.size).length === 0 ? (
              <div className="text-center py-6 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center mx-auto mb-3 border border-amber-400/30">
                  <LayoutGrid className="w-7 h-7" />
                </div>
                <h4 className="text-base font-black text-white mb-1">¡No tienes barajas creadas!</h4>
                <p className="text-xs text-white/60 mb-5 max-w-xs leading-relaxed">
                  Esta partida requiere barajas de tamaño <strong className="text-amber-300">{mesa.size}</strong>. Para jugar debes crear primero tu baraja en &ldquo;Mis Barajas&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/" })}
                  className="btn-gold px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Mi Primera Baraja</span>
                </button>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <h3 className="text-base font-black text-white leading-tight">¿Con cuántas barajas quieres jugar?</h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Elige cuántas barajas usarás ({tempSelectedTablas.length}/{mesa.perPlayer})
                  </p>
                </div>

                {/* Quick Count Selector */}
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {Array.from({ length: Math.min(tablas.filter((t) => t.size === mesa.size).length, mesa.perPlayer || 2) }, (_, i) => i + 1).map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => {
                        const matching = tablas.filter((t) => t.size === mesa.size);
                        setTempSelectedTablas(matching.slice(0, qty).map((t) => t.id));
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-black border transition ${
                        tempSelectedTablas.length === qty
                          ? "bg-amber-400 text-slate-950 border-amber-300 shadow"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {qty} {qty === 1 ? "Baraja" : "Barajas"}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {tablas
                    .filter((t) => t.size === mesa.size)
                    .map((t, idx) => {
                      const isSelected = tempSelectedTablas.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleTempTabla(t.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition ${isSelected
                              ? "bg-amber-400/20 border-amber-400 text-amber-300"
                              : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                            }`}
                        >
                          <span>Baraja #{idx + 1} ({t.size})</span>
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </button>
                      );
                    })}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsChangingTablas(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition"
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={saveSelectedTablas}
                    disabled={tempSelectedTablas.length === 0}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs disabled:opacity-50 transition"
                  >
                    Confirmar Barajas
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </BrandBackground>
  );
}

function TablaPreview({ cards, size }: { cards: number[]; size: Size }) {
  const cols = size === "4x4" ? 4 : 5;
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {cards.map((c, i) => {
        const card = getThemedCard(c);
        return (
          <div key={i} className="relative aspect-[3/4] overflow-hidden rounded ring-1 ring-white/10">
            {card ? (
              <img
                src={card.image}
                alt={card.name}
                decoding="async"
                onError={(e) => {
                  if (card?.fallbackImage && e.currentTarget.src !== card.fallbackImage) {
                    e.currentTarget.src = card.fallbackImage;
                  }
                }}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-white/10 text-[8px] text-white/50">
                {c}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}