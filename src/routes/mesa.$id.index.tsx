import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { database } from "@/lib/firebase";
import { onValue, ref, update, remove } from "firebase/database";
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
  X,
} from "lucide-react";
import { getCard } from "@/lib/deck";
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
type Status = "abierta" | "en-juego" | "terminada";

interface Tabla {
  id: string;
  size: Size;
  cards: number[];
  createdAt: number;
}

interface Player {
  name: string;
  role: "host" | "guest";
  tablesCount: number;
  ready: boolean;
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
}

const MESAS_KEY = "garza:mesas";
const TABLAS_KEY = "garza:tablas";

const MODE_META: Record<Mode, { label: string; hint: string; icon: React.ComponentType<{ className?: string }> }> = {
  normal: { label: "Normal", hint: "Llena la tabla o línea", icon: Trophy },
  pozo: { label: "Pozo", hint: "Grupo al centro", icon: CircleDot },
  esquinas: { label: "4 Esquinas", hint: "Las cuatro esquinas", icon: LayoutGrid },
  sieteLoco: { label: "7 Loco", hint: "Patrón de 7 cartas", icon: Zap },
  modoX: { label: "Modo X", hint: "Forma una X", icon: X },
};

const STATUS_META: Record<Status, { label: string; color: string }> = {
  abierta: { label: "Abierta", color: "var(--brand-cyan)" },
  "en-juego": { label: "En juego", color: "var(--brand-gold)" },
  terminada: { label: "Terminada", color: "var(--brand-pink)" },
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

  const myName = typeof window !== "undefined" ? localStorage.getItem("garza:name") || "Jugador" : "Jugador";
  const playersList = Object.values(mesa?.players || {});
  const me = playersList.find((p) => p.name === myName);
  const isHostInLobby = (me?.role === "host") || (typeof window !== "undefined" && localStorage.getItem(`garza:host:${id}`) === "true") || mesa?.host === myName;

  useEffect(() => {
    setTablas(loadTablas());
    
    const mesaRef = ref(database, `mesas/${id}`);
    const unsubscribe = onValue(mesaRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Ensure players object exists
        if (!data.players) data.players = {};
        setMesa(data as Mesa);
      } else {
        setMesa(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (mesa && myName && id) {
      const playerRef = ref(database, `mesas/${id}/players/${myName}`);
      update(playerRef, {
        name: myName,
        role: mesa.host === myName ? "host" : "guest",
      });
    }
  }, [mesa?.id, myName, id, mesa?.host]);

  const mesaTablas = useMemo(() => {
    if (!mesa) return [];
    return mesa.tablaIds
      .map((tid) => tablas.find((t) => t.id === tid))
      .filter((t): t is Tabla => Boolean(t));
  }, [mesa, tablas]);

  function copyCode() {
    if (!mesa) return;
    const code = mesa.id.slice(0, 6).toUpperCase();
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  async function startGame() {
    if (!mesa) return;
    try {
      const mesaRef = ref(database, `mesas/${id}`);
      await update(mesaRef, { status: "en-juego" });
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

  async function updateTablas() {
    if (!mesa || tempSelectedTablas.length === 0 || tempSelectedTablas.length > mesa.perPlayer) return;
    try {
      localStorage.setItem(`garza:selectedTablas:${id}`, JSON.stringify(tempSelectedTablas));
      await update(ref(database, `mesas/${id}/players/${myName}`), { tablesCount: tempSelectedTablas.length, ready: true });
      setIsChangingTablas(false);
    } catch (e) {
      console.error(e);
    }
  }

  function toggleTempTabla(tablaId: string) {
    if (!mesa) return;
    setTempSelectedTablas(prev => {
      if (prev.includes(tablaId)) return prev.filter(x => x !== tablaId);
      if (prev.length >= mesa.perPlayer) return [...prev.slice(1), tablaId];
      return [...prev, tablaId];
    });
  }

  function openTablasModal() {
    if (!mesa) return;
    try {
      const saved = localStorage.getItem(`garza:selectedTablas:${id}`);
      setTempSelectedTablas(saved ? JSON.parse(saved) : []);
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

  const ModeIcon = MODE_META[mesa.mode].icon;
  const status = STATUS_META[mesa.status];
  const code = mesa.id.slice(0, 6).toUpperCase();

  return (
    <BrandBackground>
      <PapelPicado count={7} />
      <header className="relative z-30 flex items-center justify-between gap-3 px-4 pt-16">
        <button
          type="button"
          aria-label="Volver"
          onClick={() => navigate({ to: "/menu" })}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-[color:var(--brand-gold)]/40 backdrop-blur transition hover:bg-white/20 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white ring-1 ring-[color:var(--brand-gold)]/40 backdrop-blur"
        >
          <span
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ background: status.color }}
          />
          {status.label}
        </span>
        <div className="h-11 w-11" />
      </header>

      <main className="relative z-10 mx-auto w-full max-w-md px-5 pb-32 pt-4">
        {/* Header card */}
        <section
          className="animate-slide-up-soft relative overflow-hidden rounded-3xl p-5 text-white shadow-[var(--shadow-card)] ring-1 ring-white/15"
          style={{ background: "var(--gradient-brand)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] uppercase tracking-[0.22em] text-white/60">Mesa</span>
              <h1 className="mt-1 truncate text-2xl font-extrabold">{mesa.name}</h1>
              <div className="mt-2 flex items-center gap-2 text-xs text-white/75">
                <Crown className="h-3.5 w-3.5 text-[color:var(--brand-gold)]" />
                <span>{mesa.host}</span>
              </div>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
              <ModeIcon className="h-5 w-5" />
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
              Cambiar tablas
            </button>
          </div>
        </section>

        {/* Access */}
        <section className="animate-slide-up-soft mt-4 flex items-center gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
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
        <section className="animate-slide-up-soft mt-4">
          <button 
            onClick={async () => {
              try {
                if (navigator.share) {
                  await navigator.share({
                    title: "Lotería La Garza",
                    text: `¡Únete a mi mesa de Lotería!`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("¡Enlace copiado al portapapeles!");
                }
              } catch (e) {}
            }}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold py-3.5 rounded-2xl border border-white/20 shadow-lg active:scale-95 transition-all"
          >
            <Share2 className="w-5 h-5" /> Invitar amigos
          </button>
        </section>

        {/* Players */}
        <section className="animate-slide-up-soft mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-white/70" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">
                Jugadores
              </h2>
            </div>
            <span className="text-xs text-white/50">{playersList.length}</span>
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
                  <span className="text-[11px] text-white/50">{p.role === "host" ? "Anfitrión" : "Invitado"} {p.tablesCount ? `• ${p.tablesCount} tablas` : ''}</span>
                </div>
                {p.role === "host" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-gold)/.2] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--brand-gold)] ring-1 ring-[color:var(--brand-gold)/.4]">
                    <Crown className="h-3 w-3" /> Anfitrión
                  </span>
                )}
              </div>
            ))}
            {Array.from({ length: Math.max(0, 4 - playersList.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-white/40"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white/5 ring-1 ring-white/10">
                  <Timer className="h-4 w-4" />
                </div>
                <span className="text-xs italic">Esperando jugador…</span>
              </div>
            ))}
          </div>
        </section>

        {/* Tablas */}
        <section className="animate-slide-up-soft mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-white/70" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">
                Tus tablas
              </h2>
            </div>
            <span className="text-xs text-white/50">
              {mesaTablas.length}/{mesa.perPlayer}
            </span>
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
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[oklch(0.10_0.09_262)/.85] px-5 pb-5 pt-3 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-md items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/menu" })}
            className="h-12 flex-1 rounded-full bg-white/10 text-sm font-semibold text-white/85 ring-1 ring-white/15 transition hover:bg-white/15 active:scale-[0.98]"
          >
            Menú
          </button>
          <button
            type="button"
            onClick={startGame}
            disabled={mesa.status !== "abierta"}
            className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-full text-sm font-bold text-white shadow-[var(--shadow-card)] ring-1 ring-white/25 transition hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Play className="h-4 w-4" />
            {mesa.status === "abierta" ? "Iniciar partida" : "En juego"}
          </button>
        </div>
      </div>

      {/* MODALS */}
      {isChangingMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-pop-in">
          <div className="bg-[color:var(--brand-navy-deep)] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Cambiar Modo</h3>
              <button onClick={() => setIsChangingMode(false)} className="text-white/50 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3">
              {(Object.entries(MODE_META) as [Mode, typeof MODE_META[Mode]][]).map(([modeKey, meta]) => (
                <button
                  key={modeKey}
                  onClick={() => updateMode(modeKey)}
                  className={`w-full flex items-center gap-4 rounded-2xl p-4 text-left transition-all ${mesa.mode === modeKey ? 'bg-white/10 ring-2 ring-[color:var(--brand-cyan)] shadow-md' : 'bg-white/5 ring-1 ring-white/10 hover:bg-white/10 active:scale-95'}`}
                >
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${mesa.mode === modeKey ? 'bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)]' : 'bg-white/10 text-white'}`}>
                    <meta.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-base">{meta.label}</div>
                    <div className="text-xs text-white/60">{meta.hint}</div>
                  </div>
                  <MiniBoardIllustration mode={modeKey as Mode} active={mesa.mode === modeKey} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isChangingTablas && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[color:var(--brand-navy-deep)] animate-slide-up-soft">
          <header className="flex items-center justify-between px-4 py-4 bg-black/20 border-b border-white/10 shrink-0">
            <button onClick={() => setIsChangingTablas(false)} className="p-2 text-white/70 hover:text-white"><ArrowLeft className="w-6 h-6" /></button>
            <div className="flex flex-col items-center">
              <h2 className="text-white font-bold text-lg leading-tight">Cambiar Tablas</h2>
              <span className="text-[10px] text-[color:var(--brand-cyan)] uppercase tracking-wider">Elige {mesa.perPlayer} {mesa.perPlayer === 1 ? 'tabla' : 'tablas'}</span>
            </div>
            <button 
              onClick={updateTablas}
              disabled={tempSelectedTablas.length !== mesa.perPlayer}
              className="px-3 py-1.5 rounded-full text-xs font-bold text-white disabled:opacity-50 disabled:bg-white/10 transition-all shadow-md"
              style={{ background: tempSelectedTablas.length === mesa.perPlayer ? "var(--gradient-brand)" : undefined }}
            >
              Guardar
            </button>
          </header>
          
          <div className="flex-1 overflow-y-auto p-4">
            {tablas.filter(t => t.size === mesa.size).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-70">
                <LayoutGrid className="w-12 h-12 mb-4 text-white/50" />
                <p className="text-white font-bold mb-2">No tienes tablas de tamaño {mesa.size}</p>
                <p className="text-sm text-white/60">Ve al menú principal y crea algunas tablas nuevas para poder jugar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 pb-32">
                {tablas.filter(t => t.size === mesa.size).map((t, i) => {
                  const isSelected = tempSelectedTablas.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTempTabla(t.id)}
                      className={`relative flex flex-col items-center rounded-3xl p-3 ring-1 transition-all active:scale-[0.98] ${
                        isSelected
                          ? "bg-[color:var(--brand-cyan)]/10 ring-[color:var(--brand-cyan)] shadow-[0_0_15px_rgba(0,255,255,0.2)] scale-[1.02]"
                          : "bg-white/5 ring-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="mb-2 flex w-full items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">
                          Tabla {i + 1}
                        </span>
                        <div
                          className={`grid h-5 w-5 place-items-center rounded-full border ${
                            isSelected
                              ? "border-[color:var(--brand-cyan)] bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)]"
                              : "border-white/20 bg-black/20"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                      <TablaPreview cards={t.cards} size={t.size} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </BrandBackground>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-2 py-2 ring-1 ring-white/15 backdrop-blur">
      <div className="text-[10px] uppercase tracking-wider text-white/60">{label}</div>
      <div className="mt-0.5 text-sm font-extrabold text-white">{value}</div>
    </div>
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
        const card = getCard(c);
        return (
          <div key={i} className="relative aspect-[3/4] ring-1 ring-white/10">
            <img
              src={card?.image}
              alt={card?.name ?? `Carta ${c}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}